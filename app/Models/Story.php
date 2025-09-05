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
     * Comentarios de la historia
     */
    public function comments(): HasMany
    {
        return $this->hasMany(StoryComment::class);
    }

    /**
     * Scope para historias activas (no expiradas)
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope para historias de usuarios seguidos (OPTIMIZADO)
     */
    public function scopeFromFollowing($query, $userId)
    {
        // OPTIMIZED: Use whereIn with pre-fetched following IDs instead of whereHas
        // This should be called from controller with: scopeFromFollowingOptimized
        return $query->whereHas('user.followers', function ($q) use ($userId) {
            $q->where('follower_id', $userId);
        })->orWhere('user_id', $userId);
    }
    
    /**
     * Optimized scope using pre-fetched following IDs (OCTANE OPTIMIZED)
     */
    public function scopeFromFollowingOptimized($query, array $followingIds, $userId)
    {
        // Use whereIn instead of whereHas for better performance
        $userIds = array_merge($followingIds, [$userId]);
        return $query->whereIn('user_id', $userIds);
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
     * DEPRECATED: Causa N+1 queries, usar batch loading en controllers
     */
    public function isLikedBy($userId): bool
    {
        // DEPRECATED: Este método causa N+1. Usar batch loading desde StoryController
        return $this->likes()->where('user_id', $userId)->exists();
    }
    
    /**
     * Check if user liked story from pre-loaded data (OCTANE OPTIMIZED)
     */
    public function isCachedLikedBy($userId): bool
    {
        // Use pre-loaded is_liked attribute set by controller batch loading
        return $this->is_liked ?? false;
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
     * DEPRECATED: Causa N+1 queries, usar withCount en queries
     */
    public function getLikesCountAttribute(): int
    {
        // DEPRECATED: Use withCount('likes') in queries instead
        return $this->likes_count ?? $this->likes()->count();
    }

    /**
     * Agregar comentario a la historia
     */
    public function addComment($userId, $content): StoryComment
    {
        return $this->comments()->create([
            'user_id' => $userId,
            'content' => $content,
        ]);
    }

    /**
     * Contar comentarios de la historia
     * DEPRECATED: Causa N+1 queries, usar withCount en queries
     */
    public function getCommentsCountAttribute(): int
    {
        // DEPRECATED: Use withCount('comments') in queries instead
        return $this->comments_count ?? $this->comments()->count();
    }

}