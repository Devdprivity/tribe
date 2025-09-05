<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeOperation extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id', 'user_id', 'type', 'position', 'length',
        'content', 'metadata', 'operation_id'
    ];

    protected $casts = [
        'metadata' => 'array',
        'position' => 'integer',
        'length' => 'integer',
        'operation_id' => 'integer',
    ];

    // RELATIONSHIPS

    public function session(): BelongsTo
    {
        return $this->belongsTo(CollaborativeSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SCOPES

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeAfterOperation($query, $operationId)
    {
        return $query->where('operation_id', '>', $operationId);
    }

    // METHODS

    public function apply(string $currentCode): string
    {
        switch ($this->type) {
            case 'insert':
                return $this->applyInsert($currentCode);
            case 'delete':
                return $this->applyDelete($currentCode);
            case 'replace':
                return $this->applyReplace($currentCode);
            default:
                return $currentCode;
        }
    }

    private function applyInsert(string $code): string
    {
        if ($this->position === null || $this->content === null) {
            return $code;
        }

        return substr_replace($code, $this->content, $this->position, 0);
    }

    private function applyDelete(string $code): string
    {
        if ($this->position === null || $this->length === null) {
            return $code;
        }

        return substr_replace($code, '', $this->position, $this->length);
    }

    private function applyReplace(string $code): string
    {
        if ($this->position === null || $this->length === null || $this->content === null) {
            return $code;
        }

        return substr_replace($code, $this->content, $this->position, $this->length);
    }

    public function getInverse(): array
    {
        switch ($this->type) {
            case 'insert':
                return [
                    'type' => 'delete',
                    'position' => $this->position,
                    'length' => strlen($this->content ?? ''),
                    'content' => null,
                ];
            case 'delete':
                return [
                    'type' => 'insert',
                    'position' => $this->position,
                    'length' => null,
                    'content' => $this->content,
                ];
            case 'replace':
                return [
                    'type' => 'replace',
                    'position' => $this->position,
                    'length' => strlen($this->content ?? ''),
                    'content' => $this->metadata['original_content'] ?? '',
                ];
            default:
                return [];
        }
    }

    public function getDescription(): string
    {
        $username = $this->user->username ?? 'Unknown';
        
        switch ($this->type) {
            case 'insert':
                return "{$username} insertó texto en posición {$this->position}";
            case 'delete':
                return "{$username} eliminó {$this->length} caracteres en posición {$this->position}";
            case 'replace':
                return "{$username} reemplazó texto en posición {$this->position}";
            case 'cursor_move':
                return "{$username} movió el cursor";
            case 'selection':
                return "{$username} seleccionó texto";
            default:
                return "{$username} realizó una operación";
        }
    }

    public function getAffectedRange(): array
    {
        switch ($this->type) {
            case 'insert':
                return [
                    'start' => $this->position,
                    'end' => $this->position + strlen($this->content ?? ''),
                ];
            case 'delete':
            case 'replace':
                return [
                    'start' => $this->position,
                    'end' => $this->position + ($this->length ?? 0),
                ];
            default:
                return ['start' => 0, 'end' => 0];
        }
    }

    public function toWebSocketMessage(): array
    {
        return [
            'id' => $this->id,
            'operation_id' => $this->operation_id,
            'type' => $this->type,
            'position' => $this->position,
            'length' => $this->length,
            'content' => $this->content,
            'metadata' => $this->metadata,
            'user' => [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'full_name' => $this->user->full_name,
            ],
            'timestamp' => $this->created_at->toISOString(),
        ];
    }

    public static function createFromWebSocket(array $data): array
    {
        return [
            'type' => $data['type'],
            'position' => $data['position'] ?? null,
            'length' => $data['length'] ?? null,
            'content' => $data['content'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ];
    }
}