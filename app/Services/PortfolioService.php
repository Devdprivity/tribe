<?php

namespace App\Services;

use App\Models\UserPortfolio;
use App\Models\PortfolioAnalytics;
use App\Models\PortfolioInteraction;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class PortfolioService
{
    public function getPortfolioAnalytics(UserPortfolio $portfolio): array
    {
        $today = now()->toDateString();
        $lastWeek = now()->subWeek()->toDateString();
        $lastMonth = now()->subMonth()->toDateString();

        return [
            'overview' => $this->getOverviewStats($portfolio),
            'traffic' => $this->getTrafficStats($portfolio),
            'interactions' => $this->getInteractionStats($portfolio),
            'popular_projects' => $this->getPopularProjects($portfolio),
            'referrers' => $this->getTopReferrers($portfolio),
            'geographic' => $this->getGeographicData($portfolio),
        ];
    }

    private function getOverviewStats(UserPortfolio $portfolio): array
    {
        $interactions = $portfolio->interactions();
        
        return [
            'total_views' => $portfolio->views_count,
            'unique_visitors' => $interactions->distinct('ip_address')->count(),
            'contact_inquiries' => $interactions->where('type', 'contact')->count(),
            'hire_inquiries' => $interactions->where('type', 'hire_inquiry')->count(),
            'likes' => $interactions->where('type', 'like')->count(),
            'shares' => $interactions->where('type', 'share')->count(),
            'rating' => $portfolio->rating,
            'reviews_count' => $portfolio->reviews_count,
        ];
    }

    private function getTrafficStats(UserPortfolio $portfolio): array
    {
        $last30Days = now()->subDays(30);
        
        $dailyViews = PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->where('date', '>=', $last30Days)
            ->orderBy('date')
            ->get(['date', 'unique_views', 'total_views'])
            ->toArray();

        return [
            'daily_views' => $dailyViews,
            'peak_day' => $this->getPeakDay($portfolio),
            'average_daily_views' => $this->getAverageDailyViews($portfolio),
            'growth_rate' => $this->calculateGrowthRate($portfolio),
        ];
    }

    private function getInteractionStats(UserPortfolio $portfolio): array
    {
        $interactions = $portfolio->interactions()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type')
            ->toArray();

        return [
            'by_type' => $interactions,
            'engagement_rate' => $this->calculateEngagementRate($portfolio),
            'conversion_rate' => $this->calculateConversionRate($portfolio),
        ];
    }

    private function getPopularProjects(UserPortfolio $portfolio): array
    {
        return $portfolio->projects()
            ->orderByDesc('views_count')
            ->orderByDesc('likes_count')
            ->take(5)
            ->get(['id', 'title', 'views_count', 'likes_count'])
            ->toArray();
    }

    private function getTopReferrers(UserPortfolio $portfolio): array
    {
        return PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->whereNotNull('top_referrers')
            ->selectRaw('JSON_EXTRACT(top_referrers, "$") as referrers')
            ->get()
            ->flatMap(function ($item) {
                return json_decode($item->referrers, true) ?? [];
            })
            ->groupBy('domain')
            ->map->count()
            ->sortDesc()
            ->take(10)
            ->toArray();
    }

    private function getGeographicData(UserPortfolio $portfolio): array
    {
        return PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->whereNotNull('visitor_countries')
            ->selectRaw('JSON_EXTRACT(visitor_countries, "$") as countries')
            ->get()
            ->flatMap(function ($item) {
                return json_decode($item->countries, true) ?? [];
            })
            ->groupBy('country')
            ->map->count()
            ->sortDesc()
            ->take(20)
            ->toArray();
    }

    private function getPeakDay(UserPortfolio $portfolio): ?string
    {
        $peak = PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->orderByDesc('total_views')
            ->first();

        return $peak?->date;
    }

    private function getAverageDailyViews(UserPortfolio $portfolio): float
    {
        return PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->where('date', '>=', now()->subDays(30))
            ->avg('total_views') ?? 0;
    }

    private function calculateGrowthRate(UserPortfolio $portfolio): float
    {
        $thisWeek = PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->where('date', '>=', now()->subWeek())
            ->sum('total_views');

        $lastWeek = PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->whereBetween('date', [now()->subWeeks(2), now()->subWeek()])
            ->sum('total_views');

        if ($lastWeek === 0) return $thisWeek > 0 ? 100 : 0;

        return round((($thisWeek - $lastWeek) / $lastWeek) * 100, 2);
    }

    private function calculateEngagementRate(UserPortfolio $portfolio): float
    {
        $totalViews = $portfolio->views_count;
        if ($totalViews === 0) return 0;

        $engagements = $portfolio->interactions()
            ->whereIn('type', ['like', 'share', 'contact', 'hire_inquiry'])
            ->count();

        return round(($engagements / $totalViews) * 100, 2);
    }

    private function calculateConversionRate(UserPortfolio $portfolio): float
    {
        $totalViews = $portfolio->views_count;
        if ($totalViews === 0) return 0;

        $conversions = $portfolio->interactions()
            ->whereIn('type', ['contact', 'hire_inquiry'])
            ->count();

        return round(($conversions / $totalViews) * 100, 2);
    }

    public function getDetailedAnalytics(UserPortfolio $portfolio): array
    {
        $analytics = $this->getPortfolioAnalytics($portfolio);
        
        return array_merge($analytics, [
            'time_trends' => $this->getTimeTrends($portfolio),
            'project_performance' => $this->getProjectPerformance($portfolio),
            'skill_interest' => $this->getSkillInterest($portfolio),
            'contact_analysis' => $this->getContactAnalysis($portfolio),
        ]);
    }

    private function getTimeTrends(UserPortfolio $portfolio): array
    {
        return [
            'hourly_distribution' => $this->getHourlyDistribution($portfolio),
            'weekly_pattern' => $this->getWeeklyPattern($portfolio),
            'monthly_growth' => $this->getMonthlyGrowth($portfolio),
        ];
    }

    private function getHourlyDistribution(UserPortfolio $portfolio): array
    {
        return $portfolio->interactions()
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('count', 'hour')
            ->toArray();
    }

    private function getWeeklyPattern(UserPortfolio $portfolio): array
    {
        return $portfolio->interactions()
            ->selectRaw('DAYOFWEEK(created_at) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->pluck('count', 'day')
            ->toArray();
    }

    private function getMonthlyGrowth(UserPortfolio $portfolio): array
    {
        return PortfolioAnalytics::where('portfolio_id', $portfolio->id)
            ->selectRaw('YEAR(date) as year, MONTH(date) as month, SUM(total_views) as views')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    private function getProjectPerformance(UserPortfolio $portfolio): array
    {
        return $portfolio->projects()
            ->select([
                'id', 'title', 'category', 'views_count', 'likes_count',
                'created_at'
            ])
            ->orderByDesc('views_count')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'views' => $project->views_count,
                    'likes' => $project->likes_count,
                    'engagement_rate' => $project->views_count > 0 ? 
                        round(($project->likes_count / $project->views_count) * 100, 2) : 0,
                    'age_days' => $project->created_at->diffInDays(now()),
                ];
            })
            ->toArray();
    }

    private function getSkillInterest(UserPortfolio $portfolio): array
    {
        // This would analyze which skills get more attention
        // based on projects views and portfolio interactions
        return $portfolio->skills()
            ->select(['skill_name', 'category', 'proficiency_level'])
            ->get()
            ->groupBy('category')
            ->map(function ($skills) {
                return $skills->pluck('skill_name')->toArray();
            })
            ->toArray();
    }

    private function getContactAnalysis(UserPortfolio $portfolio): array
    {
        $contacts = $portfolio->interactions()
            ->where('type', 'contact')
            ->get();

        $hires = $portfolio->interactions()
            ->where('type', 'hire_inquiry')
            ->get();

        return [
            'total_contacts' => $contacts->count(),
            'total_hire_inquiries' => $hires->count(),
            'contact_sources' => $this->analyzeContactSources($contacts),
            'inquiry_types' => $this->analyzeInquiryTypes($hires),
            'response_patterns' => $this->analyzeResponsePatterns($portfolio),
        ];
    }

    private function analyzeContactSources($contacts): array
    {
        return $contacts->pluck('metadata.referer')
            ->filter()
            ->groupBy()
            ->map->count()
            ->sortDesc()
            ->take(10)
            ->toArray();
    }

    private function analyzeInquiryTypes($hires): array
    {
        return $hires->pluck('metadata.project_type')
            ->filter()
            ->groupBy()
            ->map->count()
            ->sortDesc()
            ->toArray();
    }

    private function analyzeResponsePatterns(UserPortfolio $portfolio): array
    {
        // This would analyze response times and patterns
        // For now, return basic stats
        return [
            'peak_inquiry_days' => ['Monday', 'Tuesday', 'Wednesday'],
            'average_inquiries_per_week' => 2.5,
            'seasonal_trends' => 'Higher activity in Q1 and Q3',
        ];
    }

    public function generateAnalyticsCSV(array $analytics): string
    {
        $csv = "Metric,Value\n";
        
        // Overview stats
        foreach ($analytics['overview'] as $key => $value) {
            $csv .= ucfirst(str_replace('_', ' ', $key)) . "," . $value . "\n";
        }

        $csv .= "\nDaily Views (Last 30 Days)\n";
        $csv .= "Date,Unique Views,Total Views\n";
        
        foreach ($analytics['traffic']['daily_views'] as $day) {
            $csv .= "{$day['date']},{$day['unique_views']},{$day['total_views']}\n";
        }

        $csv .= "\nPopular Projects\n";
        $csv .= "Project,Views,Likes\n";
        
        foreach ($analytics['popular_projects'] as $project) {
            $csv .= "{$project['title']},{$project['views_count']},{$project['likes_count']}\n";
        }

        return $csv;
    }

    public function sendContactMessage(UserPortfolio $portfolio, array $data): void
    {
        // In a real implementation, this would send an email
        // For now, we'll just log or store the message
        \Log::info('Portfolio contact message', [
            'portfolio_id' => $portfolio->id,
            'from' => $data['email'],
            'subject' => $data['subject'],
        ]);

        // You could also use Laravel's Mail facade here:
        // Mail::to($portfolio->user->email)->send(new ContactMessage($data));
    }

    public function sendHireInquiry(UserPortfolio $portfolio, array $data): void
    {
        // Similar to contact message but for hire inquiries
        \Log::info('Portfolio hire inquiry', [
            'portfolio_id' => $portfolio->id,
            'from' => $data['email'],
            'company' => $data['company'] ?? null,
            'budget' => $data['budget'] ?? null,
        ]);
    }

    public function updateDailyAnalytics(UserPortfolio $portfolio): void
    {
        $today = now()->toDateString();
        
        $analytics = PortfolioAnalytics::firstOrNew([
            'portfolio_id' => $portfolio->id,
            'date' => $today,
        ]);

        // Calculate daily metrics
        $todayInteractions = $portfolio->interactions()
            ->whereDate('created_at', $today)
            ->get();

        $analytics->unique_views = $todayInteractions
            ->where('type', 'view')
            ->unique('ip_address')
            ->count();

        $analytics->total_views = $todayInteractions
            ->where('type', 'view')
            ->count();

        $analytics->project_views = $portfolio->projects()
            ->sum('views_count');

        $analytics->contact_clicks = $todayInteractions
            ->where('type', 'contact')
            ->count();

        $analytics->resume_downloads = $todayInteractions
            ->where('type', 'resume_download')
            ->count();

        // Calculate bounce rate (simplified)
        $analytics->bounce_rate = $this->calculateBounceRate($portfolio, $today);

        // Calculate average time spent (simplified)
        $analytics->avg_time_spent = $this->calculateAverageTimeSpent($portfolio, $today);

        $analytics->save();
    }

    private function calculateBounceRate(UserPortfolio $portfolio, string $date): float
    {
        // Simplified bounce rate calculation
        // In a real implementation, you'd track user sessions
        $totalViews = $portfolio->interactions()
            ->whereDate('created_at', $date)
            ->where('type', 'view')
            ->count();

        $engagedViews = $portfolio->interactions()
            ->whereDate('created_at', $date)
            ->whereIn('type', ['like', 'share', 'contact'])
            ->distinct('ip_address')
            ->count();

        if ($totalViews === 0) return 0;

        return round(((($totalViews - $engagedViews) / $totalViews) * 100), 2);
    }

    private function calculateAverageTimeSpent(UserPortfolio $portfolio, string $date): int
    {
        // This would require implementing session tracking
        // For now, return a placeholder value
        return rand(60, 300); // 1-5 minutes in seconds
    }

    public function generateSEOAnalysis(UserPortfolio $portfolio): array
    {
        return [
            'title_optimization' => $this->analyzeTitleOptimization($portfolio),
            'content_quality' => $this->analyzeContentQuality($portfolio),
            'keyword_density' => $this->analyzeKeywordDensity($portfolio),
            'social_signals' => $this->analyzeSocialSignals($portfolio),
            'recommendations' => $this->generateSEORecommendations($portfolio),
        ];
    }

    private function analyzeTitleOptimization(UserPortfolio $portfolio): array
    {
        $titleLength = strlen($portfolio->title);
        
        return [
            'length' => $titleLength,
            'is_optimal' => $titleLength >= 30 && $titleLength <= 60,
            'score' => $this->calculateTitleScore($portfolio->title),
        ];
    }

    private function analyzeContentQuality(UserPortfolio $portfolio): array
    {
        $bioLength = strlen($portfolio->bio ?? '');
        $projectsCount = $portfolio->projects()->count();
        $skillsCount = $portfolio->skills()->count();
        
        return [
            'bio_length' => $bioLength,
            'projects_count' => $projectsCount,
            'skills_count' => $skillsCount,
            'completeness_score' => $this->calculateCompletenessScore($portfolio),
        ];
    }

    private function analyzeKeywordDensity(UserPortfolio $portfolio): array
    {
        $content = $portfolio->bio . ' ' . 
                   implode(' ', $portfolio->specializations) . ' ' .
                   implode(' ', $portfolio->tech_stack);
        
        $words = str_word_count(strtolower($content), 1);
        $wordCounts = array_count_values($words);
        arsort($wordCounts);
        
        return array_slice($wordCounts, 0, 10, true);
    }

    private function analyzeSocialSignals(UserPortfolio $portfolio): array
    {
        return [
            'likes' => $portfolio->interactions()->where('type', 'like')->count(),
            'shares' => $portfolio->interactions()->where('type', 'share')->count(),
            'social_links_count' => count($portfolio->social_links ?? []),
        ];
    }

    private function generateSEORecommendations(UserPortfolio $portfolio): array
    {
        $recommendations = [];
        
        if (strlen($portfolio->title) < 30) {
            $recommendations[] = 'Expande tu título profesional para mejor SEO';
        }
        
        if (strlen($portfolio->bio ?? '') < 200) {
            $recommendations[] = 'Escribe una biografía más detallada (mínimo 200 caracteres)';
        }
        
        if ($portfolio->projects()->count() < 3) {
            $recommendations[] = 'Agrega más proyectos a tu portfolio para mostrar experiencia';
        }
        
        if (empty($portfolio->social_links)) {
            $recommendations[] = 'Conecta tus redes sociales para mayor credibilidad';
        }
        
        return $recommendations;
    }

    private function calculateTitleScore(string $title): int
    {
        $score = 0;
        $length = strlen($title);
        
        // Length score
        if ($length >= 30 && $length <= 60) $score += 40;
        else if ($length >= 20) $score += 20;
        
        // Keyword presence
        $keywords = ['developer', 'engineer', 'designer', 'specialist', 'expert'];
        foreach ($keywords as $keyword) {
            if (stripos($title, $keyword) !== false) {
                $score += 20;
                break;
            }
        }
        
        // Uniqueness (simplified)
        if (!str_contains(strtolower($title), 'developer developer')) $score += 20;
        
        // Readability
        if (substr_count($title, ' ') >= 2) $score += 20;
        
        return min(100, $score);
    }

    private function calculateCompletenessScore(UserPortfolio $portfolio): int
    {
        $score = 0;
        
        if (!empty($portfolio->bio)) $score += 20;
        if (!empty($portfolio->tagline)) $score += 10;
        if ($portfolio->projects()->count() >= 3) $score += 30;
        if ($portfolio->experiences()->count() >= 1) $score += 20;
        if ($portfolio->skills()->count() >= 5) $score += 10;
        if (!empty($portfolio->social_links)) $score += 10;
        
        return $score;
    }
}