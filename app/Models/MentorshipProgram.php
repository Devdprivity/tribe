<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MentorshipProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentor_id', 'title', 'description', 'expertise_areas', 'technologies',
        'format', 'max_mentees', 'duration_weeks', 'price_per_session', 'currency',
        'session_duration_minutes', 'schedule_availability', 'timezone',
        'requirements', 'learning_outcomes', 'is_active', 'rating', 'reviews_count',
        'completed_programs'
    ];

    protected $casts = [
        'expertise_areas' => 'array',
        'technologies' => 'array',
        'requirements' => 'array',
        'schedule_availability' => 'array',
        'price_per_session' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // RELATIONSHIPS

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(MentorshipSession::class, 'program_id');
    }

    public function activeSessions(): HasMany
    {
        return $this->hasMany(MentorshipSession::class, 'program_id')
                    ->whereIn('status', ['scheduled', 'in_progress']);
    }

    public function completedSessions(): HasMany
    {
        return $this->hasMany(MentorshipSession::class, 'program_id')
                    ->where('status', 'completed');
    }

    public function mentees(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(
            User::class,
            MentorshipSession::class,
            'program_id',
            'id',
            'id',
            'mentee_id'
        );
    }

    // SCOPES

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByFormat($query, $format)
    {
        return $query->where('format', $format);
    }

    public function scopeByExpertiseArea($query, $area)
    {
        return $query->whereJsonContains('expertise_areas', $area);
    }

    public function scopeByTechnology($query, $tech)
    {
        return $query->whereJsonContains('technologies', $tech);
    }

    public function scopeFree($query)
    {
        return $query->whereNull('price_per_session')
                    ->orWhere('price_per_session', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('price_per_session', '>', 0);
    }

    public function scopeHighRated($query, $minRating = 4.0)
    {
        return $query->where('rating', '>=', $minRating);
    }

    public function scopeAvailable($query)
    {
        return $query->whereRaw('
            (SELECT COUNT(*) FROM mentorship_sessions 
             WHERE program_id = mentorship_programs.id 
             AND status IN ("scheduled", "in_progress")) < max_mentees
        ');
    }

    // METHODS

    public function canEnroll(User $user): bool
    {
        // Can't enroll in own program
        if ($this->mentor_id === $user->id) {
            return false;
        }

        // Program must be active
        if (!$this->is_active) {
            return false;
        }

        // Check if user already enrolled
        if ($this->isUserEnrolled($user)) {
            return false;
        }

        // Check if program is full
        if ($this->isFull()) {
            return false;
        }

        return true;
    }

    public function isUserEnrolled(User $user): bool
    {
        return $this->sessions()
                   ->where('mentee_id', $user->id)
                   ->exists();
    }

    public function isFull(): bool
    {
        return $this->activeSessions()->count() >= $this->max_mentees;
    }

    public function getSpotsRemaining(): int
    {
        return max(0, $this->max_mentees - $this->activeSessions()->count());
    }

    public function getAverageRating(): float
    {
        return $this->sessions()
                   ->whereNotNull('mentee_rating')
                   ->avg('mentee_rating') ?? 0;
    }

    public function getTotalReviews(): int
    {
        return $this->sessions()
                   ->whereNotNull('mentee_rating')
                   ->count();
    }

    public function getCompletionRate(): float
    {
        $totalSessions = $this->sessions()->count();
        if ($totalSessions === 0) return 0;

        $completedSessions = $this->completedSessions()->count();
        return round(($completedSessions / $totalSessions) * 100, 2);
    }

    public function getTotalEarnings(): float
    {
        if (!$this->price_per_session) return 0;

        $completedSessions = $this->completedSessions()->count();
        return $completedSessions * $this->price_per_session;
    }

    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function updateRating(): void
    {
        $sessions = $this->sessions()
                       ->whereNotNull('mentee_rating')
                       ->get();

        if ($sessions->count() > 0) {
            $this->update([
                'rating' => round($sessions->avg('mentee_rating'), 2),
                'reviews_count' => $sessions->count(),
            ]);
        }
    }

    public function incrementCompletedPrograms(): void
    {
        $this->increment('completed_programs');
    }

    // ACCESSORS

    public function getIsFreeAttribute(): bool
    {
        return !$this->price_per_session || $this->price_per_session == 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->is_free) {
            return 'Gratis';
        }

        $currency = $this->currency ?? 'USD';
        return number_format($this->price_per_session, 2) . ' ' . $currency . '/sesión';
    }

    public function getFormatLabelAttribute(): string
    {
        return match($this->format) {
            'one_on_one' => '1 a 1',
            'group' => 'Grupal',
            'hybrid' => 'Híbrido',
            default => 'No especificado'
        };
    }

    public function getDurationLabelAttribute(): string
    {
        $weeks = $this->duration_weeks;
        if ($weeks === 1) {
            return '1 semana';
        }
        return $weeks . ' semanas';
    }

    public function getSessionDurationLabelAttribute(): string
    {
        $minutes = $this->session_duration_minutes;
        if ($minutes < 60) {
            return $minutes . 'min';
        }

        $hours = intval($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($remainingMinutes > 0) {
            return $hours . 'h ' . $remainingMinutes . 'min';
        }

        return $hours . 'h';
    }

    public function getIsPopularAttribute(): bool
    {
        return $this->reviews_count >= 10 && $this->rating >= 4.5;
    }

    public function getIsNewAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subDays(30));
    }

    public function getActiveEnrollmentsCountAttribute(): int
    {
        return $this->activeSessions()->count();
    }

    public function getRatingStarsAttribute(): string
    {
        $rating = $this->rating;
        $fullStars = floor($rating);
        $hasHalfStar = ($rating - $fullStars) >= 0.5;
        $emptyStars = 5 - $fullStars - ($hasHalfStar ? 1 : 0);

        return str_repeat('★', $fullStars) . 
               ($hasHalfStar ? '☆' : '') . 
               str_repeat('☆', $emptyStars);
    }

    // STATIC METHODS

    public static function getPopularExpertiseAreas(int $limit = 20): array
    {
        return static::active()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(expertise_areas, "$[*]")) as area')
                   ->whereNotNull('expertise_areas')
                   ->groupBy('area')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('area')
                   ->toArray();
    }

    public static function getPopularTechnologies(int $limit = 20): array
    {
        return static::active()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(technologies, "$[*]")) as tech')
                   ->whereNotNull('technologies')
                   ->groupBy('tech')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('tech')
                   ->toArray();
    }

    public static function getTopMentors(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('mentorshipPrograms', function ($query) {
                $query->active();
            })
            ->withAvg('mentorshipPrograms', 'rating')
            ->withCount('mentorshipPrograms')
            ->orderByDesc('mentorship_programs_avg_rating')
            ->orderByDesc('mentorship_programs_count')
            ->take($limit)
            ->get();
    }

    public static function getFeaturedPrograms(int $limit = 6): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
                   ->highRated(4.5)
                   ->where('reviews_count', '>=', 5)
                   ->with('mentor')
                   ->orderByDesc('rating')
                   ->orderByDesc('reviews_count')
                   ->take($limit)
                   ->get();
    }

    public static function getAveragePriceByExpertiseArea(): array
    {
        return static::active()
                   ->whereNotNull('price_per_session')
                   ->where('price_per_session', '>', 0)
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(expertise_areas, "$[0]")) as area, AVG(price_per_session) as avg_price')
                   ->groupBy('area')
                   ->orderBy('avg_price', 'desc')
                   ->get()
                   ->pluck('avg_price', 'area')
                   ->toArray();
    }
}