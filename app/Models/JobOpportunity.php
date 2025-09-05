<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobOpportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'title', 'description', 'requirements', 'responsibilities',
        'required_skills', 'preferred_skills', 'tech_stack', 'employment_type',
        'experience_level', 'work_mode', 'location', 'timezone', 'salary_min',
        'salary_max', 'currency', 'salary_period', 'benefits', 'visa_sponsorship',
        'application_deadline', 'positions_available', 'status', 'is_featured',
        'views_count', 'applications_count'
    ];

    protected $casts = [
        'required_skills' => 'array',
        'preferred_skills' => 'array',
        'tech_stack' => 'array',
        'benefits' => 'array',
        'visa_sponsorship' => 'boolean',
        'is_featured' => 'boolean',
        'application_deadline' => 'date',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id');
    }

    public function activeApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id')
                    ->whereNotIn('status', ['withdrawn']);
    }

    public function pendingApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id')
                    ->where('status', 'applied');
    }

    public function acceptedApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id')
                    ->where('status', 'offer');
    }

    // SCOPES

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByEmploymentType($query, $type)
    {
        return $query->where('employment_type', $type);
    }

    public function scopeByWorkMode($query, $mode)
    {
        return $query->where('work_mode', $mode);
    }

    public function scopeByExperienceLevel($query, $level)
    {
        return $query->where('experience_level', $level);
    }

    public function scopeRemote($query)
    {
        return $query->whereIn('work_mode', ['remote', 'hybrid']);
    }

    public function scopeWithinSalaryRange($query, $min, $max)
    {
        return $query->where(function ($q) use ($min, $max) {
            $q->whereBetween('salary_min', [$min, $max])
              ->orWhereBetween('salary_max', [$min, $max])
              ->orWhere(function ($subQ) use ($min, $max) {
                  $subQ->where('salary_min', '<=', $min)
                       ->where('salary_max', '>=', $max);
              });
        });
    }

    public function scopeByTechStack($query, $tech)
    {
        return $query->whereJsonContains('tech_stack', $tech);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('requirements', 'like', "%{$search}%")
              ->orWhereJsonContains('tech_stack', $search)
              ->orWhereJsonContains('required_skills', $search)
              ->orWhereHas('company', function ($companyQuery) use ($search) {
                  $companyQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    // METHODS

    public function isAppliedByUser(User $user): bool
    {
        return $this->applications()
                   ->where('applicant_id', $user->id)
                   ->exists();
    }

    public function getUserApplication(User $user): ?JobApplication
    {
        return $this->applications()
                   ->where('applicant_id', $user->id)
                   ->first();
    }

    public function canApply(User $user): bool
    {
        // Can't apply to own job
        if ($this->company_id === $user->id) {
            return false;
        }

        // Job must be published
        if ($this->status !== 'published') {
            return false;
        }

        // Check if deadline passed
        if ($this->application_deadline && $this->application_deadline->isPast()) {
            return false;
        }

        // Check if user already applied
        if ($this->isAppliedByUser($user)) {
            return false;
        }

        return true;
    }

    public function getApplicationsCount(): int
    {
        return $this->applications()->count();
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function incrementApplications(): void
    {
        $this->increment('applications_count');
    }

    public function markAsFeatured(): void
    {
        $this->update(['is_featured' => true]);
    }

    public function unmarkAsFeatured(): void
    {
        $this->update(['is_featured' => false]);
    }

    public function publish(): void
    {
        $this->update(['status' => 'published']);
    }

    public function pause(): void
    {
        $this->update(['status' => 'paused']);
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    // ACCESSORS

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'published';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->application_deadline && $this->application_deadline->isPast();
    }

    public function getIsRemoteAttribute(): bool
    {
        return in_array($this->work_mode, ['remote', 'hybrid']);
    }

    public function getFormattedSalaryAttribute(): string
    {
        if (!$this->salary_min && !$this->salary_max) {
            return 'No especificado';
        }

        $currency = $this->currency ?? 'USD';
        $period = $this->salary_period ?? 'yearly';

        $periodLabels = [
            'hourly' => '/hora',
            'daily' => '/día',
            'monthly' => '/mes',
            'yearly' => '/año',
        ];

        if ($this->salary_min && $this->salary_max) {
            return number_format($this->salary_min) . ' - ' . 
                   number_format($this->salary_max) . ' ' . 
                   $currency . ($periodLabels[$period] ?? '');
        }

        $salary = $this->salary_min ?? $this->salary_max;
        return 'Desde ' . number_format($salary) . ' ' . 
               $currency . ($periodLabels[$period] ?? '');
    }

    public function getEmploymentTypeLabel(): string
    {
        return match($this->employment_type) {
            'full_time' => 'Tiempo Completo',
            'part_time' => 'Medio Tiempo',
            'contract' => 'Contrato',
            'freelance' => 'Freelance',
            'internship' => 'Prácticas',
            default => 'No especificado'
        };
    }

    public function getWorkModeLabel(): string
    {
        return match($this->work_mode) {
            'remote' => 'Remoto',
            'hybrid' => 'Híbrido',
            'on_site' => 'Presencial',
            default => 'No especificado'
        };
    }

    public function getExperienceLevelLabel(): string
    {
        return match($this->experience_level) {
            'entry' => 'Entrada',
            'junior' => 'Junior',
            'mid' => 'Intermedio',
            'senior' => 'Senior',
            'lead' => 'Lead',
            'principal' => 'Principal',
            default => 'No especificado'
        };
    }

    public function getCompanyLogoAttribute(): string
    {
        return $this->company->avatar_url ?? '/images/default-company.png';
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'published' => 'text-green-500',
            'draft' => 'text-yellow-500',
            'paused' => 'text-orange-500',
            'closed' => 'text-red-500',
            default => 'text-gray-500'
        };
    }

    // STATIC METHODS

    public static function getPopularTechStacks(int $limit = 20): array
    {
        return static::published()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tech_stack, "$[*]")) as tech')
                   ->whereNotNull('tech_stack')
                   ->groupBy('tech')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('tech')
                   ->toArray();
    }

    public static function getPopularSkills(int $limit = 20): array
    {
        return static::published()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(required_skills, "$[*]")) as skill')
                   ->whereNotNull('required_skills')
                   ->groupBy('skill')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('skill')
                   ->toArray();
    }

    public static function getTrendingEmploymentTypes(int $days = 30): array
    {
        return static::where('created_at', '>', now()->subDays($days))
                   ->selectRaw('employment_type, COUNT(*) as count')
                   ->groupBy('employment_type')
                   ->orderBy('count', 'desc')
                   ->get()
                   ->toArray();
    }

    public static function getAverageSalaryByLevel(): array
    {
        return static::published()
                   ->whereNotNull('salary_min')
                   ->whereNotNull('salary_max')
                   ->selectRaw('experience_level, AVG((salary_min + salary_max) / 2) as avg_salary')
                   ->groupBy('experience_level')
                   ->orderBy('avg_salary', 'desc')
                   ->get()
                   ->pluck('avg_salary', 'experience_level')
                   ->toArray();
    }
}