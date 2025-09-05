<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UserCertificationAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'certification_id', 'attempt_number', 'status', 'started_at', 'completed_at',
        'score', 'section_scores', 'answers', 'time_spent', 'total_time_minutes', 'feedback'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'section_scores' => 'array',
        'answers' => 'array',
        'time_spent' => 'array',
    ];

    // RELATIONSHIPS

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function certification(): BelongsTo
    {
        return $this->belongsTo(Certification::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(UserCertification::class, 'attempt_id');
    }

    // SCOPES

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePassed($query)
    {
        return $query->where('status', 'completed')
                    ->whereColumn('score', '>=', function ($subQuery) {
                        $subQuery->select('passing_score')
                               ->from('certifications')
                               ->whereColumn('id', 'user_certification_attempts.certification_id');
                    });
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>', now()->subDays($days));
    }

    // METHODS

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function hasPassed(): bool
    {
        return $this->isCompleted() && $this->score >= $this->certification->passing_score;
    }

    public function hasFailed(): bool
    {
        return $this->isCompleted() && $this->score < $this->certification->passing_score;
    }

    public function isExpired(): bool
    {
        if (!$this->isInProgress()) return false;
        
        // Exam expires after 3 hours
        return $this->started_at->addHours(3)->isPast();
    }

    public function getTimeRemaining(): ?int
    {
        if (!$this->isInProgress()) return null;
        
        $expiryTime = $this->started_at->addHours(3);
        if ($expiryTime->isPast()) return 0;
        
        return $expiryTime->diffInMinutes(now());
    }

    public function getProgressPercentage(): float
    {
        $answers = $this->answers ?? [];
        if (empty($answers)) return 0;
        
        // This would need to be calculated based on actual exam structure
        // For now, assume a standard number of questions
        $totalQuestions = 50; // This should come from exam structure
        $answeredQuestions = count($answers);
        
        return min(100, ($answeredQuestions / $totalQuestions) * 100);
    }

    public function getAverageTimePerQuestion(): float
    {
        $timeSpent = $this->time_spent ?? [];
        if (empty($timeSpent)) return 0;
        
        $totalTime = array_sum($timeSpent);
        $questionCount = count($timeSpent);
        
        return $questionCount > 0 ? $totalTime / $questionCount : 0;
    }

    public function getSectionPerformance(): array
    {
        $sectionScores = $this->section_scores ?? [];
        $performance = [];
        
        foreach ($sectionScores as $section => $scores) {
            $percentage = $scores['percentage'] ?? 0;
            $performance[$section] = [
                'score' => $percentage,
                'status' => match(true) {
                    $percentage >= 90 => 'excellent',
                    $percentage >= 80 => 'good',
                    $percentage >= 70 => 'satisfactory',
                    $percentage >= 60 => 'needs_improvement',
                    default => 'poor'
                },
                'color' => match(true) {
                    $percentage >= 90 => 'text-green-500',
                    $percentage >= 80 => 'text-blue-500',
                    $percentage >= 70 => 'text-yellow-500',
                    $percentage >= 60 => 'text-orange-500',
                    default => 'text-red-500'
                }
            ];
        }
        
        return $performance;
    }

    public function getWeakestSection(): ?string
    {
        $sectionScores = $this->section_scores ?? [];
        if (empty($sectionScores)) return null;
        
        $lowest = null;
        $lowestScore = 100;
        
        foreach ($sectionScores as $section => $scores) {
            $percentage = $scores['percentage'] ?? 0;
            if ($percentage < $lowestScore) {
                $lowestScore = $percentage;
                $lowest = $section;
            }
        }
        
        return $lowest;
    }

    public function getStrongestSection(): ?string
    {
        $sectionScores = $this->section_scores ?? [];
        if (empty($sectionScores)) return null;
        
        $highest = null;
        $highestScore = 0;
        
        foreach ($sectionScores as $section => $scores) {
            $percentage = $scores['percentage'] ?? 0;
            if ($percentage > $highestScore) {
                $highestScore = $percentage;
                $highest = $section;
            }
        }
        
        return $highest;
    }

    public function markAsExpired(): void
    {
        if ($this->isInProgress() && $this->isExpired()) {
            $this->update([
                'status' => 'expired',
                'completed_at' => now(),
            ]);
        }
    }

    // ACCESSORS

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'in_progress' => 'En Progreso',
            'completed' => 'Completado',
            'failed' => 'Fallido',
            'expired' => 'Expirado',
            default => 'Desconocido'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'in_progress' => 'text-blue-500',
            'completed' => $this->hasPassed() ? 'text-green-500' : 'text-red-500',
            'failed' => 'text-red-500',
            'expired' => 'text-gray-500',
            default => 'text-gray-400'
        };
    }

    public function getResultLabelAttribute(): string
    {
        if (!$this->isCompleted()) return $this->status_label;
        
        return $this->hasPassed() ? 'Aprobado' : 'Reprobado';
    }

    public function getScorePercentageAttribute(): string
    {
        return $this->score ? $this->score . '%' : 'N/A';
    }

    public function getDurationLabelAttribute(): ?string
    {
        if (!$this->total_time_minutes) return null;
        
        $minutes = $this->total_time_minutes;
        $hours = intval($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($hours > 0) {
            return $hours . 'h ' . $remainingMinutes . 'm';
        }
        
        return $remainingMinutes . 'm';
    }

    public function getTimeRemainingLabelAttribute(): ?string
    {
        $remaining = $this->getTimeRemaining();
        if ($remaining === null) return null;
        
        if ($remaining <= 0) return 'Expirado';
        
        $hours = intval($remaining / 60);
        $minutes = $remaining % 60;
        
        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'm restantes';
        }
        
        return $minutes . 'm restantes';
    }

    public function getPerformanceGradeAttribute(): string
    {
        if (!$this->score) return 'N/A';
        
        return match(true) {
            $this->score >= 95 => 'A+',
            $this->score >= 90 => 'A',
            $this->score >= 85 => 'B+',
            $this->score >= 80 => 'B',
            $this->score >= 75 => 'C+',
            $this->score >= 70 => 'C',
            $this->score >= 65 => 'D+',
            $this->score >= 60 => 'D',
            default => 'F'
        };
    }

    public function getAttemptAgeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    public function getFormattedStartedAtAttribute(): string
    {
        return $this->started_at->format('d/m/Y H:i');
    }

    public function getFormattedCompletedAtAttribute(): ?string
    {
        return $this->completed_at?->format('d/m/Y H:i');
    }

    // STATIC METHODS

    public static function getUserAttemptStats(User $user): array
    {
        $attempts = static::where('user_id', $user->id);
        
        return [
            'total_attempts' => $attempts->count(),
            'completed_attempts' => $attempts->completed()->count(),
            'passed_attempts' => $attempts->passed()->count(),
            'average_score' => round($attempts->completed()->avg('score'), 2),
            'best_score' => $attempts->completed()->max('score'),
            'total_study_time' => $attempts->sum('total_time_minutes'),
            'success_rate' => static::getUserSuccessRate($user),
        ];
    }

    public static function getUserSuccessRate(User $user): float
    {
        $totalCompleted = static::where('user_id', $user->id)->completed()->count();
        if ($totalCompleted === 0) return 0;
        
        $totalPassed = static::where('user_id', $user->id)->passed()->count();
        
        return round(($totalPassed / $totalCompleted) * 100, 2);
    }

    public static function getCertificationStats(Certification $certification): array
    {
        $attempts = static::where('certification_id', $certification->id);
        
        return [
            'total_attempts' => $attempts->count(),
            'completed_attempts' => $attempts->completed()->count(),
            'passed_attempts' => $attempts->passed()->count(),
            'pass_rate' => static::getCertificationPassRate($certification),
            'average_score' => round($attempts->completed()->avg('score'), 2),
            'average_completion_time' => round($attempts->completed()->avg('total_time_minutes'), 2),
            'attempt_distribution' => static::getAttemptDistribution($certification),
        ];
    }

    public static function getCertificationPassRate(Certification $certification): float
    {
        $totalCompleted = static::where('certification_id', $certification->id)->completed()->count();
        if ($totalCompleted === 0) return 0;
        
        $totalPassed = static::where('certification_id', $certification->id)->passed()->count();
        
        return round(($totalPassed / $totalCompleted) * 100, 2);
    }

    public static function getAttemptDistribution(Certification $certification): array
    {
        return static::where('certification_id', $certification->id)
                   ->completed()
                   ->selectRaw('
                       CASE 
                           WHEN score >= 95 THEN "Excellent (95-100%)"
                           WHEN score >= 90 THEN "Very Good (90-94%)"
                           WHEN score >= 80 THEN "Good (80-89%)"
                           WHEN score >= 70 THEN "Pass (70-79%)"
                           ELSE "Fail (<70%)"
                       END as grade,
                       COUNT(*) as count
                   ')
                   ->groupBy('grade')
                   ->orderByRaw('MIN(score) DESC')
                   ->get()
                   ->pluck('count', 'grade')
                   ->toArray();
    }

    public static function getRecentActivity(int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return static::with(['user', 'certification'])
                   ->recent($days)
                   ->completed()
                   ->orderByDesc('completed_at')
                   ->take(50)
                   ->get();
    }

    public static function getTopPerformers(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::completed()
                   ->selectRaw('user_id, MAX(score) as highest_score, AVG(score) as avg_score, COUNT(*) as attempts_count')
                   ->groupBy('user_id')
                   ->orderByDesc('highest_score')
                   ->orderByDesc('avg_score')
                   ->with('user')
                   ->take($limit)
                   ->get()
                   ->map(function ($item, $index) {
                       $item->rank = $index + 1;
                       return $item;
                   });
    }

    public static function getDailyAttemptCounts(int $days = 30): array
    {
        return static::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                   ->where('created_at', '>', now()->subDays($days))
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'date' => $item->date,
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getPopularExamTimes(): array
    {
        return static::selectRaw('HOUR(started_at) as hour, COUNT(*) as count')
                   ->groupBy('hour')
                   ->orderBy('count', 'desc')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'hour' => $item->hour,
                           'label' => sprintf('%02d:00', $item->hour),
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getAverageAttemptsByUser(): float
    {
        return static::selectRaw('user_id, COUNT(*) as attempts')
                   ->groupBy('user_id')
                   ->get()
                   ->avg('attempts');
    }
}