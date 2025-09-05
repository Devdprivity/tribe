<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class MentorshipSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id', 'mentor_id', 'mentee_id', 'title', 'description',
        'scheduled_at', 'duration_minutes', 'meeting_link', 'status',
        'mentor_notes', 'mentee_notes', 'goals', 'homework',
        'mentor_rating', 'mentee_rating', 'mentor_feedback', 'mentee_feedback',
        'recording_url'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'goals' => 'array',
        'homework' => 'array',
    ];

    // RELATIONSHIPS

    public function program(): BelongsTo
    {
        return $this->belongsTo(MentorshipProgram::class, 'program_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function mentee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }

    // SCOPES

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->where('status', 'scheduled');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_at', today())
                    ->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForMentor($query, User $mentor)
    {
        return $query->where('mentor_id', $mentor->id);
    }

    public function scopeForMentee($query, User $mentee)
    {
        return $query->where('mentee_id', $mentee->id);
    }

    public function scopeWithFeedback($query)
    {
        return $query->whereNotNull('mentor_feedback')
                    ->whereNotNull('mentee_feedback');
    }

    // METHODS

    public function start(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
        
        // Update program completion count if this is the last session
        if ($this->isLastSessionOfProgram()) {
            $this->program->incrementCompletedPrograms();
        }
    }

    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'mentor_notes' => $this->mentor_notes . "\n\nCancelado: " . $reason
        ]);
    }

    public function reschedule(Carbon $newDateTime): void
    {
        $this->update([
            'scheduled_at' => $newDateTime,
            'status' => 'scheduled'
        ]);
    }

    public function addMentorNotes(string $notes): void
    {
        $this->update(['mentor_notes' => $notes]);
    }

    public function addMenteeNotes(string $notes): void
    {
        $this->update(['mentee_notes' => $notes]);
    }

    public function assignHomework(array $homework): void
    {
        $this->update(['homework' => $homework]);
    }

    public function rateMentor(int $rating, string $feedback): void
    {
        $this->update([
            'mentor_rating' => $rating,
            'mentor_feedback' => $feedback
        ]);

        // Update program rating
        $this->program->updateRating();
    }

    public function rateMentee(int $rating, string $feedback): void
    {
        $this->update([
            'mentee_rating' => $rating,
            'mentee_feedback' => $feedback
        ]);
    }

    public function isUpcoming(): bool
    {
        return $this->scheduled_at && 
               $this->scheduled_at->isFuture() && 
               $this->status === 'scheduled';
    }

    public function isToday(): bool
    {
        return $this->scheduled_at && 
               $this->scheduled_at->isToday() && 
               $this->status === 'scheduled';
    }

    public function isStartingSoon(int $minutes = 15): bool
    {
        return $this->scheduled_at && 
               $this->scheduled_at->isBetween(
                   now(), 
                   now()->addMinutes($minutes)
               ) && 
               $this->status === 'scheduled';
    }

    public function canStart(): bool
    {
        return $this->status === 'scheduled' && 
               $this->scheduled_at && 
               $this->scheduled_at->isPast();
    }

    public function canCancel(): bool
    {
        return in_array($this->status, ['scheduled', 'in_progress']) &&
               (!$this->scheduled_at || $this->scheduled_at->isFuture());
    }

    public function canReschedule(): bool
    {
        return $this->status === 'scheduled' &&
               $this->scheduled_at &&
               $this->scheduled_at->isFuture();
    }

    public function isLastSessionOfProgram(): bool
    {
        return $this->program->sessions()
                   ->where('mentee_id', $this->mentee_id)
                   ->where('status', '!=', 'completed')
                   ->count() === 1;
    }

    // ACCESSORS

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'scheduled' => 'text-blue-500',
            'in_progress' => 'text-green-500',
            'completed' => 'text-gray-500',
            'cancelled' => 'text-red-500',
            'no_show' => 'text-orange-500',
            default => 'text-gray-400'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'scheduled' => 'Programada',
            'in_progress' => 'En Progreso',
            'completed' => 'Completada',
            'cancelled' => 'Cancelada',
            'no_show' => 'No Asistió',
            default => 'Desconocido'
        };
    }

    public function getDurationLabelAttribute(): string
    {
        $minutes = $this->duration_minutes;
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

    public function getTimeUntilSessionAttribute(): ?string
    {
        if (!$this->scheduled_at || $this->scheduled_at->isPast()) {
            return null;
        }

        $diff = $this->scheduled_at->diffForHumans();
        return $diff;
    }

    public function getFormattedScheduledAtAttribute(): string
    {
        if (!$this->scheduled_at) {
            return 'Por programar';
        }

        return $this->scheduled_at->format('d/m/Y H:i');
    }

    public function getHasFeedbackAttribute(): bool
    {
        return !empty($this->mentor_feedback) && !empty($this->mentee_feedback);
    }

    public function getHasHomeworkAttribute(): bool
    {
        return !empty($this->homework);
    }

    public function getIsRatedAttribute(): bool
    {
        return !is_null($this->mentor_rating) && !is_null($this->mentee_rating);
    }

    public function getCanJoinAttribute(): bool
    {
        return $this->status === 'scheduled' &&
               $this->scheduled_at &&
               $this->scheduled_at->isBetween(
                   now()->subMinutes(10),
                   now()->addHours(2)
               );
    }

    // STATIC METHODS

    public static function getUpcomingSessions(User $user, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return static::where(function ($query) use ($user) {
                $query->where('mentor_id', $user->id)
                      ->orWhere('mentee_id', $user->id);
            })
            ->upcoming()
            ->with(['program', 'mentor', 'mentee'])
            ->orderBy('scheduled_at')
            ->take($limit)
            ->get();
    }

    public static function getTodaysSessions(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return static::where(function ($query) use ($user) {
                $query->where('mentor_id', $user->id)
                      ->orWhere('mentee_id', $user->id);
            })
            ->today()
            ->with(['program', 'mentor', 'mentee'])
            ->orderBy('scheduled_at')
            ->get();
    }

    public static function getCompletedHours(User $user): float
    {
        return static::where(function ($query) use ($user) {
                $query->where('mentor_id', $user->id)
                      ->orWhere('mentee_id', $user->id);
            })
            ->completed()
            ->sum('duration_minutes') / 60;
    }

    public static function getSessionStats(User $user): array
    {
        $baseQuery = static::where(function ($query) use ($user) {
            $query->where('mentor_id', $user->id)
                  ->orWhere('mentee_id', $user->id);
        });

        return [
            'total' => $baseQuery->count(),
            'completed' => $baseQuery->completed()->count(),
            'upcoming' => $baseQuery->upcoming()->count(),
            'total_hours' => $baseQuery->completed()->sum('duration_minutes') / 60,
        ];
    }
}