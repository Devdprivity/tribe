<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
        'content',
        'parent_id',
    ];

    // Relaciones

    /**
     * Usuario que creó el comentario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Post al que pertenece el comentario
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Comentario padre (si es una respuesta)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Respuestas al comentario
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    // Scopes

    /**
     * Scope para comentarios principales (no respuestas)
     */
    public function scopeMain($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope para respuestas (comentarios con padre)
     */
    public function scopeReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Scope para comentarios recientes
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Métodos auxiliares

    /**
     * Verificar si el comentario es una respuesta
     */
    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }

    /**
     * Verificar si el comentario es principal
     */
    public function isMain(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Obtener el nivel de anidamiento del comentario
     */
    public function getDepth(): int
    {
        $depth = 0;
        $parent = $this->parent;

        while ($parent) {
            $depth++;
            $parent = $parent->parent;
        }

        return $depth;
    }

    /**
     * Verificar si el comentario tiene respuestas
     */
    public function hasReplies(): bool
    {
        return $this->replies()->exists();
    }

    /**
     * Obtener el número de respuestas
     */
    public function getRepliesCount(): int
    {
        return $this->replies()->count();
    }

    /**
     * Verificar si el usuario puede editar el comentario
     */
    public function canEdit(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    /**
     * Verificar si el usuario puede eliminar el comentario
     */
    public function canDelete(User $user): bool
    {
        // El autor puede eliminar siempre
        if ($this->user_id === $user->id) {
            return true;
        }

        // El autor del post puede eliminar comentarios en su post
        if ($this->post && $this->post->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Truncar contenido para preview
     */
    public function getContentPreview(int $limit = 50): string
    {
        return strlen($this->content) > $limit
            ? substr($this->content, 0, $limit) . '...'
            : $this->content;
    }

    /**
     * Formatear fecha para mostrar
     */
    public function getFormattedDate(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Obtener todas las respuestas anidadas
     */
    public function getAllReplies()
    {
        return $this->replies()->with('replies')->get();
    }

    /**
     * Obtener comentarios con respuestas para un post
     */
    public static function getThreadedComments(int $postId)
    {
        return static::where('post_id', $postId)
                    ->whereNull('parent_id')
                    ->with(['user', 'replies.user', 'replies.replies'])
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($comment) {
            // Incrementar contador de comentarios del post
            $comment->post->incrementCommentsCount();
        });

        static::deleted(function ($comment) {
            // Decrementar contador de comentarios del post
            $comment->post->decrementCommentsCount();
        });
    }
}
