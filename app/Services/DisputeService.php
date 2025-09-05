<?php

namespace App\Services;

use App\Models\MarketplacePurchase;
use App\Models\MarketplaceDispute;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DisputeService
{
    private NotificationService $notificationService;
    private PaymentService $paymentService;

    public function __construct(
        NotificationService $notificationService,
        PaymentService $paymentService
    ) {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
    }

    /**
     * Crear nueva disputa (OPTIMIZADO para Octane)
     */
    public function createDispute(
        MarketplacePurchase $purchase,
        User $disputer,
        array $disputeData
    ): array {
        try {
            DB::beginTransaction();

            // Verificar si ya existe una disputa para esta compra
            if ($purchase->disputes()->exists()) {
                return [
                    'success' => false,
                    'error' => 'Ya existe una disputa para esta compra'
                ];
            }

            // Verificar período de disputa
            if (!$purchase->can_dispute || now()->isAfter($purchase->dispute_deadline)) {
                return [
                    'success' => false,
                    'error' => 'El período para crear disputas ha expirado'
                ];
            }

            // Determinar contra quién es la disputa
            $disputedAgainst = $disputer->id === $purchase->buyer_id 
                             ? $purchase->seller 
                             : $purchase->buyer;

            // Crear la disputa
            $dispute = MarketplaceDispute::create([
                'purchase_id' => $purchase->id,
                'disputer_id' => $disputer->id,
                'disputed_against_id' => $disputedAgainst->id,
                'dispute_number' => $this->generateDisputeNumber(),
                'type' => $disputeData['type'],
                'priority' => $this->calculatePriority($disputeData['type'], $purchase->amount),
                'title' => $disputeData['title'],
                'description' => $disputeData['description'],
                'evidence_files' => $disputeData['evidence_files'] ?? [],
                'evidence_urls' => $disputeData['evidence_urls'] ?? [],
                'expected_resolution' => $disputeData['expected_resolution'] ?? null,
                'response_deadline' => now()->addDays(3), // 3 días para responder
                'resolution_deadline' => now()->addDays(14), // 14 días para resolver
                'expires_at' => now()->addDays(30), // 30 días total
            ]);

            // Actualizar compra
            $purchase->update([
                'status' => 'disputed',
                'can_dispute' => false, // Solo una disputa por compra
            ]);

            // Congelar transacciones en escrow
            $this->freezeEscrowTransactions($purchase);

            // Crear indicadores de fraude si aplica
            $fraudIndicators = $this->detectFraudIndicators($dispute, $purchase);
            if (!empty($fraudIndicators)) {
                $dispute->update([
                    'fraud_indicators' => $fraudIndicators,
                    'flagged_as_fraud' => count($fraudIndicators) > 2,
                ]);
            }

            // Notificaciones automáticas
            $this->notificationService->disputeCreated($disputer, $disputedAgainst, $dispute);
            $this->notificationService->notifyAdminsNewDispute($dispute);

            // Programar escalamiento automático si no hay respuesta
            $this->scheduleAutoEscalation($dispute);

            DB::commit();

            return [
                'success' => true,
                'dispute' => $dispute,
                'dispute_number' => $dispute->dispute_number,
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Dispute creation failed', [
                'purchase_id' => $purchase->id,
                'disputer_id' => $disputer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al crear la disputa'
            ];
        }
    }

    /**
     * Responder a una disputa
     */
    public function respondToDispute(
        MarketplaceDispute $dispute,
        User $responder,
        array $responseData
    ): array {
        try {
            DB::beginTransaction();

            // Verificar permisos
            if (!$this->canRespondToDispute($dispute, $responder)) {
                return [
                    'success' => false,
                    'error' => 'No tienes permiso para responder a esta disputa'
                ];
            }

            // Actualizar historia de respuestas
            $statusHistory = $dispute->status_history ?? [];
            $statusHistory[] = [
                'status' => 'response_received',
                'user_id' => $responder->id,
                'timestamp' => now()->toISOString(),
                'response' => $responseData['response'] ?? null,
                'evidence' => $responseData['evidence_files'] ?? [],
            ];

            $dispute->update([
                'status' => 'waiting_response',
                'status_history' => $statusHistory,
                'response_deadline' => now()->addDays(3), // Extender plazo
            ]);

            // Marcar notificaciones según quién responde
            if ($responder->id === $dispute->disputedAgainst->id) {
                $dispute->update([
                    'seller_notified' => $responder->id === $dispute->purchase->seller_id,
                    'buyer_notified' => $responder->id === $dispute->purchase->buyer_id,
                    'last_seller_response' => $responder->id === $dispute->purchase->seller_id ? now() : $dispute->last_seller_response,
                    'last_buyer_response' => $responder->id === $dispute->purchase->buyer_id ? now() : $dispute->last_buyer_response,
                ]);
            }

            // Notificar a la otra parte
            $otherParty = $responder->id === $dispute->disputer_id 
                        ? $dispute->disputedAgainst 
                        : $dispute->disputer;

            $this->notificationService->disputeResponseReceived($responder, $otherParty, $dispute);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Respuesta enviada exitosamente'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Dispute response failed', [
                'dispute_id' => $dispute->id,
                'responder_id' => $responder->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al enviar la respuesta'
            ];
        }
    }

    /**
     * Resolver disputa (solo admins)
     */
    public function resolveDispute(
        MarketplaceDispute $dispute,
        User $admin,
        array $resolutionData
    ): array {
        try {
            DB::beginTransaction();

            // Verificar permisos de admin
            if (!$admin->isAdmin()) {
                return [
                    'success' => false,
                    'error' => 'Solo los administradores pueden resolver disputas'
                ];
            }

            $resolution = $resolutionData['resolution'];
            $refundAmount = $resolutionData['refund_amount'] ?? null;

            // Procesar resolución según el tipo
            $result = $this->processResolution($dispute, $resolution, $refundAmount, $resolutionData['notes'] ?? '');

            if (!$result['success']) {
                DB::rollback();
                return $result;
            }

            // Actualizar disputa
            $dispute->update([
                'status' => 'resolved',
                'resolution' => $resolution,
                'resolution_notes' => $resolutionData['notes'] ?? '',
                'refund_amount' => $refundAmount,
                'resolved_at' => now(),
                'assigned_admin_id' => $admin->id,
            ]);

            // Actualizar compra según resolución
            $newPurchaseStatus = $this->determinePurchaseStatus($resolution);
            $dispute->purchase->update(['status' => $newPurchaseStatus]);

            // Notificar a ambas partes
            $this->notificationService->disputeResolved(
                $dispute->disputer,
                $dispute->disputedAgainst,
                $dispute,
                $resolution
            );

            DB::commit();

            return [
                'success' => true,
                'resolution' => $resolution,
                'message' => 'Disputa resuelta exitosamente'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Dispute resolution failed', [
                'dispute_id' => $dispute->id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al resolver la disputa'
            ];
        }
    }

    /**
     * Escalar disputa a administrador
     */
    public function escalateDispute(MarketplaceDispute $dispute, string $reason): array
    {
        try {
            $dispute->update([
                'status' => 'escalated',
                'priority' => 'high',
                'admin_notes' => $reason,
            ]);

            // Notificar a todos los admins
            $this->notificationService->disputeEscalated($dispute, $reason);

            return [
                'success' => true,
                'message' => 'Disputa escalada a administración'
            ];

        } catch (\Exception $e) {
            Log::error('Dispute escalation failed', [
                'dispute_id' => $dispute->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al escalar la disputa'
            ];
        }
    }

    /**
     * Obtener disputas de un usuario (OPTIMIZADO)
     */
    public function getUserDisputes(User $user, array $filters = []): array
    {
        $query = MarketplaceDispute::with([
                    'purchase.product:id,title,slug,images',
                    'disputer:id,username,full_name,avatar',
                    'disputedAgainst:id,username,full_name,avatar',
                    'assignedAdmin:id,username,full_name'
                ])
                ->where(function($q) use ($user) {
                    $q->where('disputer_id', $user->id)
                      ->orWhere('disputed_against_id', $user->id);
                });

        // Aplicar filtros
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $disputes = $query->orderByDesc('created_at')
                         ->select([
                             'id', 'purchase_id', 'disputer_id', 'disputed_against_id',
                             'assigned_admin_id', 'dispute_number', 'type', 'priority',
                             'title', 'status', 'resolution', 'created_at', 'resolved_at',
                             'response_deadline', 'resolution_deadline'
                         ])
                         ->paginate(10);

        return [
            'disputes' => $disputes,
            'stats' => $this->getUserDisputeStats($user)
        ];
    }

    /**
     * Obtener estadísticas de disputas para admins
     */
    public function getAdminDisputeStats(): array
    {
        return [
            'total_disputes' => MarketplaceDispute::count(),
            'pending_disputes' => MarketplaceDispute::whereIn('status', ['open', 'investigating', 'escalated'])->count(),
            'resolved_disputes' => MarketplaceDispute::where('status', 'resolved')->count(),
            'disputed_today' => MarketplaceDispute::whereDate('created_at', today())->count(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
            'disputes_by_type' => MarketplaceDispute::groupBy('type')
                                                   ->selectRaw('type, COUNT(*) as count')
                                                   ->pluck('count', 'type'),
            'high_priority_disputes' => MarketplaceDispute::where('priority', 'high')
                                                          ->whereIn('status', ['open', 'investigating', 'escalated'])
                                                          ->count(),
        ];
    }

    // Private helper methods

    private function generateDisputeNumber(): string
    {
        $year = date('Y');
        $sequence = MarketplaceDispute::whereYear('created_at', $year)->count() + 1;
        return "DISP-{$year}-" . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    private function calculatePriority(string $type, float $amount): string
    {
        // Disputas de alto valor o tipos críticos tienen alta prioridad
        if ($amount > 500 || in_array($type, ['seller_fraud', 'buyer_fraud', 'copyright_violation'])) {
            return 'high';
        }

        if ($amount > 100 || in_array($type, ['not_delivered', 'defective_product'])) {
            return 'medium';
        }

        return 'low';
    }

    private function freezeEscrowTransactions(MarketplacePurchase $purchase): void
    {
        // Congelar transacciones en escrow hasta que se resuelva la disputa
        $purchase->transactions()
                 ->where('held_in_escrow', true)
                 ->where('status', 'pending')
                 ->update([
                     'escrow_release_date' => null, // Detener liberación automática
                     'description' => DB::raw("CONCAT(description, ' - FROZEN DUE TO DISPUTE')")
                 ]);
    }

    private function detectFraudIndicators(MarketplaceDispute $dispute, MarketplacePurchase $purchase): array
    {
        $indicators = [];

        // Múltiples disputas del mismo usuario
        $userDisputeCount = MarketplaceDispute::where('disputer_id', $dispute->disputer_id)
                                            ->where('created_at', '>', now()->subDays(30))
                                            ->count();

        if ($userDisputeCount > 3) {
            $indicators[] = 'multiple_disputes_short_period';
        }

        // Disputa muy rápida después de compra
        if ($purchase->created_at->diffInHours(now()) < 2) {
            $indicators[] = 'immediate_dispute_after_purchase';
        }

        // Patrón de texto sospechoso (muy básico)
        if (str_contains(strtolower($dispute->description), 'chargeback') ||
            str_contains(strtolower($dispute->description), 'bank') ||
            str_contains(strtolower($dispute->description), 'credit card')) {
            $indicators[] = 'chargeback_threat_detected';
        }

        return $indicators;
    }

    private function scheduleAutoEscalation(MarketplaceDispute $dispute): void
    {
        // TODO: Implementar job scheduling para escalamiento automático
        // Por ahora, solo loggeamos la intención
        Log::info('Auto-escalation scheduled for dispute', [
            'dispute_id' => $dispute->id,
            'escalate_at' => $dispute->response_deadline->addDays(2)
        ]);
    }

    private function canRespondToDispute(MarketplaceDispute $dispute, User $user): bool
    {
        return in_array($user->id, [
            $dispute->disputer_id,
            $dispute->disputed_against_id,
            $dispute->assigned_admin_id
        ]) || $user->isAdmin();
    }

    private function processResolution(MarketplaceDispute $dispute, string $resolution, ?float $refundAmount, string $notes): array
    {
        switch ($resolution) {
            case 'refund_full':
                return $this->paymentService->processRefund(
                    $dispute->purchase,
                    $dispute->purchase->amount,
                    "Dispute resolution: {$notes}"
                );

            case 'refund_partial':
                if (!$refundAmount) {
                    return ['success' => false, 'error' => 'Refund amount required for partial refund'];
                }
                return $this->paymentService->processRefund($dispute->purchase, $refundAmount, $notes);

            case 'seller_favor':
                // Liberar fondos del escrow al vendedor
                return $this->paymentService->releaseEscrowFunds($dispute->purchase);

            case 'buyer_favor':
                // Procesar reembolso completo
                return $this->paymentService->processRefund(
                    $dispute->purchase,
                    $dispute->purchase->amount,
                    "Dispute resolved in buyer's favor: {$notes}"
                );

            case 'no_action':
                return ['success' => true, 'message' => 'No action taken'];

            default:
                return ['success' => true, 'message' => 'Resolution recorded'];
        }
    }

    private function determinePurchaseStatus(string $resolution): string
    {
        return match($resolution) {
            'refund_full', 'refund_partial', 'buyer_favor' => 'refunded',
            'seller_favor' => 'completed',
            'no_action' => 'completed',
            default => 'completed'
        };
    }

    private function getUserDisputeStats(User $user): array
    {
        return [
            'total_disputes' => MarketplaceDispute::where('disputer_id', $user->id)->count(),
            'pending_disputes' => MarketplaceDispute::where('disputer_id', $user->id)
                                                   ->whereIn('status', ['open', 'investigating', 'waiting_response'])
                                                   ->count(),
            'won_disputes' => MarketplaceDispute::where('disputer_id', $user->id)
                                               ->whereIn('resolution', ['buyer_favor', 'refund_full', 'refund_partial'])
                                               ->count(),
        ];
    }

    private function getAverageResolutionTime(): float
    {
        $resolved = MarketplaceDispute::whereNotNull('resolved_at')
                                    ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours')
                                    ->value('avg_hours');

        return round($resolved ?? 0, 1);
    }
}