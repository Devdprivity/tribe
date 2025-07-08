<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'content',
        'type',
        'code_language',
        'media_urls',
        'likes_count',
        'comments_count',
        'shares_count',
        'is_pinned',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'media_urls' => 'array',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
            'shares_count' => 'integer',
            'is_pinned' => 'boolean',
        ];
    }

    // Relaciones

    /**
     * Usuario que creó el post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Comentarios del post
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Usuarios que le dieron like al post
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_likes')
                    ->withPivot('type')
                    ->withTimestamps();
    }

    /**
     * Likes del post
     */
    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    // Scopes

    /**
     * Scope para posts públicos
     */
    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    /**
     * Scope para posts por tipo
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para posts fijados
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    // Métodos auxiliares

    /**
     * Verificar si el post es de código
     */
    public function isCodePost(): bool
    {
        return $this->type === 'code';
    }

    /**
     * Verificar si el post tiene media
     */
    public function hasMedia(): bool
    {
        return !empty($this->media_urls) && count($this->media_urls) > 0;
    }

    /**
     * Obtener el número de likes por tipo
     */
    public function getLikesCountByType(string $type = 'like'): int
    {
        return $this->likes()->where('type', $type)->count();
    }

    /**
     * Incrementar contador de likes
     */
    public function incrementLikesCount(): void
    {
        $this->increment('likes_count');
    }

    /**
     * Decrementar contador de likes
     */
    public function decrementLikesCount(): void
    {
        $this->decrement('likes_count');
    }

    /**
     * Incrementar contador de comentarios
     */
    public function incrementCommentsCount(): void
    {
        $this->increment('comments_count');
    }

    /**
     * Decrementar contador de comentarios
     */
    public function decrementCommentsCount(): void
    {
        $this->decrement('comments_count');
    }

    /**
     * Truncar contenido para preview
     */
    public function getContentPreview(int $limit = 100): string
    {
        return strlen($this->content) > $limit
            ? substr($this->content, 0, $limit) . '...'
            : $this->content;
    }
}
