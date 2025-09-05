<?php

namespace App\Services;

use App\Models\MarketplaceProduct;
use App\Models\MarketplacePurchase;
use App\Models\MarketplaceTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class PaymentService
{
    private StripeClient $stripe;
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
        $this->notificationService = $notificationService;
    }

    /**
     * Crear intención de pago con Stripe (OPTIMIZADO para Octane)
     */
    public function createPaymentIntent(
        MarketplaceProduct $product,
        int $buyerId,
        string $currency = 'usd'
    ): array {
        try {
            DB::beginTransaction();

            // Calcular comisiones
            $pricing = $product->calculateCommission($product->price);
            
            // Crear orden de compra
            $purchase = MarketplacePurchase::create([
                'buyer_id' => $buyerId,
                'seller_id' => $product->seller_id,
                'product_id' => $product->id,
                'order_number' => $this->generateOrderNumber(),
                'amount' => $pricing['sale_amount'],
                'commission_amount' => $pricing['commission_amount'],
                'seller_amount' => $pricing['seller_amount'],
                'currency' => strtoupper($currency),
                'status' => 'pending_payment',
                'dispute_deadline' => now()->addDays(7), // 7 días para disputar
                'review_deadline' => now()->addDays(30), // 30 días para review
            ]);

            // Crear Payment Intent en Stripe
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $this->convertToStripeAmount($pricing['sale_amount'], $currency),
                'currency' => strtolower($currency),
                'payment_method_types' => ['card'],
                'capture_method' => 'manual', // Capturar manualmente después de verificar
                'metadata' => [
                    'purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'buyer_id' => $buyerId,
                    'order_number' => $purchase->order_number,
                    'environment' => app()->environment(),
                ],
                'description' => "Compra: {$product->title}",
                'statement_descriptor_suffix' => 'TRIBE MKT',
                // Configurar para escrow automático
                'transfer_group' => $purchase->order_number,
            ]);

            // Actualizar purchase con payment intent ID
            $purchase->update([
                'payment_intent_id' => $paymentIntent->id,
                'payment_method' => 'stripe',
            ]);

            // Crear transacción pendiente
            MarketplaceTransaction::create([
                'purchase_id' => $purchase->id,
                'user_id' => $buyerId,
                'transaction_id' => $this->generateTransactionId(),
                'type' => 'payment',
                'direction' => 'in',
                'amount' => $pricing['sale_amount'],
                'net_amount' => $pricing['sale_amount'],
                'currency' => strtoupper($currency),
                'status' => 'pending',
                'gateway' => 'stripe',
                'gateway_transaction_id' => $paymentIntent->id,
                'held_in_escrow' => true,
                'escrow_release_date' => now()->addDays(7),
                'description' => "Pago por: {$product->title}",
            ]);

            DB::commit();

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'purchase_id' => $purchase->id,
                'order_number' => $purchase->order_number,
                'amount' => $pricing['sale_amount'],
                'currency' => $currency,
            ];

        } catch (ApiErrorException $e) {
            DB::rollback();
            Log::error('Stripe Payment Intent creation failed', [
                'product_id' => $product->id,
                'buyer_id' => $buyerId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error en el procesamiento del pago: ' . $e->getMessage(),
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Payment creation failed', [
                'product_id' => $product->id,
                'buyer_id' => $buyerId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error interno del servidor',
            ];
        }
    }

    /**
     * Confirmar pago y procesar escrow
     */
    public function confirmPayment(string $paymentIntentId): array
    {
        try {
            DB::beginTransaction();

            // Obtener payment intent de Stripe
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);
            
            // Buscar la compra asociada
            $purchase = MarketplacePurchase::where('payment_intent_id', $paymentIntentId)->first();
            
            if (!$purchase) {
                throw new \Exception('Compra no encontrada');
            }

            if ($paymentIntent->status === 'requires_capture') {
                // Capturar el pago
                $paymentIntent = $this->stripe->paymentIntents->capture($paymentIntentId);
            }

            if ($paymentIntent->status === 'succeeded') {
                // Actualizar compra
                $purchase->update([
                    'status' => 'paid',
                    'payment_metadata' => $paymentIntent->toArray(),
                ]);

                // Actualizar transacción de pago
                MarketplaceTransaction::where('purchase_id', $purchase->id)
                                     ->where('type', 'payment')
                                     ->update([
                                         'status' => 'completed',
                                         'gateway_response' => $paymentIntent->toArray(),
                                     ]);

                // Crear transacciones de comisión y vendedor (en escrow)
                $this->createEscrowTransactions($purchase);

                // Procesar entrega del producto
                $this->processProductDelivery($purchase);

                // Notificaciones
                $this->notificationService->purchaseCompleted(
                    $purchase->buyer, 
                    $purchase->seller, 
                    $purchase
                );

                DB::commit();

                return [
                    'success' => true,
                    'purchase' => $purchase,
                    'message' => 'Pago confirmado exitosamente',
                ];
            }

            throw new \Exception('El pago no se completó correctamente');

        } catch (ApiErrorException $e) {
            DB::rollback();
            Log::error('Stripe payment confirmation failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error en la confirmación del pago: ' . $e->getMessage(),
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Payment confirmation failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error en la confirmación del pago',
            ];
        }
    }

    /**
     * Crear transacciones de escrow
     */
    private function createEscrowTransactions(MarketplacePurchase $purchase): void
    {
        // Transacción de comisión para la plataforma
        MarketplaceTransaction::create([
            'purchase_id' => $purchase->id,
            'user_id' => 1, // Admin/Platform user
            'transaction_id' => $this->generateTransactionId(),
            'type' => 'commission',
            'direction' => 'in',
            'amount' => $purchase->commission_amount,
            'net_amount' => $purchase->commission_amount,
            'currency' => $purchase->currency,
            'status' => 'completed',
            'gateway' => 'stripe',
            'held_in_escrow' => false, // Comisión se libera inmediatamente
            'description' => "Comisión por venta: {$purchase->product->title}",
        ]);

        // Transacción para el vendedor (en escrow)
        MarketplaceTransaction::create([
            'purchase_id' => $purchase->id,
            'user_id' => $purchase->seller_id,
            'transaction_id' => $this->generateTransactionId(),
            'type' => 'payout',
            'direction' => 'in',
            'amount' => $purchase->seller_amount,
            'net_amount' => $purchase->seller_amount,
            'currency' => $purchase->currency,
            'status' => 'pending',
            'gateway' => 'stripe',
            'held_in_escrow' => true,
            'escrow_release_date' => now()->addDays(7),
            'description' => "Pago por venta: {$purchase->product->title}",
        ]);
    }

    /**
     * Procesar entrega del producto
     */
    private function processProductDelivery(MarketplacePurchase $purchase): void
    {
        try {
            $product = $purchase->product;
            
            // Generar token de descarga único
            $downloadToken = $this->generateDownloadToken();
            
            $deliveryData = [];

            switch ($product->delivery_method) {
                case 'github_release':
                    // Obtener URL del último release
                    $deliveryData = $this->prepareGithubDelivery($product, $downloadToken);
                    break;
                    
                case 'zip_file':
                    // Preparar archivo ZIP para descarga
                    $deliveryData = $this->prepareZipDelivery($product, $downloadToken);
                    break;
                    
                case 'git_access':
                    // Proporcionar acceso temporal al repositorio
                    $deliveryData = $this->prepareGitAccess($product, $downloadToken);
                    break;
            }

            // Actualizar compra con información de entrega
            $purchase->update([
                'delivery_status' => 'delivered',
                'delivered_at' => now(),
                'delivery_data' => $deliveryData,
                'download_token' => $downloadToken,
                'status' => 'completed',
            ]);

            // Incrementar contador de ventas del producto
            $product->incrementSales();

        } catch (\Exception $e) {
            Log::error('Product delivery failed', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
            ]);

            $purchase->update([
                'delivery_status' => 'failed',
                'delivery_data' => ['error' => $e->getMessage()],
            ]);
        }
    }

    /**
     * Procesar reembolso
     */
    public function processRefund(MarketplacePurchase $purchase, float $amount, string $reason): array
    {
        try {
            DB::beginTransaction();

            // Crear reembolso en Stripe
            $refund = $this->stripe->refunds->create([
                'payment_intent' => $purchase->payment_intent_id,
                'amount' => $this->convertToStripeAmount($amount, $purchase->currency),
                'reason' => 'requested_by_customer',
                'metadata' => [
                    'purchase_id' => $purchase->id,
                    'order_number' => $purchase->order_number,
                    'reason' => $reason,
                ],
            ]);

            // Actualizar compra
            $purchase->update([
                'status' => 'refunded',
                'refund_amount' => $amount,
                'refunded_at' => now(),
            ]);

            // Crear transacción de reembolso
            MarketplaceTransaction::create([
                'purchase_id' => $purchase->id,
                'user_id' => $purchase->buyer_id,
                'transaction_id' => $this->generateTransactionId(),
                'type' => 'refund',
                'direction' => 'out',
                'amount' => $amount,
                'net_amount' => $amount,
                'currency' => $purchase->currency,
                'status' => 'completed',
                'gateway' => 'stripe',
                'gateway_transaction_id' => $refund->id,
                'description' => "Reembolso: {$purchase->product->title}",
            ]);

            // Revertir transacción del vendedor si está en escrow
            $sellerTransaction = MarketplaceTransaction::where('purchase_id', $purchase->id)
                                                      ->where('user_id', $purchase->seller_id)
                                                      ->where('type', 'payout')
                                                      ->first();

            if ($sellerTransaction && $sellerTransaction->held_in_escrow) {
                $sellerTransaction->update([
                    'status' => 'cancelled',
                    'released_from_escrow_at' => now(),
                    'escrow_release_reason' => 'Refund processed',
                ]);
            }

            // Notificaciones
            $this->notificationService->refundProcessed(
                $purchase->buyer, 
                $purchase->seller, 
                $purchase, 
                $amount
            );

            DB::commit();

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'amount' => $amount,
            ];

        } catch (ApiErrorException $e) {
            DB::rollback();
            Log::error('Stripe refund failed', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error al procesar reembolso: ' . $e->getMessage(),
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Refund processing failed', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error interno al procesar reembolso',
            ];
        }
    }

    /**
     * Liberar fondos del escrow automáticamente
     */
    public function releaseEscrowFunds(MarketplacePurchase $purchase): array
    {
        try {
            DB::beginTransaction();

            $sellerTransaction = MarketplaceTransaction::where('purchase_id', $purchase->id)
                                                      ->where('user_id', $purchase->seller_id)
                                                      ->where('type', 'payout')
                                                      ->where('held_in_escrow', true)
                                                      ->first();

            if (!$sellerTransaction) {
                return ['success' => false, 'error' => 'No hay fondos en escrow'];
            }

            // Liberar fondos
            $sellerTransaction->update([
                'status' => 'completed',
                'held_in_escrow' => false,
                'released_from_escrow_at' => now(),
                'escrow_release_reason' => 'Automatic release after dispute period',
            ]);

            // Aquí se podría integrar con Stripe Connect para transferir fondos al vendedor
            // Por ahora, marcamos como completado

            // Notificar al vendedor
            $this->notificationService->fundsReleased($purchase->seller, $purchase, $sellerTransaction->amount);

            DB::commit();

            return [
                'success' => true,
                'amount_released' => $sellerTransaction->amount,
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Escrow release failed', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Error al liberar fondos del escrow',
            ];
        }
    }

    /**
     * Generar número de orden único
     */
    private function generateOrderNumber(): string
    {
        $year = date('Y');
        $sequence = MarketplacePurchase::whereYear('created_at', $year)->count() + 1;
        return "ORD-{$year}-" . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generar ID de transacción único
     */
    private function generateTransactionId(): string
    {
        $year = date('Y');
        $sequence = MarketplaceTransaction::whereYear('created_at', $year)->count() + 1;
        return "TXN-{$year}-" . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generar token de descarga único
     */
    private function generateDownloadToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Convertir cantidad a formato de Stripe (centavos)
     */
    private function convertToStripeAmount(float $amount, string $currency): int
    {
        // Monedas sin decimales (yen, etc.)
        $zeroDecimalCurrencies = ['jpy', 'krw'];
        
        if (in_array(strtolower($currency), $zeroDecimalCurrencies)) {
            return (int) $amount;
        }

        return (int) ($amount * 100);
    }

    /**
     * Preparar entrega GitHub (placeholder)
     */
    private function prepareGithubDelivery(MarketplaceProduct $product, string $token): array
    {
        // TODO: Implementar lógica real de GitHub releases
        return [
            'method' => 'github_release',
            'repo_url' => "https://github.com/{$product->github_repo}",
            'download_token' => $token,
            'expires_at' => now()->addDays(30),
        ];
    }

    /**
     * Preparar entrega ZIP (placeholder)
     */
    private function prepareZipDelivery(MarketplaceProduct $product, string $token): array
    {
        return [
            'method' => 'zip_file',
            'download_url' => route('marketplace.download', ['token' => $token]),
            'download_token' => $token,
            'expires_at' => now()->addDays(30),
        ];
    }

    /**
     * Preparar acceso Git (placeholder)
     */
    private function prepareGitAccess(MarketplaceProduct $product, string $token): array
    {
        return [
            'method' => 'git_access',
            'repo_url' => "https://github.com/{$product->github_repo}",
            'access_token' => $token,
            'expires_at' => now()->addDays(30),
        ];
    }
}