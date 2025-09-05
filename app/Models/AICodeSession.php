<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AICodeSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'type', 'language', 'framework', 'description',
        'original_code', 'generated_code', 'optimized_code', 'context',
        'error_message', 'ai_analysis', 'suggestions', 'status',
        'duration_minutes', 'complexity_score', 'rating', 'feedback',
        'metadata'
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'suggestions' => 'array',
        'metadata' => 'array',
        'complexity_score' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // SCOPES

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('language', $language);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>', now()->subDays($days));
    }

    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating)
                    ->whereNotNull('rating');
    }

    public function scopeWithCode($query)
    {
        return $query->where(function ($q) {
            $q->whereNotNull('original_code')
              ->orWhereNotNull('generated_code')
              ->orWhereNotNull('optimized_code');
        });
    }

    // METHODS

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function hasOriginalCode(): bool
    {
        return !empty($this->original_code);
    }

    public function hasGeneratedCode(): bool
    {
        return !empty($this->generated_code);
    }

    public function hasOptimizedCode(): bool
    {
        return !empty($this->optimized_code);
    }

    public function getMainCode(): ?string
    {
        return $this->optimized_code ?? 
               $this->generated_code ?? 
               $this->original_code;
    }

    public function getCodeLinesCount(): int
    {
        $code = $this->getMainCode();
        if (!$code) {
            return 0;
        }

        return substr_count($code, "\n") + 1;
    }

    public function calculateComplexityScore(): float
    {
        $code = $this->getMainCode();
        if (!$code) {
            return 0;
        }

        $score = 0;
        $lowercaseCode = strtolower($code);

        // Complexity indicators with weights
        $indicators = [
            'for' => 1,
            'while' => 1,
            'if' => 0.5,
            'switch' => 0.7,
            'case' => 0.3,
            'function' => 0.8,
            'class' => 1.2,
            'try' => 0.6,
            'catch' => 0.4,
        ];

        foreach ($indicators as $indicator => $weight) {
            $count = substr_count($lowercaseCode, $indicator);
            $score += $count * $weight;
        }

        // Normalize by lines of code
        $linesCount = $this->getCodeLinesCount();
        if ($linesCount > 0) {
            $score = $score / $linesCount * 10; // Scale factor
        }

        return min(round($score, 2), 10.0); // Cap at 10
    }

    public function updateComplexityScore(): void
    {
        $this->update(['complexity_score' => $this->calculateComplexityScore()]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'duration_minutes' => $this->created_at->diffInMinutes(now()),
        ]);

        $this->updateComplexityScore();
    }

    public function markAsInProgress(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    public function addRating(int $rating, ?string $feedback = null): void
    {
        $this->update([
            'rating' => $rating,
            'feedback' => $feedback,
        ]);
    }

    public function getImprovementMetrics(): array
    {
        if (!$this->hasOriginalCode()) {
            return [];
        }

        $original = $this->original_code;
        $improved = $this->optimized_code ?? $this->generated_code;

        if (!$improved) {
            return [];
        }

        return [
            'original_lines' => substr_count($original, "\n") + 1,
            'improved_lines' => substr_count($improved, "\n") + 1,
            'lines_reduction' => (substr_count($original, "\n") + 1) - (substr_count($improved, "\n") + 1),
            'original_complexity' => $this->estimateCodeComplexity($original),
            'improved_complexity' => $this->estimateCodeComplexity($improved),
        ];
    }

    private function estimateCodeComplexity(string $code): int
    {
        $complexity = 1; // Base complexity
        $lowercaseCode = strtolower($code);

        $complexityPatterns = [
            'if' => 1,
            'for' => 2,
            'while' => 2,
            'switch' => 1,
            'case' => 1,
            'catch' => 1,
            '&&' => 1,
            '||' => 1,
        ];

        foreach ($complexityPatterns as $pattern => $weight) {
            $complexity += substr_count($lowercaseCode, $pattern) * $weight;
        }

        return $complexity;
    }

    public function getPerformanceInsights(): array
    {
        $insights = [];
        
        if ($this->duration_minutes) {
            if ($this->duration_minutes < 5) {
                $insights[] = 'Sesión rápida - completada eficientemente';
            } elseif ($this->duration_minutes > 30) {
                $insights[] = 'Sesión extensa - problema complejo resuelto';
            }
        }

        if ($this->complexity_score) {
            if ($this->complexity_score > 7) {
                $insights[] = 'Código de alta complejidad';
            } elseif ($this->complexity_score < 3) {
                $insights[] = 'Código simple y limpio';
            }
        }

        if ($this->type === 'optimization' && $this->hasOptimizedCode()) {
            $metrics = $this->getImprovementMetrics();
            if (!empty($metrics) && $metrics['lines_reduction'] > 0) {
                $insights[] = "Reducción de {$metrics['lines_reduction']} líneas de código";
            }
        }

        return $insights;
    }

    // ACCESSORS

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'code_review' => 'Code Review',
            'debugging' => 'Debugging',
            'optimization' => 'Optimización',
            'code_generation' => 'Generación de Código',
            'code_explanation' => 'Explicación de Código',
            'refactoring' => 'Refactorización',
            'testing' => 'Testing',
            default => 'Sesión General'
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'code_review' => '🔍',
            'debugging' => '🐛',
            'optimization' => '⚡',
            'code_generation' => '⚡',
            'code_explanation' => '📚',
            'refactoring' => '🔧',
            'testing' => '✅',
            default => '💻'
        };
    }

    public function getLanguageLabelAttribute(): ?string
    {
        if (!$this->language) {
            return null;
        }

        return match($this->language) {
            'javascript' => 'JavaScript',
            'typescript' => 'TypeScript',
            'python' => 'Python',
            'java' => 'Java',
            'php' => 'PHP',
            'cpp' => 'C++',
            'csharp' => 'C#',
            'ruby' => 'Ruby',
            'go' => 'Go',
            'rust' => 'Rust',
            default => ucfirst($this->language)
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'completed' => 'Completado',
            'in_progress' => 'En Progreso',
            'failed' => 'Falló',
            'pending' => 'Pendiente',
            default => 'Desconocido'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'completed' => 'text-green-500',
            'in_progress' => 'text-blue-500',
            'failed' => 'text-red-500',
            'pending' => 'text-yellow-500',
            default => 'text-gray-500'
        };
    }

    public function getComplexityLevelAttribute(): string
    {
        if (!$this->complexity_score) {
            return 'Desconocido';
        }

        return match(true) {
            $this->complexity_score >= 8 => 'Muy Alto',
            $this->complexity_score >= 6 => 'Alto',
            $this->complexity_score >= 4 => 'Medio',
            $this->complexity_score >= 2 => 'Bajo',
            default => 'Muy Bajo'
        };
    }

    public function getComplexityColorAttribute(): string
    {
        if (!$this->complexity_score) {
            return 'text-gray-500';
        }

        return match(true) {
            $this->complexity_score >= 8 => 'text-red-500',
            $this->complexity_score >= 6 => 'text-orange-500',
            $this->complexity_score >= 4 => 'text-yellow-500',
            $this->complexity_score >= 2 => 'text-green-500',
            default => 'text-blue-500'
        };
    }

    public function getFormattedDurationAttribute(): ?string
    {
        if (!$this->duration_minutes) {
            return null;
        }

        if ($this->duration_minutes < 60) {
            return $this->duration_minutes . 'm';
        }

        $hours = intval($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($minutes > 0) {
            return $hours . 'h ' . $minutes . 'm';
        }

        return $hours . 'h';
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subHours(24));
    }

    public function getIsRatedAttribute(): bool
    {
        return !is_null($this->rating);
    }

    public function getRatingStarsAttribute(): string
    {
        if (!$this->rating) {
            return '';
        }

        return str_repeat('⭐', $this->rating);
    }

    public function getSessionAgeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // STATIC METHODS

    public static function getUserStats(User $user): array
    {
        $sessions = static::where('user_id', $user->id);

        return [
            'total_sessions' => $sessions->count(),
            'completed_sessions' => $sessions->completed()->count(),
            'total_duration' => $sessions->sum('duration_minutes'),
            'average_complexity' => $sessions->whereNotNull('complexity_score')->avg('complexity_score'),
            'favorite_language' => static::getUserFavoriteLanguage($user),
            'favorite_type' => static::getUserFavoriteType($user),
            'completion_rate' => static::getUserCompletionRate($user),
        ];
    }

    public static function getUserFavoriteLanguage(User $user): ?string
    {
        return static::where('user_id', $user->id)
                   ->whereNotNull('language')
                   ->selectRaw('language, COUNT(*) as count')
                   ->groupBy('language')
                   ->orderByDesc('count')
                   ->first()
                   ?->language;
    }

    public static function getUserFavoriteType(User $user): ?string
    {
        return static::where('user_id', $user->id)
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderByDesc('count')
                   ->first()
                   ?->type;
    }

    public static function getUserCompletionRate(User $user): float
    {
        $total = static::where('user_id', $user->id)->count();
        if ($total === 0) return 0;

        $completed = static::where('user_id', $user->id)->completed()->count();
        return round(($completed / $total) * 100, 2);
    }

    public static function getPopularLanguages(int $days = 30): array
    {
        return static::whereNotNull('language')
                   ->recent($days)
                   ->selectRaw('language, COUNT(*) as count')
                   ->groupBy('language')
                   ->orderByDesc('count')
                   ->limit(10)
                   ->get()
                   ->toArray();
    }

    public static function getTypeDistribution(int $days = 30): array
    {
        return static::recent($days)
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderByDesc('count')
                   ->get()
                   ->toArray();
    }

    public static function getComplexityTrends(int $days = 30): array
    {
        return static::recent($days)
                   ->whereNotNull('complexity_score')
                   ->selectRaw('DATE(created_at) as date, AVG(complexity_score) as avg_complexity')
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get()
                   ->toArray();
    }

    public static function getProductivityMetrics(): array
    {
        $recentSessions = static::recent(7);

        return [
            'sessions_this_week' => $recentSessions->count(),
            'avg_session_duration' => $recentSessions->avg('duration_minutes'),
            'completion_rate' => static::getGlobalCompletionRate(),
            'most_active_language' => static::getMostActiveLanguage(),
            'complexity_trend' => static::getComplexityTrend(),
        ];
    }

    public static function getGlobalCompletionRate(): float
    {
        $total = static::count();
        if ($total === 0) return 0;

        $completed = static::completed()->count();
        return round(($completed / $total) * 100, 2);
    }

    public static function getMostActiveLanguage(): ?string
    {
        return static::whereNotNull('language')
                   ->recent(7)
                   ->selectRaw('language, COUNT(*) as count')
                   ->groupBy('language')
                   ->orderByDesc('count')
                   ->first()
                   ?->language;
    }

    public static function getComplexityTrend(): string
    {
        $thisWeek = static::recent(7)->whereNotNull('complexity_score')->avg('complexity_score');
        $lastWeek = static::whereBetween('created_at', [now()->subWeeks(2), now()->subWeek()])
                         ->whereNotNull('complexity_score')
                         ->avg('complexity_score');

        if (!$thisWeek || !$lastWeek) {
            return 'stable';
        }

        $change = (($thisWeek - $lastWeek) / $lastWeek) * 100;

        if ($change > 10) return 'increasing';
        if ($change < -10) return 'decreasing';
        return 'stable';
    }
}