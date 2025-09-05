<?php

namespace App\Http\Controllers;

use App\Models\UserPortfolio;
use App\Models\PortfolioProject;
use App\Models\PortfolioExperience;
use App\Models\PortfolioInteraction;
use App\Services\PortfolioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    protected PortfolioService $portfolioService;

    public function __construct(PortfolioService $portfolioService)
    {
        $this->portfolioService = $portfolioService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'search', 'specialization', 'tech_stack', 'available_for_hire', 'location'
        ]);

        $portfolios = UserPortfolio::query()
            ->with(['user', 'projects' => function ($query) {
                $query->where('is_featured', true)->take(3);
            }])
            ->where('is_public', true)
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('bio', 'like', "%{$search}%")
                      ->orWhereJsonContains('specializations', $search)
                      ->orWhereJsonContains('tech_stack', $search);
                });
            })
            ->when($filters['specialization'] ?? null, function ($query, $spec) {
                $query->whereJsonContains('specializations', $spec);
            })
            ->when($filters['tech_stack'] ?? null, function ($query, $tech) {
                $query->whereJsonContains('tech_stack', $tech);
            })
            ->when($filters['available_for_hire'] ?? null, function ($query, $available) {
                if ($available === 'true') {
                    $query->where('available_for_hire', true);
                }
            })
            ->when($filters['location'] ?? null, function ($query, $location) {
                $query->where('location', 'like', "%{$location}%");
            })
            ->orderByDesc('rating')
            ->orderByDesc('views_count')
            ->paginate(20);

        $stats = [
            'total_portfolios' => UserPortfolio::where('is_public', true)->count(),
            'available_for_hire' => UserPortfolio::where('is_public', true)
                ->where('available_for_hire', true)->count(),
            'popular_specializations' => $this->getPopularSpecializations(),
            'popular_tech_stack' => $this->getPopularTechStack(),
        ];

        return Inertia::render('Portfolios/Index', [
            'portfolios' => $portfolios,
            'filters' => $filters,
            'stats' => $stats,
            'specializations' => $this->getSpecializations(),
        ]);
    }

    public function show(string $slug)
    {
        $portfolio = UserPortfolio::where('slug', $slug)
            ->where('is_public', true)
            ->with([
                'user',
                'projects' => function ($query) {
                    $query->orderByDesc('is_featured')->orderByDesc('sort_order');
                },
                'experiences' => function ($query) {
                    $query->orderByDesc('is_current')->orderByDesc('start_date');
                },
                'education' => function ($query) {
                    $query->orderByDesc('is_current')->orderByDesc('start_date');
                },
                'skills' => function ($query) {
                    $query->orderByDesc('is_primary')->orderByDesc('proficiency_level');
                },
                'testimonials' => function ($query) {
                    $query->where('is_approved', true)
                          ->orderByDesc('is_featured')
                          ->orderByDesc('sort_order');
                },
            ])
            ->firstOrFail();

        // Record view
        $this->recordInteraction($portfolio, 'view');

        // Increment view count
        $portfolio->increment('views_count');

        // Get analytics data if owner
        $analytics = null;
        if (Auth::check() && Auth::id() === $portfolio->user_id) {
            $analytics = $this->portfolioService->getPortfolioAnalytics($portfolio);
        }

        return Inertia::render('Portfolios/Show', [
            'portfolio' => $portfolio,
            'analytics' => $analytics,
            'isOwner' => Auth::check() && Auth::id() === $portfolio->user_id,
        ]);
    }

    public function create()
    {
        // Check if user already has a portfolio
        if (Auth::user()->portfolio) {
            return redirect()->route('portfolio.edit');
        }

        return Inertia::render('Portfolios/Create', [
            'specializations' => $this->getSpecializations(),
            'techStack' => $this->getTechStackOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:user_portfolios,slug',
            'bio' => 'nullable|string|max:1000',
            'tagline' => 'nullable|string|max:200',
            'specializations' => 'required|array|min:1',
            'tech_stack' => 'required|array|min:1',
            'location' => 'nullable|string|max:255',
            'available_for_hire' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|array',
            'social_links' => 'nullable|array',
        ]);

        // Ensure slug is URL-friendly
        $slug = Str::slug($request->slug);

        $portfolio = UserPortfolio::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'slug' => $slug,
            'bio' => $request->bio,
            'tagline' => $request->tagline,
            'specializations' => $request->specializations,
            'tech_stack' => $request->tech_stack,
            'location' => $request->location,
            'available_for_hire' => $request->available_for_hire ?? false,
            'hourly_rate' => $request->hourly_rate,
            'contact_info' => $request->contact_info,
            'social_links' => $request->social_links,
            'is_public' => true,
        ]);

        return redirect()->route('portfolio.show', $portfolio->slug)
            ->with('success', 'Portfolio creado exitosamente.');
    }

    public function edit()
    {
        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return redirect()->route('portfolio.create');
        }

        $portfolio->load([
            'projects',
            'experiences',
            'education',
            'skills',
            'testimonials' => function ($query) {
                $query->orderByDesc('is_featured')->orderByDesc('sort_order');
            }
        ]);

        return Inertia::render('Portfolios/Edit', [
            'portfolio' => $portfolio,
            'specializations' => $this->getSpecializations(),
            'techStack' => $this->getTechStackOptions(),
        ]);
    }

    public function update(Request $request)
    {
        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return redirect()->route('portfolio.create');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:user_portfolios,slug,' . $portfolio->id,
            'bio' => 'nullable|string|max:1000',
            'tagline' => 'nullable|string|max:200',
            'specializations' => 'required|array|min:1',
            'tech_stack' => 'required|array|min:1',
            'location' => 'nullable|string|max:255',
            'available_for_hire' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|array',
            'social_links' => 'nullable|array',
            'is_public' => 'boolean',
        ]);

        $portfolio->update([
            'title' => $request->title,
            'slug' => Str::slug($request->slug),
            'bio' => $request->bio,
            'tagline' => $request->tagline,
            'specializations' => $request->specializations,
            'tech_stack' => $request->tech_stack,
            'location' => $request->location,
            'available_for_hire' => $request->available_for_hire ?? false,
            'hourly_rate' => $request->hourly_rate,
            'contact_info' => $request->contact_info,
            'social_links' => $request->social_links,
            'is_public' => $request->is_public ?? true,
        ]);

        return back()->with('success', 'Portfolio actualizado exitosamente.');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB max
        ]);

        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return response()->json(['error' => 'Portfolio no encontrado'], 404);
        }

        try {
            // Delete old avatar if exists
            if ($portfolio->avatar_url) {
                Storage::disk('public')->delete($portfolio->avatar_url);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('portfolio-avatars', 'public');
            $portfolio->update(['avatar_url' => $path]);

            return response()->json([
                'success' => true,
                'avatar_url' => Storage::url($path),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error subiendo imagen'], 500);
        }
    }

    public function uploadResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|mimes:pdf|max:5120', // 5MB max
        ]);

        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return response()->json(['error' => 'Portfolio no encontrado'], 404);
        }

        try {
            // Delete old resume if exists
            if ($portfolio->resume_url) {
                Storage::disk('public')->delete($portfolio->resume_url);
            }

            // Store new resume
            $path = $request->file('resume')->store('portfolio-resumes', 'public');
            $portfolio->update(['resume_url' => $path]);

            return response()->json([
                'success' => true,
                'resume_url' => Storage::url($path),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error subiendo CV'], 500);
        }
    }

    public function contact(Request $request, UserPortfolio $portfolio)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
        ]);

        // Record interaction
        $this->recordInteraction($portfolio, 'contact', $request->message);

        // Send notification email to portfolio owner
        $this->portfolioService->sendContactMessage($portfolio, [
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado exitosamente.',
        ]);
    }

    public function hire(Request $request, UserPortfolio $portfolio)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'budget' => 'nullable|string|max:100',
            'timeline' => 'nullable|string|max:100',
            'project_type' => 'required|string',
        ]);

        // Record interaction
        $this->recordInteraction($portfolio, 'hire_inquiry', $request->message);

        // Send hire inquiry
        $this->portfolioService->sendHireInquiry($portfolio, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Propuesta de trabajo enviada exitosamente.',
        ]);
    }

    public function like(UserPortfolio $portfolio)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $existingLike = PortfolioInteraction::where('portfolio_id', $portfolio->id)
            ->where('user_id', Auth::id())
            ->where('type', 'like')
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $liked = false;
        } else {
            $this->recordInteraction($portfolio, 'like');
            $liked = true;
        }

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes_count' => $portfolio->interactions()->where('type', 'like')->count(),
        ]);
    }

    public function analytics()
    {
        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return redirect()->route('portfolio.create');
        }

        $analytics = $this->portfolioService->getDetailedAnalytics($portfolio);

        return Inertia::render('Portfolios/Analytics', [
            'portfolio' => $portfolio,
            'analytics' => $analytics,
        ]);
    }

    public function downloadAnalytics()
    {
        $portfolio = Auth::user()->portfolio;
        
        if (!$portfolio) {
            return back()->withErrors(['error' => 'Portfolio no encontrado']);
        }

        $analytics = $this->portfolioService->getDetailedAnalytics($portfolio);
        $csv = $this->portfolioService->generateAnalyticsCSV($analytics);

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, "portfolio_analytics_{$portfolio->slug}.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function share(UserPortfolio $portfolio)
    {
        $this->recordInteraction($portfolio, 'share');

        return response()->json([
            'success' => true,
            'share_url' => route('portfolio.show', $portfolio->slug),
            'message' => 'Portfolio compartido exitosamente.',
        ]);
    }

    private function recordInteraction(UserPortfolio $portfolio, string $type, ?string $message = null): void
    {
        PortfolioInteraction::create([
            'portfolio_id' => $portfolio->id,
            'user_id' => Auth::id(),
            'type' => $type,
            'ip_address' => request()->ip(),
            'message' => $message,
            'metadata' => [
                'user_agent' => request()->header('User-Agent'),
                'referer' => request()->header('Referer'),
                'timestamp' => now()->toISOString(),
            ],
        ]);
    }

    private function getPopularSpecializations(): array
    {
        return UserPortfolio::where('is_public', true)
            ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(specializations, "$[*]")) as spec')
            ->whereNotNull('specializations')
            ->groupBy('spec')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(10)
            ->pluck('spec')
            ->toArray();
    }

    private function getPopularTechStack(): array
    {
        return UserPortfolio::where('is_public', true)
            ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tech_stack, "$[*]")) as tech')
            ->whereNotNull('tech_stack')
            ->groupBy('tech')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(15)
            ->pluck('tech')
            ->toArray();
    }

    private function getSpecializations(): array
    {
        return [
            'full_stack' => 'Full Stack Developer',
            'frontend' => 'Frontend Developer',
            'backend' => 'Backend Developer',
            'mobile' => 'Mobile Developer',
            'data_scientist' => 'Data Scientist',
            'ml_engineer' => 'ML Engineer',
            'devops' => 'DevOps Engineer',
            'ui_ux' => 'UI/UX Designer',
            'game_dev' => 'Game Developer',
            'blockchain' => 'Blockchain Developer',
            'cloud_architect' => 'Cloud Architect',
            'cybersecurity' => 'Cybersecurity Specialist',
            'product_manager' => 'Product Manager',
            'tech_lead' => 'Tech Lead',
        ];
    }

    private function getTechStackOptions(): array
    {
        return [
            // Frontend
            'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Svelte',
            'HTML5', 'CSS3', 'Sass', 'Tailwind CSS', 'Bootstrap',
            
            // Backend
            'Node.js', 'Python', 'Java', 'PHP', 'C#', 'Ruby', 'Go', 'Rust',
            'Laravel', 'Django', 'Flask', 'Spring Boot', 'Express.js',
            
            // Mobile
            'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin',
            
            // Database
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
            
            // Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
            
            // Others
            'GraphQL', 'REST API', 'Git', 'Linux', 'Nginx',
        ];
    }
}