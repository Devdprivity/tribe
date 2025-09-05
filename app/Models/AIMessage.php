<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id', 'role', 'content', 'code', 'language', 'file_path',
        'suggestions', 'metadata', 'tokens_used', 'processing_time_ms'
    ];

    protected $casts = [
        'suggestions' => 'array',
        'metadata' => 'array',
    ];

    // RELATIONSHIPS

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AIConversation::class, 'conversation_id');
    }

    // SCOPES

    public function scopeUserMessages($query)
    {
        return $query->where('role', 'user');
    }

    public function scopeAssistantMessages($query)
    {
        return $query->where('role', 'assistant');
    }

    public function scopeWithCode($query)
    {
        return $query->whereNotNull('code');
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('language', $language);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>', now()->subHours($hours));
    }

    // METHODS

    public function isFromUser(): bool
    {
        return $this->role === 'user';
    }

    public function isFromAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    public function hasCode(): bool
    {
        return !empty($this->code);
    }

    public function hasSuggestions(): bool
    {
        return !empty($this->suggestions);
    }

    public function getWordCount(): int
    {
        return str_word_count(strip_tags($this->content));
    }

    public function getCodeLineCount(): int
    {
        if (!$this->hasCode()) {
            return 0;
        }

        return substr_count($this->code, "\n") + 1;
    }

    public function extractCodeBlocks(): array
    {
        if (!$this->content) {
            return [];
        }

        $pattern = '/```(\w+)?\n(.*?)\n```/s';
        $blocks = [];

        if (preg_match_all($pattern, $this->content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $blocks[] = [
                    'language' => $match[1] ?? 'text',
                    'code' => $match[2],
                ];
            }
        }

        return $blocks;
    }

    public function getResponseTime(): ?int
    {
        if (!$this->isFromAssistant()) {
            return null;
        }

        $previousMessage = AIMessage::where('conversation_id', $this->conversation_id)
            ->where('created_at', '<', $this->created_at)
            ->orderByDesc('created_at')
            ->first();

        if (!$previousMessage) {
            return null;
        }

        return $this->created_at->diffInMilliseconds($previousMessage->created_at);
    }

    public function getComplexityScore(): float
    {
        $score = 0;
        
        // Word count factor
        $wordCount = $this->getWordCount();
        $score += min($wordCount / 100, 1) * 0.3;
        
        // Code presence factor
        if ($this->hasCode()) {
            $score += 0.4;
            $score += min($this->getCodeLineCount() / 50, 1) * 0.2;
        }
        
        // Suggestions factor
        if ($this->hasSuggestions()) {
            $score += count($this->suggestions) * 0.1;
        }
        
        // Technical terms factor
        $technicalTerms = [
            'algorithm', 'complexity', 'optimization', 'refactor', 'pattern',
            'architecture', 'performance', 'security', 'scalability'
        ];
        
        $content = strtolower($this->content);
        foreach ($technicalTerms as $term) {
            if (strpos($content, $term) !== false) {
                $score += 0.05;
            }
        }
        
        return min($score, 1.0);
    }

    // ACCESSORS

    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'user' => 'Usuario',
            'assistant' => 'IA Assistant',
            'system' => 'Sistema',
            default => 'Desconocido'
        };
    }

    public function getRoleColorAttribute(): string
    {
        return match($this->role) {
            'user' => 'text-blue-600',
            'assistant' => 'text-green-600',
            'system' => 'text-gray-600',
            default => 'text-gray-400'
        };
    }

    public function getRoleIconAttribute(): string
    {
        return match($this->role) {
            'user' => '👤',
            'assistant' => '🤖',
            'system' => '⚙️',
            default => '❓'
        };
    }

    public function getLanguageLabelAttribute(): ?string
    {
        if (!$this->language) {
            return null;
        }

        return match($this->language) {
            'javascript' => 'JavaScript',
            'typescript' => 'TypeScript',
            'python' => 'Python',
            'java' => 'Java',
            'php' => 'PHP',
            'cpp' => 'C++',
            'csharp' => 'C#',
            'ruby' => 'Ruby',
            'go' => 'Go',
            'rust' => 'Rust',
            'swift' => 'Swift',
            'kotlin' => 'Kotlin',
            'html' => 'HTML',
            'css' => 'CSS',
            'sql' => 'SQL',
            'bash' => 'Bash',
            default => ucfirst($this->language)
        };
    }

    public function getContentPreviewAttribute(): string
    {
        $content = strip_tags($this->content);
        $words = explode(' ', $content);
        
        if (count($words) <= 20) {
            return $content;
        }
        
        return implode(' ', array_slice($words, 0, 20)) . '...';
    }

    public function getFormattedContentAttribute(): string
    {
        $content = $this->content;
        
        // Convert markdown-style code blocks to HTML
        $content = preg_replace('/```(\w+)?\n(.*?)\n```/s', 
            '<pre class="code-block language-$1"><code>$2</code></pre>', 
            $content
        );
        
        // Convert inline code
        $content = preg_replace('/`([^`]+)`/', '<code class="inline-code">$1</code>', $content);
        
        // Convert bold text
        $content = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $content);
        
        // Convert italic text
        $content = preg_replace('/\*([^*]+)\*/', '<em>$1</em>', $content);
        
        return $content;
    }

    public function getProcessingTimeLabelAttribute(): ?string
    {
        if (!$this->processing_time_ms) {
            return null;
        }

        $ms = $this->processing_time_ms;
        
        if ($ms < 1000) {
            return $ms . 'ms';
        }
        
        return round($ms / 1000, 1) . 's';
    }

    public function getTokensUsedLabelAttribute(): ?string
    {
        if (!$this->tokens_used) {
            return null;
        }

        if ($this->tokens_used < 1000) {
            return $this->tokens_used . ' tokens';
        }

        return round($this->tokens_used / 1000, 1) . 'k tokens';
    }

    public function getMessageAgeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->created_at->greaterThan(now()->subMinutes(5));
    }

    public function getIsLongAttribute(): bool
    {
        return $this->getWordCount() > 200;
    }

    public function getHasTechnicalContentAttribute(): bool
    {
        $technicalIndicators = [
            'function', 'class', 'method', 'algorithm', 'variable',
            'array', 'object', 'loop', 'condition', 'import',
            'export', 'return', 'console.log', 'print(', 'def ',
            'if (', 'for (', 'while (', 'try {', 'catch ('
        ];

        $content = strtolower($this->content . ' ' . ($this->code ?? ''));
        
        foreach ($technicalIndicators as $indicator) {
            if (strpos($content, $indicator) !== false) {
                return true;
            }
        }

        return false;
    }

    // STATIC METHODS

    public static function getMessageStats(AIConversation $conversation): array
    {
        $messages = static::where('conversation_id', $conversation->id);

        return [
            'total_messages' => $messages->count(),
            'user_messages' => $messages->userMessages()->count(),
            'assistant_messages' => $messages->assistantMessages()->count(),
            'messages_with_code' => $messages->withCode()->count(),
            'total_words' => static::getTotalWordCount($conversation),
            'average_response_time' => static::getAverageResponseTime($conversation),
        ];
    }

    public static function getTotalWordCount(AIConversation $conversation): int
    {
        return static::where('conversation_id', $conversation->id)
                   ->get()
                   ->sum(fn($message) => $message->getWordCount());
    }

    public static function getAverageResponseTime(AIConversation $conversation): ?float
    {
        $assistantMessages = static::where('conversation_id', $conversation->id)
                                 ->assistantMessages()
                                 ->get();

        $responseTimes = [];
        
        foreach ($assistantMessages as $message) {
            $responseTime = $message->getResponseTime();
            if ($responseTime !== null) {
                $responseTimes[] = $responseTime;
            }
        }

        return empty($responseTimes) ? null : array_sum($responseTimes) / count($responseTimes);
    }

    public static function getPopularLanguages(int $days = 30): array
    {
        return static::whereNotNull('language')
                   ->where('created_at', '>', now()->subDays($days))
                   ->selectRaw('language, COUNT(*) as count')
                   ->groupBy('language')
                   ->orderByDesc('count')
                   ->limit(10)
                   ->get()
                   ->toArray();
    }

    public static function getComplexityDistribution(): array
    {
        $messages = static::assistantMessages()
                         ->recent(7 * 24) // Last week
                         ->get();

        $distribution = [
            'simple' => 0,    // 0.0 - 0.3
            'moderate' => 0,  // 0.3 - 0.6
            'complex' => 0,   // 0.6 - 1.0
        ];

        foreach ($messages as $message) {
            $complexity = $message->getComplexityScore();
            
            if ($complexity <= 0.3) {
                $distribution['simple']++;
            } elseif ($complexity <= 0.6) {
                $distribution['moderate']++;
            } else {
                $distribution['complex']++;
            }
        }

        return $distribution;
    }

    public static function getDailyMessageCounts(int $days = 30): array
    {
        return static::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                   ->where('created_at', '>', now()->subDays($days))
                   ->groupBy('date')
                   ->orderBy('date')
                   ->get()
                   ->toArray();
    }

    public static function getTopCodeLanguages(User $user, int $limit = 5): array
    {
        return static::whereHas('conversation', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereNotNull('language')
                ->selectRaw('language, COUNT(*) as count')
                ->groupBy('language')
                ->orderByDesc('count')
                ->limit($limit)
                ->get()
                ->toArray();
    }
}