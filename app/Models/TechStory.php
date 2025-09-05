<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class TechStory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'title', 'content', 'code_data', 'programming_language',
        'media_urls', 'background_color', 'is_interactive', 'duration_seconds',
        'expires_at', 'views_count', 'likes_count', 'shares_count', 'is_active', 'tags'
    ];

    protected $casts = [
        'code_data' => 'array',
        'media_urls' => 'array',
        'tags' => 'array',
        'is_interactive' => 'boolean',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    // RELATIONSHIPS

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(StoryInteraction::class, 'story_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(StoryInteraction::class, 'story_id')->where('type', 'view');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(StoryInteraction::class, 'story_id')->where('type', 'like');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(StoryInteraction::class, 'story_id')->where('type', 'comment');
    }

    // SCOPES

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('expires_at', '>', now());
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInteractive($query)
    {
        return $query->where('is_interactive', true);
    }

    public function scopeWithCode($query)
    {
        return $query->whereIn('type', ['code_snippet', 'bug_fix'])->whereNotNull('code_data');
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>', now()->subHours($hours));
    }

    // METHODS

    public function addView(User $viewer): void
    {
        $this->interactions()->firstOrCreate([
            'user_id' => $viewer->id,
            'type' => 'view'
        ]);

        $this->increment('views_count');
    }

    public function toggleLike(User $user): bool
    {
        $existingLike = $this->interactions()
                            ->where('user_id', $user->id)
                            ->where('type', 'like')
                            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $this->decrement('likes_count');
            return false;
        } else {
            $this->interactions()->create([
                'user_id' => $user->id,
                'type' => 'like'
            ]);
            $this->increment('likes_count');
            return true;
        }
    }

    public function addComment(User $user, string $comment): StoryInteraction
    {
        return $this->interactions()->create([
            'user_id' => $user->id,
            'type' => 'comment',
            'content' => $comment
        ]);
    }

    public function forkCode(User $user): ?TechStory
    {
        if (!$this->hasExecutableCode()) {
            return null;
        }

        $fork = static::create([
            'user_id' => $user->id,
            'type' => 'code_snippet',
            'title' => 'Fork: ' . $this->title,
            'content' => 'Forkeado de @' . $this->user->username,
            'code_data' => $this->code_data,
            'programming_language' => $this->programming_language,
            'background_color' => $this->background_color,
            'is_interactive' => $this->is_interactive,
            'expires_at' => now()->addHours(24),
            'tags' => array_merge($this->tags ?? [], ['fork'])
        ]);

        // Record fork interaction
        $this->interactions()->create([
            'user_id' => $user->id,
            'type' => 'fork',
            'metadata' => ['fork_story_id' => $fork->id]
        ]);

        return $fork;
    }

    public function share(): void
    {
        $this->increment('shares_count');
    }

    public function hasExecutableCode(): bool
    {
        return $this->is_interactive && 
               !empty($this->code_data) && 
               !empty($this->programming_language);
    }

    public function getExecutionEnvironment(): array
    {
        if (!$this->hasExecutableCode()) {
            return [];
        }

        return [
            'language' => $this->programming_language,
            'code' => $this->code_data['code'] ?? '',
            'dependencies' => $this->code_data['dependencies'] ?? [],
            'input' => $this->code_data['input'] ?? '',
            'expected_output' => $this->code_data['expected_output'] ?? '',
        ];
    }

    public function getTimeRemaining(): int
    {
        return max(0, $this->expires_at->diffInSeconds(now()));
    }

    public function getFormattedDuration(): string
    {
        $hours = intval($this->duration_seconds / 3600);
        $minutes = intval(($this->duration_seconds % 3600) / 60);
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }
        return "{$minutes}m";
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'code_snippet' => '💻 Código',
            'progress_update' => '📈 Progreso',
            'tip' => '💡 Tip',
            'bug_fix' => '🐛 Fix',
            'achievement' => '🏆 Logro',
            'question' => '❓ Pregunta',
            default => '📝 Story'
        };
    }

    public function getBackgroundStyle(): array
    {
        $color = $this->background_color;
        
        // Si es un degradado predefinido
        if (strpos($color, 'gradient-') === 0) {
            return match($color) {
                'gradient-blue' => ['background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'],
                'gradient-purple' => ['background' => 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'],
                'gradient-green' => ['background' => 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'],
                'gradient-orange' => ['background' => 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'],
                'gradient-dark' => ['background' => 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'],
                default => ['background-color' => '#1a1a1a']
            };
        }
        
        // Color sólido
        return ['background-color' => $color];
    }

    public function isViewedBy(User $user): bool
    {
        return $this->interactions()
                   ->where('user_id', $user->id)
                   ->where('type', 'view')
                   ->exists();
    }

    public function isLikedBy(User $user): bool
    {
        return $this->interactions()
                   ->where('user_id', $user->id)
                   ->where('type', 'like')
                   ->exists();
    }

    public function getEngagementRate(): float
    {
        if ($this->views_count === 0) {
            return 0;
        }

        $totalEngagements = $this->likes_count + $this->shares_count + $this->comments()->count();
        return round(($totalEngagements / $this->views_count) * 100, 2);
    }

    // ACCESSORS

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subHours(6));
    }

    public function getCanExecuteAttribute(): bool
    {
        return $this->hasExecutableCode() && !$this->is_expired;
    }

    public function getRemainingTimeAttribute(): string
    {
        $seconds = $this->getTimeRemaining();
        
        if ($seconds <= 0) {
            return 'Expirado';
        }
        
        $hours = intval($seconds / 3600);
        $minutes = intval(($seconds % 3600) / 60);
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($minutes > 0) {
            return "{$minutes}m";
        } else {
            return "{$seconds}s";
        }
    }

    // STATIC METHODS

    public static function getPopularTags(int $limit = 20): array
    {
        return static::active()
                   ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tags, "$[*]")) as tag')
                   ->whereNotNull('tags')
                   ->groupBy('tag')
                   ->orderByRaw('COUNT(*) DESC')
                   ->limit($limit)
                   ->pluck('tag')
                   ->toArray();
    }

    public static function getTrendingTopics(int $hours = 24): array
    {
        return static::recent($hours)
                   ->selectRaw('programming_language, COUNT(*) as count')
                   ->whereNotNull('programming_language')
                   ->groupBy('programming_language')
                   ->orderBy('count', 'desc')
                   ->limit(10)
                   ->get()
                   ->toArray();
    }
}