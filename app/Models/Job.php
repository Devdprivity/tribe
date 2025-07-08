<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Job extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'job_listings';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_name',
        'title',
        'description',
        'requirements',
        'salary_range',
        'location',
        'remote_friendly',
        'posted_by',
        'applications_count',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'remote_friendly' => 'boolean',
            'is_active' => 'boolean',
            'applications_count' => 'integer',
        ];
    }

    // Relaciones

    /**
     * Usuario que publicó el trabajo
     */
    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    /**
     * Aplicaciones al trabajo
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Usuarios que aplicaron al trabajo
     */
    public function applicants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'job_applications')
                    ->withPivot('cover_letter', 'resume_url', 'status', 'notes')
                    ->withTimestamps();
    }

    // Scopes

    /**
     * Scope para trabajos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para trabajos inactivos
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope para trabajos remotos
     */
    public function scopeRemote($query)
    {
        return $query->where('remote_friendly', true);
    }

    /**
     * Scope para trabajos por ubicación
     */
    public function scopeInLocation($query, string $location)
    {
        return $query->where('location', 'like', '%' . $location . '%');
    }

    /**
     * Scope para buscar trabajos
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('title', 'like', '%' . $term . '%')
                    ->orWhere('description', 'like', '%' . $term . '%')
                    ->orWhere('company_name', 'like', '%' . $term . '%');
    }

    /**
     * Scope para trabajos recientes
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Métodos auxiliares

    /**
     * Verificar si un usuario ya aplicó al trabajo
     */
    public function hasApplicant(User $user): bool
    {
        return $this->applicants()->where('user_id', $user->id)->exists();
    }

    /**
     * Obtener aplicación de un usuario específico
     */
    public function getApplicationFor(User $user): ?JobApplication
    {
        return $this->applications()->where('user_id', $user->id)->first();
    }

    /**
     * Incrementar contador de aplicaciones
     */
    public function incrementApplicationsCount(): void
    {
        $this->increment('applications_count');
    }

    /**
     * Decrementar contador de aplicaciones
     */
    public function decrementApplicationsCount(): void
    {
        $this->decrement('applications_count');
    }

    /**
     * Verificar si el trabajo está expirado
     */
    public function isExpired(int $days = 30): bool
    {
        return $this->created_at->addDays($days)->isPast();
    }

    /**
     * Marcar trabajo como inactivo
     */
    public function markAsInactive(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Marcar trabajo como activo
     */
    public function markAsActive(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Obtener aplicaciones por estado
     */
    public function getApplicationsByStatus(string $status)
    {
        return $this->applications()->where('status', $status)->get();
    }

    /**
     * Obtener aplicaciones pendientes
     */
    public function getPendingApplications()
    {
        return $this->getApplicationsByStatus('pending');
    }

    /**
     * Obtener aplicaciones aceptadas
     */
    public function getAcceptedApplications()
    {
        return $this->getApplicationsByStatus('accepted');
    }

    /**
     * Obtener aplicaciones rechazadas
     */
    public function getRejectedApplications()
    {
        return $this->getApplicationsByStatus('rejected');
    }

    /**
     * Formatear rango salarial
     */
    public function getFormattedSalaryRange(): string
    {
        return $this->salary_range ?? 'No especificado';
    }

    /**
     * Verificar si el trabajo permite trabajo remoto
     */
    public function isRemoteFriendly(): bool
    {
        return $this->remote_friendly;
    }

    /**
     * Obtener etiquetas del trabajo
     */
    public function getTags(): array
    {
        $tags = [];

        if ($this->isRemoteFriendly()) {
            $tags[] = 'Remoto';
        }

        if ($this->location) {
            $tags[] = $this->location;
        }

        return $tags;
    }
}
