<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'category', 'level', 'skills_covered', 'prerequisites',
        'duration_hours', 'passing_score', 'price', 'currency', 'is_premium', 'is_active',
        'exam_structure', 'learning_path', 'badge_image', 'certificate_template',
        'validity_months', 'max_attempts'
    ];

    protected $casts = [
        'skills_covered' => 'array',
        'prerequisites' => 'array',
        'exam_structure' => 'array',
        'learning_path' => 'array',
        'is_premium' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function attempts(): HasMany
    {
        return $this->hasMany(UserCertificationAttempt::class, 'certification_id');
    }

    public function userCertifications(): HasMany
    {
        return $this->hasMany(UserCertification::class, 'certification_id');
    }

    public function successfulCertifications(): HasMany
    {
        return $this->hasMany(UserCertification::class, 'certification_id')
                    ->where('is_verified', true);
    }

    // SCOPES

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeFree($query)
    {
        return $query->where('price', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('price', '>', 0);
    }

    public function scopePremium($query)
    {
        return $query->where('is_premium', true);
    }

    public function scopePopular($query)
    {
        return $query->withCount('successfulCertifications')
                    ->orderByDesc('successful_certifications_count');
    }

    // METHODS

    public function getPassingRate(): float
    {
        $totalAttempts = $this->attempts()->where('status', 'completed')->count();
        if ($totalAttempts === 0) return 0;

        $passedAttempts = $this->attempts()
            ->where('status', 'completed')
            ->where('score', '>=', $this->passing_score)
            ->count();

        return round(($passedAttempts / $totalAttempts) * 100, 2);
    }

    public function getAverageScore(): float
    {
        return $this->attempts()
                   ->where('status', 'completed')
                   ->avg('score') ?? 0;
    }

    public function getCompletionCount(): int
    {
        return $this->successfulCertifications()->count();
    }

    public function getAverageCompletionTime(): float
    {
        return $this->attempts()
                   ->where('status', 'completed')
                   ->avg('total_time_minutes') ?? 0;
    }

    public function isAvailableFor(User $user): bool
    {
        if (!$this->is_active) return false;
        
        // Check if user already has this certification
        if ($this->hasUserPassed($user)) return false;
        
        // Check prerequisites
        if (!empty($this->prerequisites)) {
            foreach ($this->prerequisites as $prerequisite) {
                if (!$this->userHasPrerequisite($user, $prerequisite)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    public function hasUserPassed(User $user): bool
    {
        return $this->userCertifications()
                   ->where('user_id', $user->id)
                   ->where('is_verified', true)
                   ->exists();
    }

    private function userHasPrerequisite(User $user, array $prerequisite): bool
    {
        switch ($prerequisite['type']) {
            case 'certification':
                return UserCertification::where('user_id', $user->id)
                    ->whereHas('certification', function ($query) use ($prerequisite) {
                        $query->where('name', $prerequisite['name']);
                    })
                    ->where('is_verified', true)
                    ->exists();
                    
            case 'skill_level':
                return $user->skills()
                    ->where('skill_name', $prerequisite['skill'])
                    ->where('proficiency_level', '>=', $prerequisite['level'])
                    ->exists();
                    
            case 'experience_years':
                return $user->years_experience >= $prerequisite['years'];
                
            default:
                return true;
        }
    }

    public function canUserRetake(User $user): bool
    {
        $attemptsUsed = $this->attempts()
            ->where('user_id', $user->id)
            ->count();

        return $attemptsUsed < $this->max_attempts && !$this->hasUserPassed($user);
    }

    public function getUserAttemptsRemaining(User $user): int
    {
        $attemptsUsed = $this->attempts()
            ->where('user_id', $user->id)
            ->count();

        return max(0, $this->max_attempts - $attemptsUsed);
    }

    // ACCESSORS

    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            'programming' => 'Programación',
            'web_development' => 'Desarrollo Web',
            'mobile_development' => 'Desarrollo Móvil',
            'data_science' => 'Data Science',
            'machine_learning' => 'Machine Learning',
            'devops' => 'DevOps',
            'cybersecurity' => 'Ciberseguridad',
            'cloud_computing' => 'Cloud Computing',
            'database' => 'Base de Datos',
            'ui_ux_design' => 'UI/UX Design',
            'project_management' => 'Gestión de Proyectos',
            'soft_skills' => 'Habilidades Blandas',
            default => ucfirst(str_replace('_', ' ', $this->category))
        };
    }

    public function getLevelLabelAttribute(): string
    {
        return match($this->level) {
            'beginner' => 'Principiante',
            'intermediate' => 'Intermedio',
            'advanced' => 'Avanzado',
            'expert' => 'Experto',
            default => 'No especificado'
        };
    }

    public function getLevelColorAttribute(): string
    {
        return match($this->level) {
            'beginner' => 'text-green-500',
            'intermediate' => 'text-blue-500',
            'advanced' => 'text-orange-500',
            'expert' => 'text-red-500',
            default => 'text-gray-500'
        };
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Gratis';
        }

        return number_format($this->price, 2) . ' ' . $this->currency;
    }

    public function getFormattedDurationAttribute(): string
    {
        $hours = $this->duration_hours;
        
        if ($hours < 1) {
            return ($hours * 60) . ' minutos';
        } elseif ($hours == 1) {
            return '1 hora';
        } else {
            return $hours . ' horas';
        }
    }

    public function getEstimatedStudyTimeAttribute(): string
    {
        // Typically 2-3x the exam duration for study time
        $studyHours = $this->duration_hours * 2.5;
        
        if ($studyHours < 10) {
            return 'Menos de 10 horas';
        } elseif ($studyHours < 40) {
            return '2-5 días de estudio';
        } elseif ($studyHours < 80) {
            return '1-2 semanas de estudio';
        } else {
            return 'Más de 2 semanas de estudio';
        }
    }

    public function getDifficultyScoreAttribute(): int
    {
        return match($this->level) {
            'beginner' => 1,
            'intermediate' => 2,
            'advanced' => 3,
            'expert' => 4,
            default => 1
        };
    }

    public function getPopularityAttribute(): string
    {
        $completions = $this->getCompletionCount();
        
        if ($completions >= 1000) return 'Muy Popular';
        if ($completions >= 500) return 'Popular';
        if ($completions >= 100) return 'Conocida';
        if ($completions >= 10) return 'Emergente';
        return 'Nueva';
    }

    public function getValidityLabelAttribute(): string
    {
        if (!$this->validity_months) {
            return 'Sin vencimiento';
        }

        $years = intval($this->validity_months / 12);
        $months = $this->validity_months % 12;

        if ($years > 0 && $months > 0) {
            return $years . ' años, ' . $months . ' meses';
        } elseif ($years > 0) {
            return $years . ' año' . ($years > 1 ? 's' : '');
        } else {
            return $months . ' mes' . ($months > 1 ? 'es' : '');
        }
    }

    // STATIC METHODS

    public static function getPopularByCategory(string $category, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
                   ->where('category', $category)
                   ->popular()
                   ->take($limit)
                   ->get();
    }

    public static function getRecommendedFor(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        // Get user's skills and experience to recommend relevant certifications
        $userSkills = $user->skills()->pluck('skill_name')->toArray();
        $userLevel = static::determineUserLevel($user);

        return static::active()
                   ->where('level', $userLevel)
                   ->where(function ($query) use ($userSkills) {
                       foreach ($userSkills as $skill) {
                           $query->orWhereJsonContains('skills_covered', $skill);
                       }
                   })
                   ->whereNotIn('id', function ($subQuery) use ($user) {
                       $subQuery->select('certification_id')
                               ->from('user_certifications')
                               ->where('user_id', $user->id)
                               ->where('is_verified', true);
                   })
                   ->popular()
                   ->take($limit)
                   ->get();
    }

    public static function getTrending(int $days = 30, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
                   ->whereHas('attempts', function ($query) use ($days) {
                       $query->where('created_at', '>', now()->subDays($days));
                   })
                   ->withCount(['attempts' => function ($query) use ($days) {
                       $query->where('created_at', '>', now()->subDays($days));
                   }])
                   ->orderByDesc('attempts_count')
                   ->take($limit)
                   ->get();
    }

    public static function getStatsByCategory(): array
    {
        return static::active()
                   ->selectRaw('category, COUNT(*) as count, AVG(price) as avg_price')
                   ->groupBy('category')
                   ->orderByDesc('count')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'category' => $item->category,
                           'label' => (new static(['category' => $item->category]))->category_label,
                           'count' => $item->count,
                           'avg_price' => round($item->avg_price, 2),
                       ];
                   })
                   ->toArray();
    }

    public static function getGlobalStats(): array
    {
        $total = static::active()->count();
        $free = static::active()->free()->count();
        $avgPassingRate = static::active()->get()->avg(fn($cert) => $cert->getPassingRate());
        
        return [
            'total_certifications' => $total,
            'free_certifications' => $free,
            'paid_certifications' => $total - $free,
            'average_passing_rate' => round($avgPassingRate, 2),
            'most_popular_category' => static::getMostPopularCategory(),
            'total_issued_certificates' => UserCertification::where('is_verified', true)->count(),
        ];
    }

    public static function getMostPopularCategory(): ?string
    {
        return static::active()
                   ->selectRaw('category, COUNT(*) as count')
                   ->groupBy('category')
                   ->orderByDesc('count')
                   ->first()
                   ?->category;
    }

    private static function determineUserLevel(User $user): string
    {
        $completedCerts = UserCertification::where('user_id', $user->id)
            ->where('is_verified', true)
            ->count();

        $avgSkillLevel = $user->skills()->avg('proficiency_level') ?? 1;
        $yearsExp = $user->years_experience ?? 0;

        // Simple level determination logic
        if ($completedCerts >= 5 || $avgSkillLevel >= 8 || $yearsExp >= 5) {
            return 'advanced';
        } elseif ($completedCerts >= 2 || $avgSkillLevel >= 6 || $yearsExp >= 2) {
            return 'intermediate';
        } else {
            return 'beginner';
        }
    }
}