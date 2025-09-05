<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AIConversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'title', 'type', 'context', 'status', 'messages_count',
        'total_tokens', 'cost', 'rating', 'feedback', 'metadata'
    ];

    protected $casts = [
        'context' => 'array',
        'metadata' => 'array',
        'cost' => 'decimal:4',
    ];

    // RELATIONSHIPS

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AIMessage::class, 'conversation_id');
    }

    public function userMessages(): HasMany
    {
        return $this->hasMany(AIMessage::class, 'conversation_id')
                    ->where('role', 'user');
    }

    public function assistantMessages(): HasMany
    {
        return $this->hasMany(AIMessage::class, 'conversation_id')
                    ->where('role', 'assistant');
    }

    // SCOPES

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>', now()->subDays($days));
    }

    public function scopePopular($query)
    {
        return $query->where('messages_count', '>', 10)
                    ->orderByDesc('messages_count');
    }

    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating)
                    ->whereNotNull('rating');
    }

    // METHODS

    public function addMessage(string $role, string $content, array $metadata = []): AIMessage
    {
        $message = $this->messages()->create([
            'role' => $role,
            'content' => $content,
            'metadata' => $metadata,
        ]);

        $this->increment('messages_count');
        $this->touch();

        return $message;
    }

    public function getLastUserMessage(): ?AIMessage
    {
        return $this->userMessages()
                   ->latest()
                   ->first();
    }

    public function getLastAssistantMessage(): ?AIMessage
    {
        return $this->assistantMessages()
                   ->latest()
                   ->first();
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsActive(): void
    {
        $this->update(['status' => 'active']);
    }

    public function addRating(int $rating, ?string $feedback = null): void
    {
        $this->update([
            'rating' => $rating,
            'feedback' => $feedback,
        ]);
    }

    public function updateTokenUsage(int $tokens, float $cost = 0): void
    {
        $this->increment('total_tokens', $tokens);
        $this->increment('cost', $cost);
    }

    public function getContextSummary(): string
    {
        $context = $this->context ?? [];
        
        $summary = "Tipo: " . $this->getTypeLabelAttribute();
        
        if (isset($context['language'])) {
            $summary .= " | Lenguaje: " . $context['language'];
        }
        
        if (isset($context['framework'])) {
            $summary .= " | Framework: " . $context['framework'];
        }
        
        return $summary;
    }

    public function getDuration(): ?int
    {
        if ($this->messages_count < 2) {
            return null;
        }

        $firstMessage = $this->messages()->oldest()->first();
        $lastMessage = $this->messages()->latest()->first();

        if (!$firstMessage || !$lastMessage) {
            return null;
        }

        return $lastMessage->created_at->diffInMinutes($firstMessage->created_at);
    }

    public function getAverageResponseTime(): ?float
    {
        $responses = $this->assistantMessages()
                         ->with('conversation')
                         ->get();

        if ($responses->count() === 0) {
            return null;
        }

        $totalResponseTime = 0;
        $validResponses = 0;

        foreach ($responses as $response) {
            $processingTime = $response->metadata['processing_time_ms'] ?? null;
            if ($processingTime) {
                $totalResponseTime += $processingTime;
                $validResponses++;
            }
        }

        return $validResponses > 0 ? $totalResponseTime / $validResponses : null;
    }

    public function getCodeBlocksCount(): int
    {
        return $this->messages()
                   ->whereNotNull('code')
                   ->count();
    }

    public function getUsedLanguages(): array
    {
        return $this->messages()
                   ->whereNotNull('language')
                   ->distinct('language')
                   ->pluck('language')
                   ->toArray();
    }

    // ACCESSORS

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'general' => 'General',
            'code_review' => 'Code Review',
            'debugging' => 'Debugging',
            'learning' => 'Aprendizaje',
            'optimization' => 'Optimización',
            'generation' => 'Generación de Código',
            default => 'Desconocido'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Activa',
            'completed' => 'Completada',
            'archived' => 'Archivada',
            default => 'Desconocido'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'text-green-500',
            'completed' => 'text-blue-500',
            'archived' => 'text-gray-500',
            default => 'text-gray-400'
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'general' => '💬',
            'code_review' => '🔍',
            'debugging' => '🐛',
            'learning' => '📚',
            'optimization' => '⚡',
            'generation' => '⚡',
            default => '🤖'
        };
    }

    public function getFormattedCostAttribute(): string
    {
        if (!$this->cost || $this->cost == 0) {
            return 'Gratis';
        }

        return '$' . number_format($this->cost, 4);
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->updated_at->greaterThan(now()->subHours(24));
    }

    public function getIsLongAttribute(): bool
    {
        return $this->messages_count > 20;
    }

    public function getIsRatedAttribute(): bool
    {
        return !is_null($this->rating);
    }

    public function getHasCodeAttribute(): bool
    {
        return $this->getCodeBlocksCount() > 0;
    }

    public function getFormattedDurationAttribute(): ?string
    {
        $duration = $this->getDuration();
        
        if (!$duration) {
            return null;
        }

        if ($duration < 60) {
            return $duration . 'm';
        }

        $hours = intval($duration / 60);
        $minutes = $duration % 60;

        if ($minutes > 0) {
            return $hours . 'h ' . $minutes . 'm';
        }

        return $hours . 'h';
    }

    public function getAverageResponseTimeLabelAttribute(): ?string
    {
        $avgTime = $this->getAverageResponseTime();
        
        if (!$avgTime) {
            return null;
        }

        if ($avgTime < 1000) {
            return round($avgTime) . 'ms';
        }

        return round($avgTime / 1000, 1) . 's';
    }

    public function getRatingStarsAttribute(): string
    {
        if (!$this->rating) {
            return '';
        }

        return str_repeat('⭐', $this->rating);
    }

    // STATIC METHODS

    public static function getUserStats(User $user): array
    {
        $conversations = static::where('user_id', $user->id);

        return [
            'total_conversations' => $conversations->count(),
            'active_conversations' => $conversations->active()->count(),
            'total_messages' => $conversations->sum('messages_count'),
            'total_tokens' => $conversations->sum('total_tokens'),
            'total_cost' => $conversations->sum('cost'),
            'average_rating' => $conversations->whereNotNull('rating')->avg('rating'),
            'favorite_type' => static::getUserFavoriteType($user),
        ];
    }

    public static function getUserFavoriteType(User $user): ?string
    {
        return static::where('user_id', $user->id)
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderByDesc('count')
                   ->first()
                   ?->type;
    }

    public static function getPopularTypes(int $days = 30): array
    {
        return static::where('created_at', '>', now()->subDays($days))
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderByDesc('count')
                   ->get()
                   ->toArray();
    }

    public static function getDailyUsage(int $days = 30): array
    {
        return static::selectRaw('DATE(created_at) as date, COUNT(*) as conversations')
                   ->where('created_at', '>', now()->subDays($days))
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get()
                   ->toArray();
    }

    public static function getTopUsers(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('aiConversations')
                   ->withCount('aiConversations')
                   ->orderByDesc('ai_conversations_count')
                   ->take($limit)
                   ->get();
    }

    public static function getAverageSessionMetrics(): array
    {
        $conversations = static::whereNotNull('rating');

        return [
            'avg_messages_per_conversation' => $conversations->avg('messages_count'),
            'avg_tokens_per_conversation' => $conversations->avg('total_tokens'),
            'avg_cost_per_conversation' => $conversations->avg('cost'),
            'avg_rating' => $conversations->avg('rating'),
            'completion_rate' => static::getCompletionRate(),
        ];
    }

    public static function getCompletionRate(): float
    {
        $total = static::count();
        if ($total === 0) return 0;

        $completed = static::completed()->count();
        return round(($completed / $total) * 100, 2);
    }

    public static function getTrendingTopics(int $days = 7): array
    {
        return static::recent($days)
                   ->selectRaw('type, COUNT(*) as count')
                   ->groupBy('type')
                   ->orderByDesc('count')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'type' => $item->type,
                           'label' => match($item->type) {
                               'general' => 'General',
                               'code_review' => 'Code Review',
                               'debugging' => 'Debugging',
                               'learning' => 'Aprendizaje',
                               'optimization' => 'Optimización',
                               default => 'Otros'
                           },
                           'count' => $item->count,
                       ];
                   })
                   ->toArray();
    }
}