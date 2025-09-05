<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MarketplaceProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id', 'title', 'description', 'short_description', 'price', 'currency',
        'type', 'category', 'tech_stack', 'features', 'complexity',
        'github_repo', 'github_verified', 'github_last_verified',
        'demo_url', 'live_preview_url', 'demo_credentials',
        'images', 'videos', 'installation_guide', 'documentation_url',
        'status', 'rejection_reason', 'sales_count', 'views_count', 'avg_rating', 'reviews_count',
        'delivery_method', 'includes_support', 'support_duration_days', 'included_files',
        'tags', 'slug', 'featured', 'featured_until',
        'allow_refunds', 'refund_period_days', 'commission_rate'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'avg_rating' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'tech_stack' => 'array',
        'features' => 'array',
        'demo_credentials' => 'array',
        'images' => 'array',
        'videos' => 'array',
        'included_files' => 'array',
        'tags' => 'array',
        'github_verified' => 'boolean',
        'github_last_verified' => 'datetime',
        'includes_support' => 'boolean',
        'featured' => 'boolean',
        'featured_until' => 'datetime',
        'allow_refunds' => 'boolean',
    ];

    // RELATIONSHIPS (Octane Optimized)

    /**
     * Vendedor del producto
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Compras de este producto
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(MarketplacePurchase::class, 'product_id');
    }

    /**
     * Reviews de este producto
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(MarketplaceReview::class, 'product_id');
    }

    /**
     * Compras completadas
     */
    public function completedPurchases(): HasMany
    {
        return $this->purchases()->where('status', 'completed');
    }

    // SCOPES (Octane Optimized)

    /**
     * Productos activos
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Productos por tipo
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Productos por categoría
     */
    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Productos destacados
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true)
                    ->where(function($q) {
                        $q->whereNull('featured_until')
                          ->orWhere('featured_until', '>', now());
                    });
    }

    /**
     * Productos con GitHub verificado
     */
    public function scopeGithubVerified($query)
    {
        return $query->where('github_verified', true);
    }

    /**
     * Búsqueda por texto (OPTIMIZADO con fulltext search)
     */
    public function scopeSearch($query, string $search)
    {
        // Usar fulltext search si está disponible
        if (config('database.default') === 'mysql') {
            return $query->whereRaw(
                "MATCH(title, description, short_description) AGAINST(? IN BOOLEAN MODE)",
                [$search . '*']
            );
        }
        
        // Fallback para otros drivers
        return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
    }

    /**
     * Filtro por rango de precio
     */
    public function scopePriceRange($query, float $min = null, float $max = null)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    /**
     * Filtro por rating mínimo
     */
    public function scopeMinRating($query, float $rating)
    {
        return $query->where('avg_rating', '>=', $rating);
    }

    // ACCESSORS & MUTATORS

    /**
     * Generar slug automáticamente
     */
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = $value;
        
        if (empty($this->attributes['slug'])) {
            $this->attributes['slug'] = $this->generateUniqueSlug($value);
        }
    }

    /**
     * URL completa del producto
     */
    public function getUrlAttribute(): string
    {
        return route('marketplace.products.show', $this->slug);
    }

    /**
     * Precio formateado
     */
    public function getFormattedPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    /**
     * Primera imagen como thumbnail
     */
    public function getThumbnailAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    /**
     * Verificar si tiene demo accesible
     */
    public function getHasDemoAttribute(): bool
    {
        return !empty($this->demo_url) || !empty($this->live_preview_url);
    }

    /**
     * Verificar si el producto está en venta
     */
    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'active';
    }

    // BUSINESS METHODS (Octane Safe)

    /**
     * Incrementar contador de vistas (OPTIMIZADO para Octane)
     */
    public function incrementViews(): void
    {
        // Usar DB increment para evitar retención de modelo en memoria
        self::where('id', $this->id)->increment('views_count');
    }

    /**
     * Incrementar contador de ventas (OPTIMIZADO para Octane)
     */
    public function incrementSales(): void
    {
        self::where('id', $this->id)->increment('sales_count');
    }

    /**
     * Actualizar rating promedio (OPTIMIZADO)
     */
    public function updateAverageRating(): void
    {
        $stats = $this->reviews()
                     ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as reviews_count')
                     ->where('status', 'approved')
                     ->first();

        self::where('id', $this->id)->update([
            'avg_rating' => round($stats->avg_rating ?? 0, 2),
            'reviews_count' => $stats->reviews_count ?? 0
        ]);
    }

    /**
     * Verificar GitHub repository
     */
    public function verifyGithubRepository(): bool
    {
        if (empty($this->github_repo)) {
            return false;
        }

        // Aquí implementaremos la lógica de verificación GitHub
        // Por ahora, simulamos la verificación
        $isValid = $this->checkGithubRepoExists($this->github_repo);
        
        self::where('id', $this->id)->update([
            'github_verified' => $isValid,
            'github_last_verified' => now()
        ]);

        return $isValid;
    }

    /**
     * Generar slug único
     */
    private function generateUniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (self::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Verificar si el repositorio GitHub existe (placeholder)
     */
    private function checkGithubRepoExists(string $repo): bool
    {
        // TODO: Implementar verificación real con GitHub API
        // Por ahora retornamos true para testing
        return true;
    }

    /**
     * Calcular comisión para una venta
     */
    public function calculateCommission(float $saleAmount): array
    {
        $commissionAmount = ($saleAmount * $this->commission_rate) / 100;
        $sellerAmount = $saleAmount - $commissionAmount;

        return [
            'sale_amount' => round($saleAmount, 2),
            'commission_amount' => round($commissionAmount, 2),
            'seller_amount' => round($sellerAmount, 2),
            'commission_rate' => $this->commission_rate
        ];
    }
}