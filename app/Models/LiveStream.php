<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class LiveStream extends Model
{
    use HasFactory;

    protected $fillable = [
        'streamer_id', 'title', 'description', 'category', 'programming_language',
        'tags', 'status', 'privacy', 'stream_key', 'rtmp_url', 'playback_url',
        'max_participants', 'allow_chat', 'allow_code_collaboration', 'allow_screen_control',
        'allowed_languages', 'current_viewers', 'peak_viewers', 'total_views', 'likes_count',
        'total_tips', 'scheduled_at', 'started_at', 'ended_at', 'tips_enabled',
        'min_tip_amount', 'tip_currency', 'subscribers_only', 'auto_record',
        'recording_url', 'recording_size_mb'
    ];

    protected $casts = [
        'tags' => 'array',
        'allowed_languages' => 'array',
        'current_viewers' => 'integer',
        'peak_viewers' => 'integer',
        'total_views' => 'integer',
        'likes_count' => 'integer',
        'total_tips' => 'decimal:2',
        'min_tip_amount' => 'decimal:2',
        'allow_chat' => 'boolean',
        'allow_code_collaboration' => 'boolean',
        'allow_screen_control' => 'boolean',
        'tips_enabled' => 'boolean',
        'subscribers_only' => 'boolean',
        'auto_record' => 'boolean',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected $appends = ['stream_type'];

    // ACCESSORS

    public function getStreamTypeAttribute(): string
    {
        return $this->category;
    }

    // RELATIONSHIPS

    public function streamer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'streamer_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(StreamParticipant::class, 'stream_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(StreamMessage::class, 'stream_id');
    }

    public function collaborativeSession(): HasOne
    {
        return $this->hasOne(CollaborativeSession::class, 'stream_id');
    }

    public function tips(): HasMany
    {
        return $this->hasMany(StreamTip::class, 'stream_id');
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(StreamRecording::class, 'stream_id');
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(StreamAnalytics::class, 'stream_id');
    }

    // SCOPES

    public function scopeLive($query)
    {
        return $query->where('status', 'live');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('programming_language', $language);
    }

    // METHODS

    public function generateStreamKey(): string
    {
        $this->stream_key = 'live_' . Str::random(32);
        $this->save();
        return $this->stream_key;
    }

    public function startStream(): void
    {
        $this->update([
            'status' => 'live',
            'started_at' => now(),
            'current_viewers' => 0,
        ]);
    }

    public function endStream(): void
    {
        $this->update([
            'status' => 'ended',
            'ended_at' => now(),
            'current_viewers' => 0,
        ]);
    }

    public function incrementViewers(): void
    {
        $this->increment('current_viewers');
        $this->increment('total_views');
        
        if ($this->current_viewers > $this->peak_viewers) {
            $this->update(['peak_viewers' => $this->current_viewers]);
        }
    }

    public function decrementViewers(): void
    {
        if ($this->current_viewers > 0) {
            $this->decrement('current_viewers');
        }
    }

    public function canUserJoin(User $user): bool
    {
        if ($this->status !== 'live') {
            return false;
        }

        if ($this->privacy === 'private') {
            return $this->streamer_id === $user->id;
        }

        if ($this->subscribers_only) {
            return $this->streamer->subscribers()
                        ->where('subscriber_id', $user->id)
                        ->where('status', 'active')
                        ->exists();
        }

        return true;
    }

    public function addParticipant(User $user, string $role = 'viewer'): StreamParticipant
    {
        return $this->participants()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'role' => $role,
                'joined_at' => now(),
                'left_at' => null,
            ]
        );
    }

    public function removeParticipant(User $user): void
    {
        $this->participants()
             ->where('user_id', $user->id)
             ->update(['left_at' => now()]);
    }

    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at) {
            return null;
        }

        $endTime = $this->ended_at ?? now();
        return $this->started_at->diffInSeconds($endTime);
    }

    public function getIsLiveAttribute(): bool
    {
        return $this->status === 'live';
    }

    public function getViewerCountAttribute(): int
    {
        return $this->current_viewers;
    }

    public function getTotalEarningsAttribute(): float
    {
        return $this->tips()->where('status', 'completed')->sum('amount');
    }

    public function getCanCollaborateAttribute(): bool
    {
        return $this->allow_code_collaboration && $this->status === 'live';
    }

    public function createCollaborativeSession(): CollaborativeSession
    {
        return $this->collaborativeSession()->create([
            'session_id' => 'session_' . Str::random(16),
            'language' => $this->programming_language ?? 'javascript',
            'initial_code' => json_encode([]),
            'current_code' => json_encode([]),
            'is_active' => true,
        ]);
    }
}