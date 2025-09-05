<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreamAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id',
        'date',
        'hour',
        'unique_viewers',
        'peak_concurrent',
        'messages_count',
        'tips_count',
        'tips_amount',
        'new_followers',
        'code_operations',
        'viewer_countries',
        'viewer_devices',
        'average_watch_time',
    ];

    protected $casts = [
        'date' => 'date',
        'hour' => 'integer',
        'unique_viewers' => 'integer',
        'peak_concurrent' => 'integer',
        'messages_count' => 'integer',
        'tips_count' => 'integer',
        'tips_amount' => 'decimal:2',
        'new_followers' => 'integer',
        'code_operations' => 'integer',
        'viewer_countries' => 'array',
        'viewer_devices' => 'array',
        'average_watch_time' => 'decimal:2',
    ];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    // SCOPES

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForHour($query, $hour)
    {
        return $query->where('hour', $hour);
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    public function scopeDaily($query)
    {
        return $query->whereNull('hour');
    }

    public function scopeHourly($query)
    {
        return $query->whereNotNull('hour');
    }

    // METHODS

    public function getTotalViewTimeAttribute(): float
    {
        return $this->unique_viewers * $this->average_watch_time;
    }

    public function getEngagementRateAttribute(): float
    {
        if ($this->unique_viewers === 0) {
            return 0;
        }

        return ($this->messages_count / $this->unique_viewers) * 100;
    }

    public function getTipConversionRateAttribute(): float
    {
        if ($this->unique_viewers === 0) {
            return 0;
        }

        return ($this->tips_count / $this->unique_viewers) * 100;
    }

    public function getAverageTipAmountAttribute(): float
    {
        if ($this->tips_count === 0) {
            return 0;
        }

        return $this->tips_amount / $this->tips_count;
    }
}
