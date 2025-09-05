<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StreamMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stream_id',
        'user_id',
        'content',
        'type',
        'metadata',
        'is_deleted',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    protected $dates = ['deleted_at'];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // SCOPES

    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $limit = 50)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    // METHODS

    public function markAsDeleted(): void
    {
        $this->update([
            'is_deleted' => true,
            'deleted_at' => now(),
        ]);
    }

    public function canDelete(User $user): bool
    {
        return $this->user_id === $user->id || 
               $this->stream->streamer_id === $user->id ||
               $user->hasRole('admin');
    }

    public function getFormattedMessageAttribute(): string
    {
        if ($this->is_deleted) {
            return '[Mensaje eliminado]';
        }

        return $this->content;
    }
}
