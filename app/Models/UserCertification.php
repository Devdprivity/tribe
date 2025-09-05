<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'certification_id', 'attempt_id', 'certificate_number', 'verification_code',
        'score', 'issued_at', 'expires_at', 'is_verified', 'skills_validated',
        'certificate_url', 'is_public'
    ];

    protected $casts = [
        'skills_validated' => 'array',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_verified' => 'boolean',
        'is_public' => 'boolean',
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

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(UserCertificationAttempt::class, 'attempt_id');
    }

    // SCOPES

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_verified', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeExpiring($query, $days = 30)
    {
        return $query->where('is_verified', true)
                    ->whereNotNull('expires_at')
                    ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }

    public function scopeExpired($query)
    {
        return $query->where('is_verified', true)
                    ->whereNotNull('expires_at')
                    ->where('expires_at', '<', now());
    }

    public function scopeByCategory($query, $category)
    {
        return $query->whereHas('certification', function ($q) use ($category) {
            $q->where('category', $category);
        });
    }

    public function scopeByYear($query, $year)
    {
        return $query->whereYear('issued_at', $year);
    }

    // METHODS

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expires_at && 
               $this->expires_at->isBetween(now(), now()->addDays($days));
    }

    public function getDaysUntilExpiry(): ?int
    {
        if (!$this->expires_at) return null;
        
        return max(0, now()->diffInDays($this->expires_at, false));
    }

    public function getValidityPeriod(): ?string
    {
        if (!$this->expires_at) return 'Permanente';
        
        $months = $this->issued_at->diffInMonths($this->expires_at);
        
        if ($months >= 12) {
            $years = intval($months / 12);
            return $years . ' año' . ($years > 1 ? 's' : '');
        }
        
        return $months . ' mes' . ($months > 1 ? 'es' : '');
    }

    public function getShareableUrl(): string
    {
        return route('certifications.certificate', $this->id);
    }

    public function getVerificationUrl(): string
    {
        return route('certifications.verify') . '?code=' . $this->verification_code;
    }

    public function getScoreGrade(): string
    {
        $score = $this->score;
        
        return match(true) {
            $score >= 95 => 'A+',
            $score >= 90 => 'A',
            $score >= 85 => 'B+',
            $score >= 80 => 'B',
            $score >= 75 => 'C+',
            $score >= 70 => 'C',
            default => 'D'
        };
    }

    public function canBeRenewed(): bool
    {
        if (!$this->expires_at) return false;
        
        // Can be renewed 3 months before expiry
        return $this->expires_at->subMonths(3)->isPast();
    }

    public function markAsExpired(): void
    {
        // This would typically be called by a scheduled job
        if ($this->isExpired() && $this->is_verified) {
            // Don't actually mark as unverified, but maybe add a flag
            // or handle renewal process
        }
    }

    // ACCESSORS

    public function getStatusAttribute(): string
    {
        if (!$this->is_verified) return 'No Verificado';
        if ($this->isExpired()) return 'Expirado';
        if ($this->isExpiringSoon()) return 'Por Vencer';
        return 'Vigente';
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'Vigente' => 'text-green-500',
            'Por Vencer' => 'text-yellow-500',
            'Expirado' => 'text-red-500',
            'No Verificado' => 'text-gray-500',
            default => 'text-gray-400'
        };
    }

    public function getFormattedIssuedAtAttribute(): string
    {
        return $this->issued_at->format('d/m/Y');
    }

    public function getFormattedExpiresAtAttribute(): ?string
    {
        return $this->expires_at?->format('d/m/Y');
    }

    public function getCertificateAgeAttribute(): string
    {
        return $this->issued_at->diffForHumans();
    }

    public function getExpiryWarningAttribute(): ?string
    {
        if (!$this->expires_at) return null;
        
        $days = $this->getDaysUntilExpiry();
        
        if ($days === null) return null;
        if ($days <= 0) return 'Certificación expirada';
        if ($days <= 7) return "Expira en {$days} día" . ($days > 1 ? 's' : '');
        if ($days <= 30) return "Expira en {$days} días";
        
        return null;
    }

    public function getBadgeColorAttribute(): string
    {
        return match($this->certification->level) {
            'beginner' => 'bg-green-100 text-green-800',
            'intermediate' => 'bg-blue-100 text-blue-800',
            'advanced' => 'bg-orange-100 text-orange-800',
            'expert' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getPerformanceInsightAttribute(): string
    {
        $score = $this->score;
        
        return match(true) {
            $score >= 95 => '¡Excelente! Dominio excepcional del tema',
            $score >= 90 => '¡Muy bien! Conocimiento sólido y completo',
            $score >= 85 => 'Buen desempeño, conocimiento consistente',
            $score >= 80 => 'Aprobado con conocimiento adecuado',
            $score >= 75 => 'Aprobado, considera repasar algunos temas',
            default => 'Aprobado con puntuación mínima'
        };
    }

    // STATIC METHODS

    public static function getUserStats(User $user): array
    {
        $certificates = static::where('user_id', $user->id)->verified();
        
        return [
            'total_certificates' => $certificates->count(),
            'active_certificates' => $certificates->active()->count(),
            'expired_certificates' => $certificates->expired()->count(),
            'expiring_soon' => $certificates->expiring(30)->count(),
            'average_score' => round($certificates->avg('score'), 2),
            'highest_score' => $certificates->max('score'),
            'categories_covered' => $certificates->join('certifications', 'certifications.id', '=', 'user_certifications.certification_id')
                ->distinct('certifications.category')
                ->count(),
            'total_skills_validated' => $certificates->get()
                ->flatMap(fn($cert) => $cert->skills_validated ?? [])
                ->unique()
                ->count(),
        ];
    }

    public static function getLeaderboard(int $limit = 100): \Illuminate\Database\Eloquent\Collection
    {
        return static::verified()
                   ->selectRaw('user_id, COUNT(*) as certificates_count, AVG(score) as avg_score, MAX(score) as highest_score')
                   ->groupBy('user_id')
                   ->orderByDesc('certificates_count')
                   ->orderByDesc('avg_score')
                   ->with('user')
                   ->take($limit)
                   ->get()
                   ->map(function ($item, $index) {
                       $item->rank = $index + 1;
                       return $item;
                   });
    }

    public static function getCategoryLeaderboard(string $category, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return static::verified()
                   ->byCategory($category)
                   ->selectRaw('user_id, COUNT(*) as certificates_count, AVG(score) as avg_score')
                   ->groupBy('user_id')
                   ->orderByDesc('certificates_count')
                   ->orderByDesc('avg_score')
                   ->with('user')
                   ->take($limit)
                   ->get()
                   ->map(function ($item, $index) {
                       $item->rank = $index + 1;
                       return $item;
                   });
    }

    public static function getRecentCertifications(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return static::verified()
                   ->with(['user', 'certification'])
                   ->orderByDesc('issued_at')
                   ->take($limit)
                   ->get();
    }

    public static function getExpiringCertifications(int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        return static::expiring($days)
                   ->with(['user', 'certification'])
                   ->orderBy('expires_at')
                   ->get();
    }

    public static function getCertificationTrends(int $months = 12): array
    {
        return static::verified()
                   ->selectRaw('YEAR(issued_at) as year, MONTH(issued_at) as month, COUNT(*) as count')
                   ->where('issued_at', '>', now()->subMonths($months))
                   ->groupBy('year', 'month')
                   ->orderBy('year')
                   ->orderBy('month')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'date' => sprintf('%04d-%02d', $item->year, $item->month),
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }

    public static function getPopularSkills(): array
    {
        return static::verified()
                   ->get()
                   ->flatMap(fn($cert) => $cert->skills_validated ?? [])
                   ->groupBy()
                   ->map->count()
                   ->sortDesc()
                   ->take(20)
                   ->toArray();
    }

    public static function getCompanyStats(): array
    {
        // This would require adding company information to users
        // For now, return placeholder data
        return [
            'total_companies' => 150,
            'avg_certificates_per_company' => 5.2,
            'top_certifying_companies' => [
                'Tech Corp' => 45,
                'Digital Solutions' => 38,
                'Innovation Labs' => 32,
            ],
        ];
    }

    public static function getGlobalStats(): array
    {
        $total = static::verified()->count();
        $thisMonth = static::verified()->whereMonth('issued_at', now()->month)->count();
        $lastMonth = static::verified()->whereMonth('issued_at', now()->subMonth()->month)->count();
        
        $growthRate = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 2) : 0;

        return [
            'total_issued' => $total,
            'this_month' => $thisMonth,
            'growth_rate' => $growthRate,
            'average_score' => round(static::verified()->avg('score'), 2),
            'active_certificates' => static::active()->count(),
            'expired_certificates' => static::expired()->count(),
        ];
    }

    public static function validateCertificate(string $verificationCode): ?self
    {
        return static::where('verification_code', $verificationCode)
                   ->where('is_verified', true)
                   ->first();
    }

    public static function findByNumber(string $certificateNumber): ?self
    {
        return static::where('certificate_number', $certificateNumber)
                   ->where('is_verified', true)
                   ->first();
    }
}