<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreamRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'duration_seconds',
        'file_size_mb',
        'video_format',
        'video_quality',
        'is_public',
        'is_processed',
        'views_count',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'file_size_mb' => 'integer',
        'is_public' => 'boolean',
        'is_processed' => 'boolean',
        'views_count' => 'integer',
    ];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    // SCOPES

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeProcessed($query)
    {
        return $query->where('is_processed', true);
    }

    public function scopeUnprocessed($query)
    {
        return $query->where('is_processed', false);
    }

    // METHODS

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function getFormattedDurationAttribute(): string
    {
        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    public function getFormattedFileSizeAttribute(): string
    {
        if ($this->file_size_mb >= 1024) {
            return round($this->file_size_mb / 1024, 1) . ' GB';
        }

        return $this->file_size_mb . ' MB';
    }
}
