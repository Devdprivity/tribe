<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceProduct;
use App\Services\GitHubVerificationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    public function __construct(
        private GitHubVerificationService $githubService,
        private NotificationService $notificationService
    ) {}

    /**
     * Mostrar marketplace principal (OPTIMIZADO para Octane)
     */
    public function index(Request $request)
    {
        try {
            // Cache key basado en filtros
            $cacheKey = 'marketplace_index_' . md5(serialize($request->only([
                'search', 'type', 'category', 'min_price', 'max_price', 'min_rating', 'sort'
            ])));

            // Intentar obtener de cache (5 minutos)
            $cachedData = Cache::remember($cacheKey, 300, function() use ($request) {
                return $this->getMarketplaceData($request);
            });

            return Inertia::render('Marketplace/Index', [
                'products' => $cachedData['products'],
                'featured' => $cachedData['featured'],
                'categories' => $cachedData['categories'],
                'filters' => $cachedData['filters'],
                'stats' => $cachedData['stats']
            ]);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al cargar el marketplace: ' . $e->getMessage()]);
        }
    }

    /**
     * Obtener datos del marketplace (método privado optimizado)
     */
    private function getMarketplaceData(Request $request): array
    {
        $query = MarketplaceProduct::with(['seller:id,username,full_name,avatar'])
                                  ->active()
                                  ->select([
                                      'id', 'seller_id', 'title', 'short_description', 
                                      'price', 'currency', 'type', 'category', 
                                      'images', 'avg_rating', 'reviews_count', 
                                      'sales_count', 'slug', 'featured'
                                  ]);

        // Aplicar filtros
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        if ($request->filled('category')) {
            $query->ofCategory($request->category);
        }

        if ($request->filled('min_price') || $request->filled('max_price')) {
            $query->priceRange($request->min_price, $request->max_price);
        }

        if ($request->filled('min_rating')) {
            $query->minRating($request->min_rating);
        }

        // Ordenamiento
        $sort = $request->get('sort', 'featured');
        match($sort) {
            'price_low' => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('avg_rating'),
            'sales' => $query->orderByDesc('sales_count'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->featured()->orderByDesc('featured')->orderByDesc('created_at')
        };

        // Productos principales (paginados)
        $products = $query->paginate(12);

        // Productos destacados separados
        $featured = MarketplaceProduct::with(['seller:id,username,full_name,avatar'])
                                     ->featured()
                                     ->active()
                                     ->select([
                                         'id', 'seller_id', 'title', 'short_description',
                                         'price', 'currency', 'images', 'avg_rating',
                                         'reviews_count', 'slug'
                                     ])
                                     ->limit(6)
                                     ->get();

        // Estadísticas generales
        $stats = Cache::remember('marketplace_stats', 1800, function() {
            return [
                'total_products' => MarketplaceProduct::active()->count(),
                'total_sellers' => MarketplaceProduct::active()->distinct('seller_id')->count('seller_id'),
                'categories' => MarketplaceProduct::active()
                                                 ->groupBy('category')
                                                 ->selectRaw('category, COUNT(*) as count')
                                                 ->pluck('count', 'category')
                                                 ->toArray(),
                'avg_price' => MarketplaceProduct::active()->avg('price')
            ];
        });

        return [
            'products' => $products,
            'featured' => $featured,
            'categories' => $this->getCategories(),
            'filters' => [
                'search' => $request->get('search', ''),
                'type' => $request->get('type', ''),
                'category' => $request->get('category', ''),
                'min_price' => $request->get('min_price', ''),
                'max_price' => $request->get('max_price', ''),
                'min_rating' => $request->get('min_rating', ''),
                'sort' => $request->get('sort', 'featured'),
            ],
            'stats' => $stats
        ];
    }

    /**
     * Mostrar producto individual (OPTIMIZADO)
     */
    public function show(MarketplaceProduct $product)
    {
        try {
            // Incrementar vistas usando método optimizado para Octane
            $product->incrementViews();

            // Cache key para datos del producto
            $cacheKey = "product_details_{$product->id}";
            
            $productData = Cache::remember($cacheKey, 600, function() use ($product) {
                return $product->load([
                    'seller:id,username,full_name,avatar,bio,github_username',
                    'reviews' => function($query) {
                        $query->with('reviewer:id,username,full_name,avatar')
                              ->where('status', 'approved')
                              ->latest()
                              ->limit(10);
                    }
                ]);
            });

            // Productos relacionados
            $related = MarketplaceProduct::active()
                                        ->where('category', $product->category)
                                        ->where('id', '!=', $product->id)
                                        ->with(['seller:id,username,full_name'])
                                        ->select([
                                            'id', 'seller_id', 'title', 'short_description',
                                            'price', 'currency', 'images', 'avg_rating', 'slug'
                                        ])
                                        ->limit(4)
                                        ->get();

            // Verificar si el usuario actual ya compró este producto
            $hasPurchased = false;
            if (Auth::check()) {
                $hasPurchased = DB::table('marketplace_purchases')
                                 ->where('buyer_id', Auth::id())
                                 ->where('product_id', $product->id)
                                 ->where('status', 'completed')
                                 ->exists();
            }

            return Inertia::render('Marketplace/ProductDetail', [
                'product' => $productData,
                'related' => $related,
                'has_purchased' => $hasPurchased,
                'can_review' => $hasPurchased && Auth::check(),
                'github_verified' => $product->github_verified,
            ]);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al cargar el producto: ' . $e->getMessage()]);
        }
    }

    /**
     * Mostrar formulario para crear producto
     */
    public function create()
    {
        return Inertia::render('Marketplace/CreateProduct', [
            'types' => $this->getProductTypes(),
            'categories' => $this->getCategories(),
            'tech_stacks' => $this->getTechStacks(),
        ]);
    }

    /**
     * Guardar nuevo producto (OPTIMIZADO)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'short_description' => 'required|string|max:500',
                'description' => 'required|string',
                'price' => 'required|numeric|min:1|max:9999.99',
                'currency' => 'required|in:USD,EUR,GBP',
                'type' => ['required', Rule::in($this->getProductTypes())],
                'category' => ['required', Rule::in(array_keys($this->getCategories()))],
                'tech_stack' => 'required|array|min:1',
                'tech_stack.*' => 'string|max:50',
                'features' => 'required|array|min:1',
                'features.*' => 'string|max:255',
                'complexity' => 'required|in:basic,intermediate,advanced,expert',
                'github_repo' => 'nullable|string|regex:/^[\w\-\.]+\/[\w\-\.]+$/',
                'demo_url' => 'nullable|url',
                'live_preview_url' => 'nullable|url',
                'demo_credentials' => 'nullable|array',
                'demo_credentials.username' => 'nullable|string',
                'demo_credentials.password' => 'nullable|string',
                'images' => 'required|array|min:1|max:10',
                'images.*' => 'url',
                'videos' => 'nullable|array|max:5',
                'videos.*' => 'url',
                'installation_guide' => 'nullable|string',
                'documentation_url' => 'nullable|url',
                'delivery_method' => 'required|in:github_release,zip_file,git_access',
                'includes_support' => 'boolean',
                'support_duration_days' => 'nullable|required_if:includes_support,true|integer|min:1|max:365',
                'included_files' => 'required|array|min:1',
                'included_files.*' => 'string|max:100',
                'tags' => 'nullable|array|max:10',
                'tags.*' => 'string|max:30',
                'allow_refunds' => 'boolean',
                'refund_period_days' => 'nullable|required_if:allow_refunds,true|integer|min:1|max:30',
            ]);

            DB::beginTransaction();

            // Crear el producto
            $product = MarketplaceProduct::create([
                ...$validated,
                'seller_id' => Auth::id(),
                'status' => 'pending_review',
                'commission_rate' => 10.00, // Default 10%
            ]);

            // Verificar GitHub si se proporcionó
            if (!empty($validated['github_repo'])) {
                $this->verifyGitHubRepository($product);
            }

            // Limpiar cache relacionado
            Cache::tags(['marketplace'])->flush();

            // Notificar a admins sobre nuevo producto
            $this->notificationService->newProductSubmitted(Auth::user(), $product);

            DB::commit();

            return redirect()
                ->route('marketplace.products.show', $product->slug)
                ->with('success', '¡Producto creado exitosamente! Está en revisión y será publicado pronto.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el producto: ' . $e->getMessage()]);
        }
    }

    /**
     * Verificar repositorio GitHub (método privado)
     */
    private function verifyGitHubRepository(MarketplaceProduct $product): void
    {
        if (empty($product->github_repo)) {
            return;
        }

        try {
            $verification = $this->githubService->verifyRepository($product->github_repo);
            
            $product->update([
                'github_verified' => $verification['exists'] && ($verification['is_public'] ?? false),
                'github_last_verified' => now(),
            ]);

            // Si la verificación falla, agregar nota
            if (!$verification['exists']) {
                $product->update([
                    'rejection_reason' => 'Repositorio GitHub no encontrado o es privado: ' . ($verification['error'] ?? 'Unknown error')
                ]);
            }

        } catch (\Exception $e) {
            $product->update([
                'github_verified' => false,
                'rejection_reason' => 'Error al verificar repositorio GitHub: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * API: Buscar productos (OPTIMIZADO para autcompletar)
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $cacheKey = "search_" . md5($query);
        
        $results = Cache::remember($cacheKey, 300, function() use ($query) {
            return MarketplaceProduct::active()
                                    ->search($query)
                                    ->with(['seller:id,username'])
                                    ->select([
                                        'id', 'seller_id', 'title', 'short_description',
                                        'price', 'currency', 'images', 'avg_rating', 'slug'
                                    ])
                                    ->limit(10)
                                    ->get();
        });

        return response()->json($results);
    }

    /**
     * Obtener categorías disponibles
     */
    private function getCategories(): array
    {
        return [
            'web_development' => 'Desarrollo Web',
            'mobile_development' => 'Desarrollo Mobile',
            'desktop_application' => 'Aplicaciones Desktop',
            'cms_theme' => 'Temas CMS',
            'wordpress_plugin' => 'Plugins WordPress',
            'automation_script' => 'Scripts de Automatización',
            'api_integration' => 'Integración de APIs',
            'ui_template' => 'Templates UI/UX',
            'database_design' => 'Diseño de Base de Datos',
            'other' => 'Otros'
        ];
    }

    /**
     * Obtener tipos de producto disponibles
     */
    private function getProductTypes(): array
    {
        return [
            'frontend', 'backend', 'fullstack', 'mobile',
            'wordpress', 'plugin', 'theme', 'automation',
            'api', 'library', 'template', 'other'
        ];
    }

    /**
     * Obtener stack tecnológico común
     */
    private function getTechStacks(): array
    {
        return [
            'Frontend' => ['React', 'Vue.js', 'Angular', 'HTML/CSS', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Bootstrap'],
            'Backend' => ['Laravel', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'PHP'],
            'Database' => ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase'],
            'Mobile' => ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin'],
            'DevOps' => ['Docker', 'AWS', 'Azure', 'GCP', 'Kubernetes', 'Nginx'],
            'CMS' => ['WordPress', 'Drupal', 'Joomla', 'Strapi', 'Ghost']
        ];
    }
}