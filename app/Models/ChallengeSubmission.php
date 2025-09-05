<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ChallengeSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'challenge_id', 'user_id', 'programming_language', 'code', 'status',
        'test_results', 'execution_time_ms', 'memory_used_mb', 'error_message',
        'score', 'is_best_submission', 'code_metrics'
    ];

    protected $casts = [
        'test_results' => 'array',
        'code_metrics' => 'array',
        'is_best_submission' => 'boolean',
    ];

    // RELATIONSHIPS

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(CodingChallenge::class, 'challenge_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // SCOPES

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('programming_language', $language);
    }

    public function scopeByUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeBestSubmissions($query)
    {
        return $query->where('is_best_submission', true);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>', now()->subDays($days));
    }

    public function scopeFastest($query)
    {
        return $query->accepted()
                    ->orderBy('execution_time_ms');
    }

    public function scopeHighestScore($query)
    {
        return $query->orderByDesc('score');
    }

    // METHODS

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function hasCompilationError(): bool
    {
        return $this->status === 'compilation_error';
    }

    public function hasRuntimeError(): bool
    {
        return $this->status === 'runtime_error';
    }

    public function exceededTimeLimit(): bool
    {
        return $this->status === 'time_limit';
    }

    public function exceededMemoryLimit(): bool
    {
        return $this->status === 'memory_limit';
    }

    public function getPassedTestsCount(): int
    {
        if (!$this->test_results) {
            return 0;
        }

        return collect($this->test_results)->where('passed', true)->count();
    }

    public function getTotalTestsCount(): int
    {
        return count($this->test_results ?? []);
    }

    public function getPassingRate(): float
    {
        $total = $this->getTotalTestsCount();
        if ($total === 0) return 0;

        return ($this->getPassedTestsCount() / $total) * 100;
    }

    public function calculateCodeMetrics(): array
    {
        $code = $this->code;
        
        return [
            'lines_of_code' => substr_count($code, "\n") + 1,
            'character_count' => strlen($code),
            'estimated_complexity' => $this->estimateComplexity($code),
            'language' => $this->programming_language,
            'submission_time' => $this->created_at->toISOString(),
        ];
    }

    private function estimateComplexity(string $code): string
    {
        $complexityIndicators = [
            'for' => 1,
            'while' => 1,
            'if' => 0.5,
            'switch' => 0.5,
            'case' => 0.3,
            'recursion' => 2, // Approximate check
        ];

        $score = 0;
        $lowercaseCode = strtolower($code);

        foreach ($complexityIndicators as $indicator => $weight) {
            if ($indicator === 'recursion') {
                // Simple check for recursive functions
                if (preg_match('/function\s+(\w+).*\1\s*\(/', $lowercaseCode)) {
                    $score += $weight;
                }
            } else {
                $score += substr_count($lowercaseCode, $indicator) * $weight;
            }
        }

        return match(true) {
            $score >= 10 => 'High',
            $score >= 5 => 'Medium',
            $score >= 2 => 'Low',
            default => 'Very Low'
        };
    }

    public function markAsBest(): void
    {
        // Unmark other submissions from the same user for the same challenge
        static::where('challenge_id', $this->challenge_id)
              ->where('user_id', $this->user_id)
              ->where('id', '!=', $this->id)
              ->update(['is_best_submission' => false]);

        $this->update(['is_best_submission' => true]);
    }

    public function getRelativePerformance(): array
    {
        $challenge = $this->challenge;
        
        $allAcceptedSubmissions = $challenge->acceptedSubmissions()
            ->where('id', '!=', $this->id)
            ->get();

        if ($allAcceptedSubmissions->isEmpty()) {
            return [
                'time_percentile' => 100,
                'memory_percentile' => 100,
                'is_fastest' => true,
                'is_most_memory_efficient' => true,
            ];
        }

        $fasterCount = $allAcceptedSubmissions
            ->where('execution_time_ms', '<', $this->execution_time_ms)
            ->count();

        $lessMemoryCount = $allAcceptedSubmissions
            ->where('memory_used_mb', '<', $this->memory_used_mb)
            ->count();

        $totalAccepted = $allAcceptedSubmissions->count() + 1; // +1 for current submission

        return [
            'time_percentile' => round(($fasterCount / $totalAccepted) * 100, 1),
            'memory_percentile' => round(($lessMemoryCount / $totalAccepted) * 100, 1),
            'is_fastest' => $fasterCount === 0,
            'is_most_memory_efficient' => $lessMemoryCount === 0,
            'total_accepted_submissions' => $totalAccepted,
        ];
    }

    // ACCESSORS

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'accepted' => 'text-green-500',
            'pending', 'running' => 'text-blue-500',
            'wrong_answer' => 'text-red-500',
            'time_limit', 'memory_limit' => 'text-orange-500',
            'compilation_error', 'runtime_error' => 'text-red-600',
            default => 'text-gray-500'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'accepted' => 'Aceptado',
            'pending' => 'Pendiente',
            'running' => 'Ejecutando',
            'wrong_answer' => 'Respuesta Incorrecta',
            'time_limit' => 'Tiempo Límite Excedido',
            'memory_limit' => 'Límite de Memoria Excedido',
            'compilation_error' => 'Error de Compilación',
            'runtime_error' => 'Error de Ejecución',
            default => 'Desconocido'
        };
    }

    public function getExecutionTimeLabelAttribute(): ?string
    {
        if (!$this->execution_time_ms) {
            return null;
        }

        $ms = $this->execution_time_ms;
        
        if ($ms < 1000) {
            return $ms . 'ms';
        }

        return round($ms / 1000, 2) . 's';
    }

    public function getMemoryUsedLabelAttribute(): ?string
    {
        if (!$this->memory_used_mb) {
            return null;
        }

        $mb = $this->memory_used_mb;
        
        if ($mb < 1) {
            return round($mb * 1024, 1) . 'KB';
        }

        return round($mb, 1) . 'MB';
    }

    public function getLanguageLabelAttribute(): string
    {
        return match($this->programming_language) {
            'python' => 'Python',
            'javascript' => 'JavaScript',
            'java' => 'Java',
            'cpp' => 'C++',
            'c' => 'C',
            'csharp' => 'C#',
            'php' => 'PHP',
            'ruby' => 'Ruby',
            'go' => 'Go',
            'rust' => 'Rust',
            'swift' => 'Swift',
            'kotlin' => 'Kotlin',
            'typescript' => 'TypeScript',
            'sql' => 'SQL',
            default => ucfirst($this->programming_language)
        };
    }

    public function getCodePreviewAttribute(): string
    {
        $lines = explode("\n", $this->code);
        $preview = array_slice($lines, 0, 5);
        
        if (count($lines) > 5) {
            $preview[] = '// ... (' . (count($lines) - 5) . ' líneas más)';
        }

        return implode("\n", $preview);
    }

    public function getSubmissionAgeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subHours(24));
    }

    public function getPerformanceGradeAttribute(): string
    {
        if (!$this->isAccepted()) {
            return 'F';
        }

        $performance = $this->getRelativePerformance();
        $timePercentile = $performance['time_percentile'];

        return match(true) {
            $timePercentile >= 90 => 'A+',
            $timePercentile >= 80 => 'A',
            $timePercentile >= 70 => 'B+',
            $timePercentile >= 60 => 'B',
            $timePercentile >= 50 => 'C+',
            $timePercentile >= 40 => 'C',
            $timePercentile >= 30 => 'D+',
            $timePercentile >= 20 => 'D',
            default => 'F'
        };
    }

    // STATIC METHODS

    public static function getUserStats(User $user): array
    {
        $submissions = static::where('user_id', $user->id);

        return [
            'total_submissions' => $submissions->count(),
            'accepted_submissions' => $submissions->accepted()->count(),
            'challenges_solved' => $submissions->accepted()
                ->distinct('challenge_id')
                ->count(),
            'total_score' => $submissions->accepted()->sum('score'),
            'favorite_language' => static::getUserFavoriteLanguage($user),
            'acceptance_rate' => static::getUserAcceptanceRate($user),
        ];
    }

    public static function getUserFavoriteLanguage(User $user): ?string
    {
        return static::where('user_id', $user->id)
                   ->selectRaw('programming_language, COUNT(*) as count')
                   ->groupBy('programming_language')
                   ->orderByDesc('count')
                   ->first()
                   ?->programming_language;
    }

    public static function getUserAcceptanceRate(User $user): float
    {
        $total = static::where('user_id', $user->id)->count();
        if ($total === 0) return 0;

        $accepted = static::where('user_id', $user->id)->accepted()->count();
        return round(($accepted / $total) * 100, 2);
    }

    public static function getGlobalStats(): array
    {
        return [
            'total_submissions' => static::count(),
            'accepted_submissions' => static::accepted()->count(),
            'most_popular_language' => static::getMostPopularLanguage(),
            'average_acceptance_rate' => static::getAverageAcceptanceRate(),
        ];
    }

    public static function getMostPopularLanguage(): ?string
    {
        return static::selectRaw('programming_language, COUNT(*) as count')
                   ->groupBy('programming_language')
                   ->orderByDesc('count')
                   ->first()
                   ?->programming_language;
    }

    public static function getAverageAcceptanceRate(): float
    {
        $total = static::count();
        if ($total === 0) return 0;

        $accepted = static::accepted()->count();
        return round(($accepted / $total) * 100, 2);
    }
}