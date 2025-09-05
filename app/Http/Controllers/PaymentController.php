<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceProduct;
use App\Models\MarketplacePurchase;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * Crear intención de pago (OPTIMIZADO para Octane)
     */
    public function createPaymentIntent(Request $request, MarketplaceProduct $product)
    {
        try {
            $validated = $request->validate([
                'currency' => 'sometimes|string|in:USD,EUR,GBP',
            ]);

            // Verificar que el producto esté disponible
            if (!$product->is_available) {
                return response()->json([
                    'success' => false,
                    'error' => 'Este producto no está disponible para compra'
                ], 400);
            }

            // Verificar que el usuario no sea el vendedor
            if (Auth::id() === $product->seller_id) {
                return response()->json([
                    'success' => false,
                    'error' => 'No puedes comprar tu propio producto'
                ], 400);
            }

            // Verificar si ya compró este producto
            $existingPurchase = MarketplacePurchase::where('buyer_id', Auth::id())
                                                  ->where('product_id', $product->id)
                                                  ->whereIn('status', ['completed', 'paid', 'processing'])
                                                  ->first();

            if ($existingPurchase) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ya has comprado este producto'
                ], 400);
            }

            // Crear payment intent
            $result = $this->paymentService->createPaymentIntent(
                $product,
                Auth::id(),
                $validated['currency'] ?? 'USD'
            );

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'client_secret' => $result['client_secret'],
                'purchase_id' => $result['purchase_id'],
                'order_number' => $result['order_number'],
                'amount' => $result['amount'],
                'currency' => $result['currency'],
                'product' => [
                    'id' => $product->id,
                    'title' => $product->title,
                    'price' => $product->formatted_price,
                    'seller' => $product->seller->username,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'product_id' => $product->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al procesar la solicitud de pago'
            ], 500);
        }
    }

    /**
     * Confirmar pago completado
     */
    public function confirmPayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'payment_intent_id' => 'required|string',
            ]);

            $result = $this->paymentService->confirmPayment($validated['payment_intent_id']);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'purchase' => [
                    'id' => $result['purchase']->id,
                    'order_number' => $result['purchase']->order_number,
                    'status' => $result['purchase']->status,
                    'product' => $result['purchase']->product->only(['id', 'title', 'slug']),
                ],
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            Log::error('Payment confirmation failed', [
                'payment_intent_id' => $request->payment_intent_id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al confirmar el pago'
            ], 500);
        }
    }

    /**
     * Mostrar página de éxito de compra
     */
    public function success(Request $request)
    {
        $purchase = MarketplacePurchase::where('order_number', $request->order_number)
                                      ->where('buyer_id', Auth::id())
                                      ->with(['product', 'seller'])
                                      ->first();

        if (!$purchase) {
            return redirect()->route('marketplace.index')
                           ->withErrors(['error' => 'Compra no encontrada']);
        }

        return Inertia::render('Marketplace/PaymentSuccess', [
            'purchase' => $purchase,
            'download_available' => $purchase->delivery_status === 'delivered',
        ]);
    }

    /**
     * Mostrar página de cancelación
     */
    public function cancel(Request $request)
    {
        // Opcional: marcar purchase como cancelled si existe
        if ($request->has('purchase_id')) {
            $purchase = MarketplacePurchase::where('id', $request->purchase_id)
                                          ->where('buyer_id', Auth::id())
                                          ->first();

            if ($purchase && $purchase->status === 'pending_payment') {
                $purchase->update(['status' => 'cancelled']);
            }
        }

        return Inertia::render('Marketplace/PaymentCancelled', [
            'message' => 'El pago fue cancelado. Puedes intentar nuevamente cuando lo desees.'
        ]);
    }

    /**
     * Webhook de Stripe para eventos de pago
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('stripe-signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);

            Log::info('Stripe webhook received', ['type' => $event->type]);

            // Procesar diferentes tipos de eventos
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;

                case 'payment_intent.requires_action':
                    $this->handlePaymentRequiresAction($event->data->object);
                    break;

                case 'refund.created':
                    $this->handleRefundCreated($event->data->object);
                    break;

                default:
                    Log::info('Unhandled webhook event', ['type' => $event->type]);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Stripe webhook failed', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);

            return response()->json(['error' => 'Webhook failed'], 400);
        }
    }

    /**
     * Solicitar reembolso
     */
    public function requestRefund(Request $request, MarketplacePurchase $purchase)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:1000',
                'amount' => 'sometimes|numeric|min:0.01',
            ]);

            // Verificar permisos
            if ($purchase->buyer_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'error' => 'No tienes permiso para solicitar reembolso de esta compra'
                ], 403);
            }

            // Verificar que esté dentro del período de reembolso
            if (!$purchase->can_dispute || now()->isAfter($purchase->dispute_deadline)) {
                return response()->json([
                    'success' => false,
                    'error' => 'El período para solicitar reembolso ha expirado'
                ], 400);
            }

            // Verificar estado de la compra
            if (!in_array($purchase->status, ['completed', 'paid'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Esta compra no es elegible para reembolso'
                ], 400);
            }

            $refundAmount = $validated['amount'] ?? $purchase->amount;

            $result = $this->paymentService->processRefund(
                $purchase,
                $refundAmount,
                $validated['reason']
            );

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Reembolso procesado exitosamente',
                'refund_amount' => $result['amount']
            ]);

        } catch (\Exception $e) {
            Log::error('Refund request failed', [
                'purchase_id' => $purchase->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al procesar la solicitud de reembolso'
            ], 500);
        }
    }

    /**
     * Obtener historial de compras del usuario (OPTIMIZADO)
     */
    public function purchases(Request $request)
    {
        try {
            $purchases = MarketplacePurchase::where('buyer_id', Auth::id())
                                          ->with([
                                              'product:id,title,slug,images,seller_id',
                                              'seller:id,username,full_name,avatar'
                                          ])
                                          ->select([
                                              'id', 'product_id', 'seller_id', 'order_number',
                                              'amount', 'currency', 'status', 'delivery_status',
                                              'delivered_at', 'can_dispute', 'dispute_deadline',
                                              'review_submitted', 'created_at'
                                          ])
                                          ->orderByDesc('created_at')
                                          ->paginate(10);

            return Inertia::render('Marketplace/MyPurchases', [
                'purchases' => $purchases
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load user purchases', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al cargar las compras']);
        }
    }

    /**
     * Descargar producto comprado
     */
    public function download(Request $request, string $token)
    {
        try {
            $purchase = MarketplacePurchase::where('download_token', $token)
                                          ->where('buyer_id', Auth::id())
                                          ->where('delivery_status', 'delivered')
                                          ->first();

            if (!$purchase) {
                return redirect()->route('marketplace.purchases')
                               ->withErrors(['error' => 'Token de descarga inválido']);
            }

            // Incrementar contador de descargas
            $purchase->increment('download_attempts');
            
            if (is_null($purchase->first_download_at)) {
                $purchase->update(['first_download_at' => now()]);
            }
            
            $purchase->update(['last_download_at' => now()]);

            // Redireccionar a URL de descarga según el método
            $deliveryData = $purchase->delivery_data;

            switch ($deliveryData['method']) {
                case 'github_release':
                    return redirect($deliveryData['repo_url'] . '/releases/latest');

                case 'zip_file':
                    // TODO: Implementar descarga directa de archivo
                    return response()->download(storage_path('marketplace/' . $purchase->product_id . '.zip'));

                case 'git_access':
                    return redirect($deliveryData['repo_url']);

                default:
                    return back()->withErrors(['error' => 'Método de entrega no soportado']);
            }

        } catch (\Exception $e) {
            Log::error('Download failed', [
                'token' => $token,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al descargar el producto']);
        }
    }

    // Private webhook handlers

    private function handlePaymentSucceeded($paymentIntent): void
    {
        $purchase = MarketplacePurchase::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($purchase && $purchase->status !== 'paid') {
            $this->paymentService->confirmPayment($paymentIntent->id);
        }
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $purchase = MarketplacePurchase::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($purchase) {
            $purchase->update([
                'status' => 'failed',
                'payment_metadata' => $paymentIntent
            ]);

            Log::warning('Payment failed', [
                'purchase_id' => $purchase->id,
                'payment_intent_id' => $paymentIntent->id
            ]);
        }
    }

    private function handlePaymentRequiresAction($paymentIntent): void
    {
        Log::info('Payment requires additional action', [
            'payment_intent_id' => $paymentIntent->id,
            'status' => $paymentIntent->status
        ]);
    }

    private function handleRefundCreated($refund): void
    {
        Log::info('Refund created via webhook', [
            'refund_id' => $refund->id,
            'amount' => $refund->amount,
            'payment_intent' => $refund->payment_intent
        ]);
    }
}