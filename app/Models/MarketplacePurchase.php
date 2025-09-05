<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketplacePurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id', 'seller_id', 'product_id', 'order_number',
        'amount', 'commission_amount', 'seller_amount', 'currency',
        'status', 'payment_method', 'payment_intent_id', 'payment_metadata',
        'delivery_status', 'delivered_at', 'delivery_data', 'download_token',
        'download_attempts', 'first_download_at', 'last_download_at',
        'can_dispute', 'dispute_deadline', 'review_submitted', 'review_deadline',
        'support_active', 'support_expires_at', 'buyer_notes', 'seller_notes',
        'refund_requested', 'refund_requested_at', 'refund_reason',
        'refund_amount', 'refunded_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'seller_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'payment_metadata' => 'array',
        'delivery_data' => 'array',
        'delivered_at' => 'datetime',
        'dispute_deadline' => 'datetime',
        'review_deadline' => 'datetime',
        'support_expires_at' => 'datetime',
        'first_download_at' => 'datetime',
        'last_download_at' => 'datetime',
        'refund_requested_at' => 'datetime',
        'refunded_at' => 'datetime',
        'can_dispute' => 'boolean',
        'review_submitted' => 'boolean',
        'support_active' => 'boolean',
        'refund_requested' => 'boolean',
    ];

    // RELATIONSHIPS

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(MarketplaceProduct::class, 'product_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(MarketplaceTransaction::class, 'purchase_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(MarketplaceDispute::class, 'purchase_id');
    }

    public function review(): HasMany
    {
        return $this->hasMany(MarketplaceReview::class, 'purchase_id');
    }

    // SCOPES

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCanDispute($query)
    {
        return $query->where('can_dispute', true)
                    ->where('dispute_deadline', '>', now());
    }

    // ACCESSORS

    public function getFormattedAmountAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->amount, 2);
    }

    public function getCanDownloadAttribute(): bool
    {
        return $this->delivery_status === 'delivered' && !empty($this->download_token);
    }

    public function getCanReviewAttribute(): bool
    {
        return $this->status === 'completed' && 
               !$this->review_submitted && 
               now()->isBefore($this->review_deadline);
    }

    public function getIsDisputedAttribute(): bool
    {
        return $this->status === 'disputed' || $this->disputes()->exists();
    }
}