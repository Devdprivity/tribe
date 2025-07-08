<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostLike extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'post_id',
        'user_id',
        'type',
    ];

    // Relaciones

    /**
     * Post que recibió el like
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Usuario que dio el like
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    /**
     * Scope para likes regulares
     */
    public function scopeLikes($query)
    {
        return $query->where('type', 'like');
    }

    /**
     * Scope para reacciones de fuego
     */
    public function scopeFire($query)
    {
        return $query->where('type', 'fire');
    }

    /**
     * Scope para reacciones de idea
     */
    public function scopeIdea($query)
    {
        return $query->where('type', 'idea');
    }

    /**
     * Scope para reacciones de bug
     */
    public function scopeBug($query)
    {
        return $query->where('type', 'bug');
    }

    /**
     * Scope para reacciones de sparkle
     */
    public function scopeSparkle($query)
    {
        return $query->where('type', 'sparkle');
    }

    /**
     * Scope para reacciones por tipo
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Métodos auxiliares

    /**
     * Verificar si es un like regular
     */
    public function isLike(): bool
    {
        return $this->type === 'like';
    }

    /**
     * Verificar si es reacción de fuego
     */
    public function isFire(): bool
    {
        return $this->type === 'fire';
    }

    /**
     * Verificar si es reacción de idea
     */
    public function isIdea(): bool
    {
        return $this->type === 'idea';
    }

    /**
     * Verificar si es reacción de bug
     */
    public function isBug(): bool
    {
        return $this->type === 'bug';
    }

    /**
     * Verificar si es reacción de sparkle
     */
    public function isSparkle(): bool
    {
        return $this->type === 'sparkle';
    }

    /**
     * Obtener el emoji correspondiente al tipo
     */
    public function getEmoji(): string
    {
        return match ($this->type) {
            'like' => '👍',
            'fire' => '🔥',
            'idea' => '💡',
            'bug' => '🐛',
            'sparkle' => '✨',
            default => '👍'
        };
    }

    /**
     * Obtener el texto del tipo
     */
    public function getTypeText(): string
    {
        return match ($this->type) {
            'like' => 'Like',
            'fire' => 'Fire',
            'idea' => 'Idea',
            'bug' => 'Bug',
            'sparkle' => 'Sparkle',
            default => 'Like'
        };
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($like) {
            // Incrementar contador de likes del post
            $like->post->incrementLikesCount();
        });

        static::deleted(function ($like) {
            // Decrementar contador de likes del post
            $like->post->decrementLikesCount();
        });
    }
}
