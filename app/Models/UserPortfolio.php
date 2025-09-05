<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class UserPortfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'slug', 'title', 'bio', 'tagline', 'specializations', 'tech_stack',
        'avatar_url', 'resume_url', 'contact_info', 'social_links', 'location',
        'available_for_hire', 'preferred_work_types', 'hourly_rate', 'currency',
        'theme_settings', 'is_public', 'seo_optimized', 'seo_meta', 'views_count',
        'rating', 'reviews_count'
    ];

    protected $casts = [
        'specializations' => 'array',
        'tech_stack' => 'array',
        'contact_info' => 'array',
        'social_links' => 'array',
        'preferred_work_types' => 'array',
        'theme_settings' => 'array',
        'seo_meta' => 'array',
        'is_public' => 'boolean',
        'available_for_hire' => 'boolean',
        'seo_optimized' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(PortfolioProject::class, 'portfolio_id');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(PortfolioExperience::class, 'portfolio_id');
    }

    public function education(): HasMany
    {
        return $this->hasMany(PortfolioEducation::class, 'portfolio_id');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(PortfolioSkill::class, 'portfolio_id');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(PortfolioTestimonial::class, 'portfolio_id');
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(PortfolioInteraction::class, 'portfolio_id');
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(PortfolioAnalytics::class, 'portfolio_id');
    }

    // SCOPES

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeAvailableForHire($query)
    {
        return $query->where('available_for_hire', true);
    }

    public function scopeBySpecialization($query, $specialization)
    {
        return $query->whereJsonContains('specializations', $specialization);
    }

    public function scopeByTech($query, $tech)
    {
        return $query->whereJsonContains('tech_stack', $tech);
    }

    public function scopeInLocation($query, $location)
    {
        return $query->where('location', 'like', "%{$location}%");
    }

    public function scopeHighRated($query, $minRating = 4.0)
    {
        return $query->where('rating', '>=', $minRating);
    }

    public function scopePopular($query)
    {
        return $query->orderByDesc('views_count')
                    ->orderByDesc('rating');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('updated_at', '>', now()->subDays($days));
    }

    // METHODS

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function getPublicUrl(): string
    {
        return route('portfolio.show', $this->slug);
    }

    public function generateUniqueSlug(string $baseSlug): string
    {
        $slug = Str::slug($baseSlug);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? null)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function getCompletionPercentage(): int
    {
        $fields = [
            'bio' => !empty($this->bio),
            'tagline' => !empty($this->tagline),
            'avatar_url' => !empty($this->avatar_url),
            'location' => !empty($this->location),
            'social_links' => !empty($this->social_links),
            'projects' => $this->projects()->count() >= 3,
            'experiences' => $this->experiences()->count() >= 1,
            'skills' => $this->skills()->count() >= 5,
            'education' => $this->education()->count() >= 1,
        ];

        $completed = array_sum($fields);
        $total = count($fields);

        return round(($completed / $total) * 100);
    }

    public function getTotalProjects(): int
    {
        return $this->projects()->count();
    }

    public function getFeaturedProjects()
    {
        return $this->projects()->where('is_featured', true)->get();
    }

    public function getCurrentExperience(): ?PortfolioExperience
    {
        return $this->experiences()->where('is_current', true)->first();
    }

    public function getPrimarySkills()
    {
        return $this->skills()->where('is_primary', true)->get();
    }

    public function getApprovedTestimonials()
    {
        return $this->testimonials()->where('is_approved', true)->get();
    }

    public function getTotalYearsExperience(): int
    {
        $experiences = $this->experiences()->get();
        $totalMonths = 0;

        foreach ($experiences as $exp) {
            $endDate = $exp->end_date ?? now();
            $months = $exp->start_date->diffInMonths($endDate);
            $totalMonths += $months;
        }

        return max(1, intval($totalMonths / 12));
    }

    public function getEngagementRate(): float
    {
        if ($this->views_count === 0) return 0;

        $engagements = $this->interactions()
            ->whereIn('type', ['like', 'share', 'contact', 'hire_inquiry'])
            ->count();

        return round(($engagements / $this->views_count) * 100, 2);
    }

    public function getConversionRate(): float
    {
        if ($this->views_count === 0) return 0;

        $conversions = $this->interactions()
            ->whereIn('type', ['contact', 'hire_inquiry'])
            ->count();

        return round(($conversions / $this->views_count) * 100, 2);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function updateRating(): void
    {
        $avgRating = $this->testimonials()
            ->where('is_approved', true)
            ->avg('rating');

        if ($avgRating) {
            $this->update([
                'rating' => round($avgRating, 2),
                'reviews_count' => $this->testimonials()
                    ->where('is_approved', true)
                    ->count(),
            ]);
        }
    }

    // ACCESSORS

    public function getFormattedHourlyRateAttribute(): ?string
    {
        if (!$this->hourly_rate) return null;

        return number_format($this->hourly_rate, 2) . ' ' . $this->currency . '/hora';
    }

    public function getFormattedSpecializationsAttribute(): array
    {
        $labels = [
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

        return array_map(function ($spec) use ($labels) {
            return $labels[$spec] ?? ucfirst(str_replace('_', ' ', $spec));
        }, $this->specializations ?? []);
    }

    public function getAvailabilityStatusAttribute(): string
    {
        return $this->available_for_hire ? 'Disponible' : 'No disponible';
    }

    public function getAvailabilityColorAttribute(): string
    {
        return $this->available_for_hire ? 'text-green-500' : 'text-gray-500';
    }

    public function getRatingStarsAttribute(): string
    {
        if (!$this->rating) return '';

        $fullStars = floor($this->rating);
        $hasHalfStar = ($this->rating - $fullStars) >= 0.5;
        $emptyStars = 5 - $fullStars - ($hasHalfStar ? 1 : 0);

        return str_repeat('★', $fullStars) . 
               ($hasHalfStar ? '☆' : '') . 
               str_repeat('☆', $emptyStars);
    }

    public function getProfileCompletionStatusAttribute(): array
    {
        $completion = $this->getCompletionPercentage();
        
        return [
            'percentage' => $completion,
            'status' => match(true) {
                $completion >= 90 => 'excellent',
                $completion >= 70 => 'good',
                $completion >= 50 => 'fair',
                default => 'needs_work'
            },
            'color' => match(true) {
                $completion >= 90 => 'text-green-500',
                $completion >= 70 => 'text-blue-500',
                $completion >= 50 => 'text-yellow-500',
                default => 'text-red-500'
            }
        ];
    }

    public function getLastUpdatedAttribute(): string
    {
        return $this->updated_at->diffForHumans();
    }

    public function getSeoScoreAttribute(): int
    {
        $score = 0;

        // Title optimization (0-20 points)
        if (strlen($this->title) >= 30 && strlen($this->title) <= 60) {
            $score += 20;
        } elseif (strlen($this->title) >= 20) {
            $score += 10;
        }

        // Bio content (0-20 points)
        if (strlen($this->bio ?? '') >= 200) {
            $score += 20;
        } elseif (strlen($this->bio ?? '') >= 100) {
            $score += 10;
        }

        // Projects (0-20 points)
        $projectCount = $this->projects()->count();
        if ($projectCount >= 5) {
            $score += 20;
        } elseif ($projectCount >= 3) {
            $score += 15;
        } elseif ($projectCount >= 1) {
            $score += 10;
        }

        // Skills (0-15 points)
        $skillCount = $this->skills()->count();
        if ($skillCount >= 8) {
            $score += 15;
        } elseif ($skillCount >= 5) {
            $score += 10;
        }

        // Social links (0-10 points)
        if (count($this->social_links ?? []) >= 3) {
            $score += 10;
        } elseif (count($this->social_links ?? []) >= 1) {
            $score += 5;
        }

        // Experience (0-15 points)
        if ($this->experiences()->count() >= 2) {
            $score += 15;
        } elseif ($this->experiences()->count() >= 1) {
            $score += 10;
        }

        return $score;
    }

    public function getVisibilityStatusAttribute(): array
    {
        return [
            'is_public' => $this->is_public,
            'label' => $this->is_public ? 'Público' : 'Privado',
            'color' => $this->is_public ? 'text-green-500' : 'text-gray-500',
        ];
    }

    // STATIC METHODS

    public static function getTopPerformers(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::public()
                   ->orderByDesc('rating')
                   ->orderByDesc('views_count')
                   ->with(['user', 'projects' => function ($query) {
                       $query->where('is_featured', true)->take(2);
                   }])
                   ->take($limit)
                   ->get();
    }

    public static function getAvailableForHire(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return static::public()
                   ->availableForHire()
                   ->orderByDesc('rating')
                   ->orderByDesc('updated_at')
                   ->with(['user', 'skills' => function ($query) {
                       $query->where('is_primary', true)->take(5);
                   }])
                   ->take($limit)
                   ->get();
    }

    public static function getRecentlyUpdated(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::public()
                   ->orderByDesc('updated_at')
                   ->with(['user', 'projects' => function ($query) {
                       $query->orderByDesc('created_at')->take(1);
                   }])
                   ->take($limit)
                   ->get();
    }

    public static function getBySpecializationStats(): array
    {
        return static::public()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(specializations, "$[*]")) as spec')
                   ->whereNotNull('specializations')
                   ->groupBy('spec')
                   ->selectRaw('spec, COUNT(*) as count')
                   ->orderByDesc('count')
                   ->limit(15)
                   ->get()
                   ->map(function ($item) {
                       return [
                           'specialization' => $item->spec,
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getTechStackStats(): array
    {
        return static::public()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tech_stack, "$[*]")) as tech')
                   ->whereNotNull('tech_stack')
                   ->groupBy('tech')
                   ->selectRaw('tech, COUNT(*) as count')
                   ->orderByDesc('count')
                   ->limit(20)
                   ->get()
                   ->map(function ($item) {
                       return [
                           'technology' => $item->tech,
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getLocationStats(): array
    {
        return static::public()
                   ->whereNotNull('location')
                   ->selectRaw('location, COUNT(*) as count')
                   ->groupBy('location')
                   ->orderByDesc('count')
                   ->limit(20)
                   ->get()
                   ->map(function ($item) {
                       return [
                           'location' => $item->location,
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getGlobalStats(): array
    {
        return [
            'total_portfolios' => static::public()->count(),
            'available_for_hire' => static::public()->availableForHire()->count(),
            'average_rating' => round(static::public()->whereNotNull('rating')->avg('rating'), 2),
            'total_views' => static::public()->sum('views_count'),
            'total_projects' => \App\Models\PortfolioProject::count(),
            'completion_rate' => static::getAverageCompletionRate(),
        ];
    }

    public static function getAverageCompletionRate(): float
    {
        $portfolios = static::all();
        if ($portfolios->isEmpty()) return 0;

        $totalCompletion = $portfolios->sum(function ($portfolio) {
            return $portfolio->getCompletionPercentage();
        });

        return round($totalCompletion / $portfolios->count(), 2);
    }

    public static function searchPortfolios(string $query): \Illuminate\Database\Eloquent\Collection
    {
        return static::public()
                   ->where(function ($q) use ($query) {
                       $q->where('title', 'like', "%{$query}%")
                         ->orWhere('bio', 'like', "%{$query}%")
                         ->orWhereJsonContains('specializations', $query)
                         ->orWhereJsonContains('tech_stack', $query)
                         ->orWhere('location', 'like', "%{$query}%");
                   })
                   ->with(['user', 'projects' => function ($q) {
                       $q->where('is_featured', true)->take(2);
                   }])
                   ->orderByDesc('rating')
                   ->orderByDesc('views_count')
                   ->get();
    }

    public static function getRecommendationsFor(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        // Simple recommendation based on user's skills or interests
        // In a real implementation, this would be more sophisticated
        return static::public()
                   ->availableForHire()
                   ->orderByDesc('rating')
                   ->orderByDesc('views_count')
                   ->take($limit)
                   ->get();
    }
}