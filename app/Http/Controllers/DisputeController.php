<?php

namespace App\Http\Controllers;

use App\Models\MarketplacePurchase;
use App\Models\MarketplaceDispute;
use App\Services\DisputeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function __construct(
        private DisputeService $disputeService
    ) {}

    /**
     * Mostrar lista de disputas del usuario (OPTIMIZADO para Octane)
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->only(['status', 'type']);
            
            $result = $this->disputeService->getUserDisputes(Auth::user(), $filters);

            return Inertia::render('Marketplace/Disputes/Index', [
                'disputes' => $result['disputes'],
                'stats' => $result['stats'],
                'filters' => $filters,
                'dispute_types' => $this->getDisputeTypes(),
                'dispute_statuses' => $this->getDisputeStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load user disputes', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al cargar las disputas']);
        }
    }

    /**
     * Mostrar formulario para crear disputa
     */
    public function create(MarketplacePurchase $purchase)
    {
        // Verificar permisos
        if (!Gate::allows('create-dispute', $purchase)) {
            return back()->withErrors(['error' => 'No puedes crear una disputa para esta compra']);
        }

        // Verificar si ya existe disputa
        if ($purchase->disputes()->exists()) {
            return back()->withErrors(['error' => 'Ya existe una disputa para esta compra']);
        }

        return Inertia::render('Marketplace/Disputes/Create', [
            'purchase' => $purchase->load(['product', 'seller']),
            'dispute_types' => $this->getDisputeTypes(),
            'max_evidence_files' => 5,
        ]);
    }

    /**
     * Crear nueva disputa (OPTIMIZADO)
     */
    public function store(Request $request, MarketplacePurchase $purchase)
    {
        try {
            // Verificar permisos
            if (!Gate::allows('create-dispute', $purchase)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No puedes crear una disputa para esta compra'
                ], 403);
            }

            $validated = $request->validate([
                'type' => ['required', Rule::in(array_keys($this->getDisputeTypes()))],
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'expected_resolution' => 'nullable|string|max:1000',
                'evidence_files' => 'nullable|array|max:5',
                'evidence_files.*' => 'file|mimes:jpg,jpeg,png,pdf,txt,doc,docx|max:5120', // 5MB max
                'evidence_urls' => 'nullable|array|max:3',
                'evidence_urls.*' => 'url',
            ]);

            // Subir archivos de evidencia si existen
            $evidenceFiles = [];
            if ($request->hasFile('evidence_files')) {
                foreach ($request->file('evidence_files') as $file) {
                    $path = $file->store('disputes/evidence', 'public');
                    $evidenceFiles[] = [
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'size' => $file->getSize(),
                        'type' => $file->getMimeType(),
                    ];
                }
            }

            // Crear disputa
            $result = $this->disputeService->createDispute(Auth::user(), $purchase, [
                'type' => $validated['type'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'expected_resolution' => $validated['expected_resolution'] ?? null,
                'evidence_files' => $evidenceFiles,
                'evidence_urls' => $validated['evidence_urls'] ?? [],
            ]);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'dispute_number' => $result['dispute_number'],
                'message' => 'Disputa creada exitosamente',
                'redirect' => route('disputes.show', $result['dispute']->id)
            ]);

        } catch (\Exception $e) {
            Log::error('Dispute creation failed', [
                'purchase_id' => $purchase->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al crear la disputa'
            ], 500);
        }
    }

    /**
     * Mostrar disputa individual (OPTIMIZADO)
     */
    public function show(MarketplaceDispute $dispute)
    {
        try {
            // Verificar permisos
            if (!Gate::allows('view', $dispute)) {
                return back()->withErrors(['error' => 'No tienes permiso para ver esta disputa']);
            }

            // Cargar relaciones necesarias
            $dispute->load([
                'purchase.product:id,title,slug,images,price,currency',
                'purchase.seller:id,username,full_name,avatar',
                'purchase.buyer:id,username,full_name,avatar',
                'disputer:id,username,full_name,avatar',
                'disputedAgainst:id,username,full_name,avatar',
                'assignedAdmin:id,username,full_name'
            ]);

            // Determinar si el usuario puede responder
            $canRespond = Gate::allows('respond', $dispute);
            $canResolve = Gate::allows('resolve', $dispute);

            return Inertia::render('Marketplace/Disputes/Show', [
                'dispute' => $dispute,
                'can_respond' => $canRespond,
                'can_resolve' => $canResolve,
                'is_admin' => Auth::user()->isAdmin(),
                'resolution_options' => $this->getResolutionOptions(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load dispute', [
                'dispute_id' => $dispute->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al cargar la disputa']);
        }
    }

    /**
     * Responder a disputa
     */
    public function respond(Request $request, MarketplaceDispute $dispute)
    {
        try {
            // Verificar permisos
            if (!Gate::allows('respond', $dispute)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No puedes responder a esta disputa'
                ], 403);
            }

            $validated = $request->validate([
                'response' => 'required|string|max:2000',
                'evidence_files' => 'nullable|array|max:3',
                'evidence_files.*' => 'file|mimes:jpg,jpeg,png,pdf,txt|max:5120',
            ]);

            // Subir archivos de evidencia adicionales
            $evidenceFiles = [];
            if ($request->hasFile('evidence_files')) {
                foreach ($request->file('evidence_files') as $file) {
                    $path = $file->store('disputes/responses', 'public');
                    $evidenceFiles[] = [
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'size' => $file->getSize(),
                        'type' => $file->getMimeType(),
                    ];
                }
            }

            $result = $this->disputeService->respondToDispute(Auth::user(), $dispute, [
                'response' => $validated['response'],
                'evidence_files' => $evidenceFiles,
            ]);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            Log::error('Dispute response failed', [
                'dispute_id' => $dispute->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al responder la disputa'
            ], 500);
        }
    }

    /**
     * Resolver disputa (solo admins)
     */
    public function resolve(Request $request, MarketplaceDispute $dispute)
    {
        try {
            // Verificar permisos de admin
            if (!Gate::allows('resolve', $dispute)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Solo los administradores pueden resolver disputas'
                ], 403);
            }

            $validated = $request->validate([
                'resolution' => ['required', Rule::in(array_keys($this->getResolutionOptions()))],
                'notes' => 'required|string|max:1000',
                'refund_amount' => 'nullable|numeric|min:0.01',
            ]);

            $result = $this->disputeService->resolveDispute(Auth::user(), $dispute, $validated);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'resolution' => $result['resolution'],
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            Log::error('Dispute resolution failed', [
                'dispute_id' => $dispute->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al resolver la disputa'
            ], 500);
        }
    }

    /**
     * Escalar disputa
     */
    public function escalate(Request $request, MarketplaceDispute $dispute)
    {
        try {
            // Verificar permisos
            if (!Gate::allows('escalate', $dispute)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No puedes escalar esta disputa'
                ], 403);
            }

            $validated = $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $result = $this->disputeService->escalateDispute($dispute, $validated['reason']);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message']
            ]);

        } catch (\Exception $e) {
            Log::error('Dispute escalation failed', [
                'dispute_id' => $dispute->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al escalar la disputa'
            ], 500);
        }
    }

    /**
     * Panel de administración de disputas
     */
    public function adminIndex(Request $request)
    {
        // Verificar permisos de admin
        if (!Auth::user()->isAdmin()) {
            return redirect()->route('disputes.index')
                           ->withErrors(['error' => 'Acceso denegado']);
        }

        try {
            $filters = $request->only(['status', 'type', 'priority', 'assigned']);
            
            $query = MarketplaceDispute::with([
                        'purchase.product:id,title,slug',
                        'disputer:id,username,full_name',
                        'disputedAgainst:id,username,full_name',
                        'assignedAdmin:id,username,full_name'
                    ]);

            // Aplicar filtros
            if (isset($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (isset($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            if (isset($filters['priority'])) {
                $query->where('priority', $filters['priority']);
            }

            if (isset($filters['assigned']) && $filters['assigned'] === 'unassigned') {
                $query->whereNull('assigned_admin_id');
            }

            $disputes = $query->orderByDesc('priority')
                             ->orderByDesc('created_at')
                             ->paginate(15);

            // Estadísticas
            $stats = $this->disputeService->getAdminDisputeStats();

            return Inertia::render('Admin/Disputes/Index', [
                'disputes' => $disputes,
                'stats' => $stats,
                'filters' => $filters,
                'dispute_types' => $this->getDisputeTypes(),
                'dispute_statuses' => $this->getDisputeStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load admin disputes', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Error al cargar las disputas']);
        }
    }

    /**
     * Asignar disputa a admin
     */
    public function assign(Request $request, MarketplaceDispute $dispute)
    {
        // Verificar permisos
        if (!Auth::user()->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Acceso denegado'], 403);
        }

        try {
            $validated = $request->validate([
                'admin_id' => 'nullable|exists:users,id',
            ]);

            $adminId = $validated['admin_id'] ?? Auth::id();
            
            $dispute->update([
                'assigned_admin_id' => $adminId,
                'status' => 'investigating',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Disputa asignada exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Dispute assignment failed', [
                'dispute_id' => $dispute->id,
                'error' => $e->getMessage()
            ]);

            return response()->json(['success' => false, 'error' => 'Error al asignar disputa'], 500);
        }
    }

    // Private helper methods

    private function getDisputeTypes(): array
    {
        return [
            'not_delivered' => 'No entregado',
            'not_as_described' => 'No como se describió',
            'defective_product' => 'Producto defectuoso',
            'unauthorized_purchase' => 'Compra no autorizada',
            'billing_error' => 'Error de facturación',
            'copyright_violation' => 'Violación de derechos de autor',
            'seller_fraud' => 'Fraude del vendedor',
            'buyer_fraud' => 'Fraude del comprador',
            'technical_issue' => 'Problema técnico',
            'other' => 'Otro',
        ];
    }

    private function getDisputeStatuses(): array
    {
        return [
            'open' => 'Abierta',
            'investigating' => 'En investigación',
            'waiting_response' => 'Esperando respuesta',
            'escalated' => 'Escalada',
            'resolved' => 'Resuelta',
            'closed' => 'Cerrada',
            'cancelled' => 'Cancelada',
            'expired' => 'Expirada',
        ];
    }

    private function getResolutionOptions(): array
    {
        return [
            'refund_full' => 'Reembolso completo',
            'refund_partial' => 'Reembolso parcial',
            'replacement' => 'Reemplazo',
            'credit' => 'Crédito',
            'no_action' => 'Sin acción',
            'seller_favor' => 'A favor del vendedor',
            'buyer_favor' => 'A favor del comprador',
            'mutual_agreement' => 'Acuerdo mutuo',
        ];
    }
}