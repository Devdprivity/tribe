<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreamParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id', 'user_id', 'role', 'can_edit_code', 'can_control_screen',
        'is_muted', 'is_banned', 'joined_at', 'left_at', 'watch_time_seconds'
    ];

    protected $casts = [
        'can_edit_code' => 'boolean',
        'can_control_screen' => 'boolean',
        'is_muted' => 'boolean',
        'is_banned' => 'boolean',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'watch_time_seconds' => 'integer',
    ];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SCOPES

    public function scopeActive($query)
    {
        return $query->whereNull('left_at');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeNotBanned($query)
    {
        return $query->where('is_banned', false);
    }

    public function scopeNotMuted($query)
    {
        return $query->where('is_muted', false);
    }

    // METHODS

    public function promoteToCollaborator(): void
    {
        $this->update([
            'role' => 'collaborator',
            'can_edit_code' => true,
        ]);
    }

    public function promoteToModerator(): void
    {
        $this->update([
            'role' => 'moderator',
            'can_edit_code' => false,
            'can_control_screen' => false,
        ]);
    }

    public function promoteToCoHost(): void
    {
        $this->update([
            'role' => 'co-host',
            'can_edit_code' => true,
            'can_control_screen' => true,
        ]);
    }

    public function demoteToViewer(): void
    {
        $this->update([
            'role' => 'viewer',
            'can_edit_code' => false,
            'can_control_screen' => false,
        ]);
    }

    public function mute(): void
    {
        $this->update(['is_muted' => true]);
    }

    public function unmute(): void
    {
        $this->update(['is_muted' => false]);
    }

    public function ban(): void
    {
        $this->update([
            'is_banned' => true,
            'left_at' => now(),
        ]);
    }

    public function unban(): void
    {
        $this->update([
            'is_banned' => false,
            'left_at' => null,
        ]);
    }

    public function leave(): void
    {
        if (!$this->left_at) {
            $watchTime = $this->joined_at->diffInSeconds(now());
            $this->update([
                'left_at' => now(),
                'watch_time_seconds' => $this->watch_time_seconds + $watchTime,
            ]);
        }
    }

    public function getIsActiveAttribute(): bool
    {
        return is_null($this->left_at) && !$this->is_banned;
    }

    public function getCanInteractAttribute(): bool
    {
        return $this->is_active && !$this->is_muted;
    }

    public function getCanModerateAttribute(): bool
    {
        return $this->is_active && in_array($this->role, ['moderator', 'co-host']);
    }

    public function getIsStreamerAttribute(): bool
    {
        return $this->user_id === $this->stream->streamer_id;
    }

    public function getTotalWatchTimeAttribute(): int
    {
        $currentSession = 0;
        if ($this->is_active) {
            $currentSession = $this->joined_at->diffInSeconds(now());
        }
        
        return $this->watch_time_seconds + $currentSession;
    }

    public function getRoleColorAttribute(): string
    {
        return match($this->role) {
            'co-host' => 'text-purple-400',
            'moderator' => 'text-green-400',
            'collaborator' => 'text-blue-400',
            'viewer' => 'text-white/70',
            default => 'text-white/50'
        };
    }

    public function getRoleBadgeAttribute(): string
    {
        return match($this->role) {
            'co-host' => '👑',
            'moderator' => '🛡️',
            'collaborator' => '💻',
            'viewer' => '👀',
            default => ''
        };
    }
}