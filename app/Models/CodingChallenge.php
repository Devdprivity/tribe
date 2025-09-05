<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CodingChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'creator_id', 'title', 'description', 'problem_statement', 'test_cases',
        'example_inputs', 'example_outputs', 'constraints', 'difficulty',
        'categories', 'allowed_languages', 'time_limit_seconds', 'memory_limit_mb',
        'hints', 'starter_code', 'is_premium', 'is_published', 'points_reward',
        'submissions_count', 'successful_submissions', 'success_rate'
    ];

    protected $casts = [
        'test_cases' => 'array',
        'example_inputs' => 'array',
        'example_outputs' => 'array',
        'constraints' => 'array',
        'categories' => 'array',
        'allowed_languages' => 'array',
        'starter_code' => 'array',
        'is_premium' => 'boolean',
        'is_published' => 'boolean',
        'success_rate' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class, 'challenge_id');
    }

    public function acceptedSubmissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class, 'challenge_id')
                    ->where('status', 'accepted');
    }

    public function userSubmissions(User $user): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class, 'challenge_id')
                    ->where('user_id', $user->id);
    }

    // SCOPES

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->whereJsonContains('categories', $category);
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->whereJsonContains('allowed_languages', $language);
    }

    public function scopeFree($query)
    {
        return $query->where('is_premium', false);
    }

    public function scopePremium($query)
    {
        return $query->where('is_premium', true);
    }

    public function scopePopular($query)
    {
        return $query->where('submissions_count', '>', 100)
                    ->orderByDesc('submissions_count');
    }

    public function scopeTrending($query, $days = 7)
    {
        return $query->where('created_at', '>', now()->subDays($days))
                    ->orderByDesc('submissions_count');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('problem_statement', 'like', "%{$search}%")
              ->orWhereJsonContains('categories', $search);
        });
    }

    // METHODS

    public function isSolvedByUser(User $user): bool
    {
        return $this->submissions()
                   ->where('user_id', $user->id)
                   ->where('status', 'accepted')
                   ->exists();
    }

    public function isAttemptedByUser(User $user): bool
    {
        return $this->submissions()
                   ->where('user_id', $user->id)
                   ->exists();
    }

    public function getUserBestSubmission(User $user): ?ChallengeSubmission
    {
        return $this->submissions()
                   ->where('user_id', $user->id)
                   ->where('is_best_submission', true)
                   ->first();
    }

    public function getUserSubmissionCount(User $user): int
    {
        return $this->submissions()
                   ->where('user_id', $user->id)
                   ->count();
    }

    public function getUserAcceptedSubmissions(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $this->submissions()
                   ->where('user_id', $user->id)
                   ->where('status', 'accepted')
                   ->orderBy('execution_time_ms')
                   ->get();
    }

    public function getFastestSubmission(): ?ChallengeSubmission
    {
        return $this->acceptedSubmissions()
                   ->orderBy('execution_time_ms')
                   ->first();
    }

    public function getTopSubmissions(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->acceptedSubmissions()
                   ->with('user')
                   ->orderBy('execution_time_ms')
                   ->orderByDesc('score')
                   ->take($limit)
                   ->get();
    }

    public function updateSubmissionStats(): void
    {
        $this->update([
            'submissions_count' => $this->submissions()->count(),
            'successful_submissions' => $this->acceptedSubmissions()->count(),
        ]);

        $this->updateSuccessRate();
    }

    public function updateSuccessRate(): void
    {
        if ($this->submissions_count > 0) {
            $successRate = ($this->successful_submissions / $this->submissions_count) * 100;
            $this->update(['success_rate' => round($successRate, 2)]);
        }
    }

    public function publish(): void
    {
        $this->update(['is_published' => true]);
    }

    public function unpublish(): void
    {
        $this->update(['is_published' => false]);
    }

    public function markAsPremium(): void
    {
        $this->update(['is_premium' => true]);
    }

    public function markAsFree(): void
    {
        $this->update(['is_premium' => false]);
    }

    public function canBeAccessedBy(User $user): bool
    {
        if (!$this->is_published) {
            return $this->creator_id === $user->id;
        }

        if ($this->is_premium) {
            return $user->isPremium() || $this->creator_id === $user->id;
        }

        return true;
    }

    // ACCESSORS

    public function getDifficultyColorAttribute(): string
    {
        return match($this->difficulty) {
            'easy' => 'text-green-500',
            'medium' => 'text-yellow-500',
            'hard' => 'text-orange-500',
            'expert' => 'text-red-500',
            default => 'text-gray-500'
        };
    }

    public function getDifficultyLabelAttribute(): string
    {
        return match($this->difficulty) {
            'easy' => 'Fácil',
            'medium' => 'Medio',
            'hard' => 'Difícil',
            'expert' => 'Experto',
            default => 'No especificado'
        };
    }

    public function getEstimatedTimeAttribute(): string
    {
        return match($this->difficulty) {
            'easy' => '15-30 min',
            'medium' => '30-60 min',
            'hard' => '1-2 horas',
            'expert' => '2+ horas',
            default => 'Variable'
        };
    }

    public function getSuccessRateColorAttribute(): string
    {
        $rate = $this->success_rate;
        if ($rate >= 80) return 'text-green-500';
        if ($rate >= 50) return 'text-yellow-500';
        if ($rate >= 20) return 'text-orange-500';
        return 'text-red-500';
    }

    public function getPopularityLevelAttribute(): string
    {
        $submissions = $this->submissions_count;
        if ($submissions >= 1000) return 'Muy Popular';
        if ($submissions >= 500) return 'Popular';
        if ($submissions >= 100) return 'Conocido';
        if ($submissions >= 10) return 'Emergente';
        return 'Nuevo';
    }

    public function getIsPopularAttribute(): bool
    {
        return $this->submissions_count >= 100;
    }

    public function getIsTrendingAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subWeeks(2)) &&
               $this->submissions_count >= 20;
    }

    public function getTimeLimitLabelAttribute(): string
    {
        $seconds = $this->time_limit_seconds;
        if ($seconds < 60) {
            return $seconds . 's';
        }

        $minutes = intval($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($remainingSeconds > 0) {
            return $minutes . 'm ' . $remainingSeconds . 's';
        }

        return $minutes . 'm';
    }

    public function getMemoryLimitLabelAttribute(): string
    {
        return $this->memory_limit_mb . ' MB';
    }

    public function getFormattedCategoriesAttribute(): array
    {
        $categoryLabels = [
            'algorithms' => 'Algoritmos',
            'data-structures' => 'Estructuras de Datos',
            'dynamic-programming' => 'Programación Dinámica',
            'graph-theory' => 'Teoría de Grafos',
            'string-manipulation' => 'Manipulación de Strings',
            'array-problems' => 'Problemas de Arrays',
            'tree-traversal' => 'Recorrido de Árboles',
            'sorting-searching' => 'Ordenamiento y Búsqueda',
            'mathematical' => 'Matemáticos',
            'greedy' => 'Algoritmos Greedy',
            'backtracking' => 'Backtracking',
            'bit-manipulation' => 'Manipulación de Bits',
            'database' => 'Base de Datos',
            'system-design' => 'Diseño de Sistemas',
            'web-development' => 'Desarrollo Web',
        ];

        return array_map(function ($category) use ($categoryLabels) {
            return $categoryLabels[$category] ?? ucfirst(str_replace('-', ' ', $category));
        }, $this->categories ?? []);
    }

    // STATIC METHODS

    public static function getPopularCategories(int $limit = 20): array
    {
        return static::published()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(categories, "$[*]")) as category')
                   ->whereNotNull('categories')
                   ->groupBy('category')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('category')
                   ->toArray();
    }

    public static function getDifficultyStats(): array
    {
        return static::published()
                   ->selectRaw('difficulty, COUNT(*) as count, AVG(success_rate) as avg_success_rate')
                   ->groupBy('difficulty')
                   ->orderByRaw("FIELD(difficulty, 'easy', 'medium', 'hard', 'expert')")
                   ->get()
                   ->toArray();
    }

    public static function getLanguagePopularity(): array
    {
        return static::published()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(allowed_languages, "$[*]")) as language')
                   ->whereNotNull('allowed_languages')
                   ->groupBy('language')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit(15)
                   ->pluck('language')
                   ->toArray();
    }

    public static function getTrendingChallenges(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::published()
                   ->trending(7)
                   ->with('creator')
                   ->take($limit)
                   ->get();
    }

    public static function getRecommendedFor(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        // Get user's skill level based on solved challenges
        $solvedCount = ChallengeSubmission::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->distinct('challenge_id')
            ->count();

        $recommendedDifficulty = match(true) {
            $solvedCount >= 50 => ['hard', 'expert'],
            $solvedCount >= 20 => ['medium', 'hard'],
            $solvedCount >= 5 => ['easy', 'medium'],
            default => ['easy']
        };

        return static::published()
                   ->whereIn('difficulty', $recommendedDifficulty)
                   ->whereNotIn('id', function ($query) use ($user) {
                       $query->select('challenge_id')
                             ->from('challenge_submissions')
                             ->where('user_id', $user->id)
                             ->where('status', 'accepted');
                   })
                   ->orderByDesc('submissions_count')
                   ->take($limit)
                   ->get();
    }
}