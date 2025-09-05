<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollaborativeSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id', 'session_id', 'initial_code', 'current_code',
        'language', 'theme', 'cursor_positions', 'selections', 'is_active'
    ];

    protected $casts = [
        'initial_code' => 'array',
        'current_code' => 'array',
        'cursor_positions' => 'array',
        'selections' => 'array',
        'is_active' => 'boolean',
    ];

    // RELATIONSHIPS

    public function stream(): BelongsTo
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    public function operations(): HasMany
    {
        return $this->hasMany(CodeOperation::class, 'session_id');
    }

    // METHODS

    public function initializeCode(array $code): void
    {
        $this->update([
            'initial_code' => $code,
            'current_code' => $code,
        ]);
    }

    public function updateCode(array $code): void
    {
        $this->update(['current_code' => $code]);
    }

    public function updateCursorPosition(int $userId, array $position): void
    {
        $cursors = $this->cursor_positions ?? [];
        $cursors[$userId] = $position;
        
        $this->update(['cursor_positions' => $cursors]);
    }

    public function updateSelection(int $userId, array $selection): void
    {
        $selections = $this->selections ?? [];
        $selections[$userId] = $selection;
        
        $this->update(['selections' => $selections]);
    }

    public function addOperation(User $user, string $type, array $data): CodeOperation
    {
        $lastOperation = $this->operations()->latest('operation_id')->first();
        $operationId = $lastOperation ? $lastOperation->operation_id + 1 : 1;

        return $this->operations()->create([
            'user_id' => $user->id,
            'type' => $type,
            'position' => $data['position'] ?? null,
            'length' => $data['length'] ?? null,
            'content' => $data['content'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'operation_id' => $operationId,
        ]);
    }

    public function getOperationsSince(int $operationId): array
    {
        return $this->operations()
                    ->where('operation_id', '>', $operationId)
                    ->with('user:id,username,full_name')
                    ->orderBy('operation_id')
                    ->get()
                    ->toArray();
    }

    public function getCurrentCodeAsString(): string
    {
        if (empty($this->current_code)) {
            return '';
        }

        // Si es un array de líneas, juntarlas
        if (is_array($this->current_code)) {
            return implode("\n", $this->current_code);
        }

        return (string) $this->current_code;
    }

    public function setCodeFromString(string $code): void
    {
        $lines = explode("\n", $code);
        $this->updateCode($lines);
    }

    public function getActiveCursors(): array
    {
        if (!$this->cursor_positions) {
            return [];
        }

        // Filtrar solo los cursores de usuarios activos en el stream
        $activeUserIds = $this->stream->participants()
                                    ->active()
                                    ->where('can_edit_code', true)
                                    ->pluck('user_id')
                                    ->toArray();

        return array_intersect_key($this->cursor_positions, array_flip($activeUserIds));
    }

    public function getActiveSelections(): array
    {
        if (!$this->selections) {
            return [];
        }

        $activeUserIds = $this->stream->participants()
                                    ->active()
                                    ->where('can_edit_code', true)
                                    ->pluck('user_id')
                                    ->toArray();

        return array_intersect_key($this->selections, array_flip($activeUserIds));
    }

    public function getLanguageExtension(): string
    {
        return match($this->language) {
            'javascript' => 'js',
            'typescript' => 'ts',
            'python' => 'py',
            'java' => 'java',
            'csharp' => 'cs',
            'cpp' => 'cpp',
            'php' => 'php',
            'html' => 'html',
            'css' => 'css',
            'json' => 'json',
            'xml' => 'xml',
            'sql' => 'sql',
            'markdown' => 'md',
            default => 'txt'
        };
    }

    public function getSyntaxHighlightingMode(): string
    {
        return match($this->language) {
            'javascript' => 'javascript',
            'typescript' => 'typescript',
            'python' => 'python',
            'java' => 'java',
            'csharp' => 'csharp',
            'cpp' => 'cpp',
            'php' => 'php',
            'html' => 'html',
            'css' => 'css',
            'json' => 'json',
            'xml' => 'xml',
            'sql' => 'sql',
            'markdown' => 'markdown',
            default => 'text'
        };
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function getCodeStatistics(): array
    {
        $code = $this->getCurrentCodeAsString();
        
        return [
            'lines' => substr_count($code, "\n") + 1,
            'characters' => strlen($code),
            'words' => str_word_count($code),
            'operations_count' => $this->operations()->count(),
            'contributors' => $this->operations()->distinct('user_id')->count('user_id'),
        ];
    }
}