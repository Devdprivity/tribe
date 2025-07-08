<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Channel extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'avatar',
        'members_count',
        'is_private',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'members_count' => 'integer',
            'is_private' => 'boolean',
        ];
    }

    // Relaciones

    /**
     * Usuario que creó el canal
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Miembros del canal
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'channel_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Posts del canal
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Scopes

    /**
     * Scope para canales públicos
     */
    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    /**
     * Scope para canales privados
     */
    public function scopePrivate($query)
    {
        return $query->where('is_private', true);
    }

    /**
     * Scope para canales por tipo
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para buscar canales
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'like', '%' . $term . '%')
                    ->orWhere('description', 'like', '%' . $term . '%');
    }

    // Métodos auxiliares

    /**
     * Verificar si un usuario es miembro del canal
     */
    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Verificar si un usuario es admin del canal
     */
    public function isAdmin(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->wherePivot('role', 'admin')->exists();
    }

    /**
     * Verificar si un usuario es moderador del canal
     */
    public function isModerator(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->wherePivot('role', 'moderator')->exists();
    }

    /**
     * Verificar si un usuario puede moderar el canal
     */
    public function canModerate(User $user): bool
    {
        return $this->isAdmin($user) || $this->isModerator($user) || $this->created_by === $user->id;
    }

    /**
     * Agregar miembro al canal
     */
    public function addMember(User $user, string $role = 'member'): void
    {
        if (!$this->hasMember($user)) {
            $this->members()->attach($user->id, ['role' => $role]);
            $this->increment('members_count');
        }
    }

    /**
     * Remover miembro del canal
     */
    public function removeMember(User $user): void
    {
        if ($this->hasMember($user)) {
            $this->members()->detach($user->id);
            $this->decrement('members_count');
        }
    }

    /**
     * Actualizar rol de miembro
     */
    public function updateMemberRole(User $user, string $role): void
    {
        if ($this->hasMember($user)) {
            $this->members()->updateExistingPivot($user->id, ['role' => $role]);
        }
    }

    /**
     * Obtener administradores del canal
     */
    public function getAdmins()
    {
        return $this->members()->wherePivot('role', 'admin')->get();
    }

    /**
     * Obtener moderadores del canal
     */
    public function getModerators()
    {
        return $this->members()->wherePivot('role', 'moderator')->get();
    }

    /**
     * Generar slug automáticamente
     */
    public function generateSlug(): string
    {
        $slug = Str::slug($this->name);
        $count = static::where('slug', 'like', $slug . '%')->count();

        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($channel) {
            if (empty($channel->slug)) {
                $channel->slug = $channel->generateSlug();
            }
        });
    }
}
