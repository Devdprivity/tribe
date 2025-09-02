<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'media_url',
        'media_type',
        'caption',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Likes de la historia
     */
    public function likes(): HasMany
    {
        return $this->hasMany(StoryLike::class);
    }

    /**
     * Usuarios que le dieron like a la historia
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'story_likes')
                    ->withTimestamps();
    }

    /**
     * Scope para historias activas (no expiradas)
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope para historias de usuarios seguidos
     */
    public function scopeFromFollowing($query, $userId)
    {
        return $query->whereHas('user.followers', function ($q) use ($userId) {
            $q->where('follower_id', $userId);
        })->orWhere('user_id', $userId);
    }

    /**
     * Verificar si la historia ha expirado
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Tiempo restante hasta que expire
     */
    public function getTimeRemainingAttribute(): string
    {
        if ($this->isExpired()) {
            return 'Expirada';
        }

        $diff = now()->diffInHours($this->expires_at);
        
        if ($diff < 1) {
            $minutes = now()->diffInMinutes($this->expires_at);
            return "{$minutes}m";
        }

        return "{$diff}h";
    }

    /**
     * Crear una nueva historia con expiración automática
     */
    public static function createStory($userId, $mediaUrl, $mediaType = 'image', $caption = null)
    {
        return self::create([
            'user_id' => $userId,
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
            'caption' => $caption,
            'expires_at' => now()->addHours(24), // 24 horas de duración
        ]);
    }

    /**
     * Verificar si un usuario le dio like a esta historia
     */
    public function isLikedBy($userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    /**
     * Dar like a la historia
     */
    public function like($userId): bool
    {
        if ($this->isLikedBy($userId)) {
            return false; // Ya tiene like
        }

        $this->likes()->create(['user_id' => $userId]);
        return true;
    }

    /**
     * Quitar like de la historia
     */
    public function unlike($userId): bool
    {
        $like = $this->likes()->where('user_id', $userId)->first();
        
        if (!$like) {
            return false; // No tiene like
        }

        $like->delete();
        return true;
    }

    /**
     * Toggle like (dar o quitar like)
     */
    public function toggleLike($userId): bool
    {
        if ($this->isLikedBy($userId)) {
            return $this->unlike($userId);
        } else {
            return $this->like($userId);
        }
    }

    /**
     * Contar likes de la historia
     */
    public function getLikesCountAttribute(): int
    {
        return $this->likes()->count();
    }
}