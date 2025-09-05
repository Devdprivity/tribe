<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreamTip extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id',
        'tipper_id',
        'streamer_id',
        'amount',
        'currency',
        'message',
        'is_anonymous',
        'payment_method',
        'payment_id',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_anonymous' => 'boolean',
    ];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    public function tipper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tipper_id');
    }

    public function streamer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'streamer_id');
    }

    // SCOPES

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
