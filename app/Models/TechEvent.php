<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class TechEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id', 'title', 'description', 'type', 'format', 'location',
        'virtual_link', 'starts_at', 'ends_at', 'timezone', 'max_attendees',
        'price', 'currency', 'technologies', 'requirements', 'difficulty_level',
        'requires_approval', 'is_recurring', 'recurrence_pattern', 'cover_image',
        'agenda', 'status', 'allow_recording', 'recording_url'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'technologies' => 'array',
        'requirements' => 'array',
        'recurrence_pattern' => 'array',
        'agenda' => 'array',
        'requires_approval' => 'boolean',
        'is_recurring' => 'boolean',
        'allow_recording' => 'boolean',
        'price' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class, 'event_id');
    }

    public function registeredAttendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class, 'event_id')
                    ->whereIn('status', ['registered', 'approved']);
    }

    public function confirmedAttendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class, 'event_id')
                    ->where('status', 'approved');
    }

    public function actualAttendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class, 'event_id')
                    ->where('status', 'attended');
    }

    // SCOPES

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>', now())->published();
    }

    public function scopeLive($query)
    {
        return $query->where('starts_at', '<=', now())
                    ->where('ends_at', '>=', now())
                    ->published();
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByFormat($query, $format)
    {
        return $query->where('format', $format);
    }

    public function scopeFree($query)
    {
        return $query->where('price', 0);
    }

    public function scopePaid($query)
    {
        return $query->where('price', '>', 0);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeByTechnology($query, $tech)
    {
        return $query->whereJsonContains('technologies', $tech);
    }

    // METHODS

    public function canRegister(User $user): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->starts_at->isPast()) {
            return false;
        }

        if ($this->organizer_id === $user->id) {
            return false; // Organizer can't register
        }

        if ($this->isUserRegistered($user)) {
            return false; // Already registered
        }

        if ($this->max_attendees && $this->registeredAttendees()->count() >= $this->max_attendees) {
            return false; // Full
        }

        return true;
    }

    public function register(User $user, array $data = []): EventAttendee
    {
        $status = $this->requires_approval ? 'registered' : 'approved';

        return $this->attendees()->create([
            'user_id' => $user->id,
            'status' => $status,
            'registration_notes' => $data['notes'] ?? null,
            'answers' => $data['answers'] ?? null,
            'registered_at' => now(),
        ]);
    }

    public function approveAttendee(User $attendee): bool
    {
        return $this->attendees()
                   ->where('user_id', $attendee->id)
                   ->update(['status' => 'approved']);
    }

    public function rejectAttendee(User $attendee, string $reason = null): bool
    {
        return $this->attendees()
                   ->where('user_id', $attendee->id)
                   ->update([
                       'status' => 'rejected',
                       'registration_notes' => $reason,
                   ]);
    }

    public function markAttendance(User $attendee): bool
    {
        return $this->attendees()
                   ->where('user_id', $attendee->id)
                   ->update([
                       'status' => 'attended',
                       'attended_at' => now(),
                   ]);
    }

    public function isUserRegistered(User $user): bool
    {
        return $this->attendees()
                   ->where('user_id', $user->id)
                   ->whereIn('status', ['registered', 'approved'])
                   ->exists();
    }

    public function isUserAttending(User $user): bool
    {
        return $this->attendees()
                   ->where('user_id', $user->id)
                   ->where('status', 'approved')
                   ->exists();
    }

    public function getUserRegistration(User $user): ?EventAttendee
    {
        return $this->attendees()
                   ->where('user_id', $user->id)
                   ->first();
    }

    public function getNextOccurrence(): ?Carbon
    {
        if (!$this->is_recurring || !$this->recurrence_pattern) {
            return null;
        }

        $pattern = $this->recurrence_pattern;
        $interval = $pattern['interval'] ?? 1;
        $frequency = $pattern['frequency'] ?? 'weekly'; // daily, weekly, monthly

        $next = $this->starts_at->copy();

        switch ($frequency) {
            case 'daily':
                $next->addDays($interval);
                break;
            case 'weekly':
                $next->addWeeks($interval);
                break;
            case 'monthly':
                $next->addMonths($interval);
                break;
        }

        return $next->isFuture() ? $next : null;
    }

    public function createNextOccurrence(): ?self
    {
        $nextDate = $this->getNextOccurrence();
        
        if (!$nextDate) {
            return null;
        }

        $duration = $this->ends_at->diffInMinutes($this->starts_at);

        return static::create([
            'organizer_id' => $this->organizer_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'format' => $this->format,
            'location' => $this->location,
            'virtual_link' => $this->virtual_link,
            'starts_at' => $nextDate,
            'ends_at' => $nextDate->copy()->addMinutes($duration),
            'timezone' => $this->timezone,
            'max_attendees' => $this->max_attendees,
            'price' => $this->price,
            'currency' => $this->currency,
            'technologies' => $this->technologies,
            'requirements' => $this->requirements,
            'difficulty_level' => $this->difficulty_level,
            'requires_approval' => $this->requires_approval,
            'is_recurring' => $this->is_recurring,
            'recurrence_pattern' => $this->recurrence_pattern,
            'cover_image' => $this->cover_image,
            'agenda' => $this->agenda,
            'status' => 'published',
            'allow_recording' => $this->allow_recording,
        ]);
    }

    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'description' => $this->description . "\n\n[CANCELADO: {$reason}]"
        ]);

        // Notify all attendees
        // TODO: Send cancellation notifications
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);

        // Mark no-shows
        $this->attendees()
             ->where('status', 'approved')
             ->whereNull('attended_at')
             ->update(['status' => 'no_show']);
    }

    public function getAttendanceRate(): float
    {
        $approved = $this->confirmedAttendees()->count();
        $attended = $this->actualAttendees()->count();

        return $approved > 0 ? round(($attended / $approved) * 100, 2) : 0;
    }

    // ACCESSORS

    public function getIsLiveAttribute(): bool
    {
        return $this->starts_at->isPast() && $this->ends_at->isFuture();
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->starts_at->isFuture();
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->ends_at->isPast() || $this->status === 'completed';
    }

    public function getIsFreeAttribute(): bool
    {
        return $this->price == 0;
    }

    public function getIsFullAttribute(): bool
    {
        if (!$this->max_attendees) {
            return false;
        }

        return $this->registeredAttendees()->count() >= $this->max_attendees;
    }

    public function getSpotsRemainingAttribute(): int
    {
        if (!$this->max_attendees) {
            return 999; // Unlimited
        }

        return max(0, $this->max_attendees - $this->registeredAttendees()->count());
    }

    public function getDurationInMinutesAttribute(): int
    {
        return $this->ends_at->diffInMinutes($this->starts_at);
    }

    public function getFormattedDurationAttribute(): string
    {
        $minutes = $this->duration_in_minutes;
        
        if ($minutes < 60) {
            return "{$minutes}m";
        }
        
        $hours = intval($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        return $remainingMinutes > 0 ? "{$hours}h {$remainingMinutes}m" : "{$hours}h";
    }

    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'meetup' => '🤝',
            'hackathon' => '💻',
            'conference' => '🎤',
            'workshop' => '🛠️',
            'code_review' => '👀',
            'interview_prep' => '💼',
            'study_group' => '📚',
            default => '📅'
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'meetup' => 'Meetup',
            'hackathon' => 'Hackathon',
            'conference' => 'Conferencia',
            'workshop' => 'Taller',
            'code_review' => 'Code Review',
            'interview_prep' => 'Prep. Entrevistas',
            'study_group' => 'Grupo de Estudio',
            default => 'Evento'
        };
    }

    public function getDifficultyColorAttribute(): string
    {
        return match($this->difficulty_level) {
            'beginner' => 'text-green-400',
            'intermediate' => 'text-yellow-400',
            'advanced' => 'text-orange-400',
            'expert' => 'text-red-400',
            default => 'text-white'
        };
    }

    public function getDifficultyLabelAttribute(): string
    {
        return match($this->difficulty_level) {
            'beginner' => 'Principiante',
            'intermediate' => 'Intermedio',
            'advanced' => 'Avanzado',
            'expert' => 'Experto',
            default => 'Todos los niveles'
        };
    }

    // STATIC METHODS

    public static function getPopularTechnologies(int $limit = 20): array
    {
        return static::published()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(technologies, "$[*]")) as tech')
                   ->whereNotNull('technologies')
                   ->groupBy('tech')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('tech')
                   ->toArray();
    }

    public static function getTrendingTypes(int $days = 30): array
    {
        return static::where('created_at', '>', now()->subDays($days))
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderBy('count', 'desc')
                   ->get()
                   ->toArray();
    }
}