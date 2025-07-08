<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'job_id',
        'user_id',
        'cover_letter',
        'resume_url',
        'status',
        'notes',
    ];

    // Relaciones

    /**
     * Trabajo al que se aplica
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Usuario que aplicó
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    /**
     * Scope para aplicaciones pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para aplicaciones revisadas
     */
    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    /**
     * Scope para aplicaciones en entrevista
     */
    public function scopeInterview($query)
    {
        return $query->where('status', 'interview');
    }

    /**
     * Scope para aplicaciones aceptadas
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope para aplicaciones rechazadas
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Métodos auxiliares

    /**
     * Verificar si la aplicación está pendiente
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Verificar si la aplicación fue revisada
     */
    public function isReviewed(): bool
    {
        return $this->status === 'reviewed';
    }

    /**
     * Verificar si la aplicación está en entrevista
     */
    public function isInterview(): bool
    {
        return $this->status === 'interview';
    }

    /**
     * Verificar si la aplicación fue aceptada
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Verificar si la aplicación fue rechazada
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Marcar como revisada
     */
    public function markAsReviewed(): void
    {
        $this->update(['status' => 'reviewed']);
    }

    /**
     * Marcar como en entrevista
     */
    public function markAsInterview(): void
    {
        $this->update(['status' => 'interview']);
    }

    /**
     * Marcar como aceptada
     */
    public function markAsAccepted(): void
    {
        $this->update(['status' => 'accepted']);
    }

    /**
     * Marcar como rechazada
     */
    public function markAsRejected(): void
    {
        $this->update(['status' => 'rejected']);
    }

    /**
     * Obtener el color del estado
     */
    public function getStatusColor(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'reviewed' => 'blue',
            'interview' => 'purple',
            'accepted' => 'green',
            'rejected' => 'red',
            default => 'gray'
        };
    }

    /**
     * Obtener el texto del estado
     */
    public function getStatusText(): string
    {
        return match ($this->status) {
            'pending' => 'Pendiente',
            'reviewed' => 'Revisada',
            'interview' => 'Entrevista',
            'accepted' => 'Aceptada',
            'rejected' => 'Rechazada',
            default => 'Sin estado'
        };
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($application) {
            // Incrementar contador de aplicaciones del trabajo
            $application->job->incrementApplicationsCount();
        });

        static::deleted(function ($application) {
            // Decrementar contador de aplicaciones del trabajo
            $application->job->decrementApplicationsCount();
        });
    }
}
