<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'full_name',
        'email',
        'password',
        'bio',
        'avatar',
        'level',
        'years_experience',
        'location',
        'website',
        'github_username',
        'linkedin_profile',
        'is_open_to_work',
        'provider',
        'provider_id',
        'provider_avatar',
        'provider_data',
        'last_login_at',
        'theme_preference',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_open_to_work' => 'boolean',
            'years_experience' => 'integer',
            'provider_data' => 'array',
            'last_login_at' => 'datetime',
        ];
    }

    // Relaciones

    /**
     * Posts del usuario
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Historias del usuario
     */
    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    /**
     * Comentarios del usuario
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Trabajos publicados por el usuario
     */
    public function jobsPosted(): HasMany
    {
        return $this->hasMany(Job::class, 'posted_by');
    }

    /**
     * Aplicaciones del usuario a trabajos
     */
    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Canales creados por el usuario
     */
    public function channelsCreated(): HasMany
    {
        return $this->hasMany(Channel::class, 'created_by');
    }

    /**
     * Canales a los que pertenece el usuario
     */
    public function channels(): BelongsToMany
    {
        return $this->belongsToMany(Channel::class, 'channel_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Usuarios que sigue
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'followed_id')
                    ->withTimestamps();
    }

    /**
     * Usuarios que lo siguen
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_follows', 'followed_id', 'follower_id')
                    ->withTimestamps();
    }

    /**
     * Posts que le gustan al usuario
     */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_likes')
                    ->withPivot('type')
                    ->withTimestamps();
    }

    /**
     * Notificaciones recibidas por el usuario
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Notificaciones enviadas por el usuario
     */
    public function sentNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'from_user_id');
    }

    /**
     * Mensajes directos enviados por el usuario
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(DirectMessage::class, 'from_user_id');
    }

    /**
     * Mensajes directos recibidos por el usuario
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(DirectMessage::class, 'to_user_id');
    }

    /**
     * Posts favoritos del usuario
     */
    public function bookmarkedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'user_bookmarks', 'user_id', 'bookmarkable_id')
                    ->wherePivot('bookmarkable_type', Post::class)
                    ->withTimestamps();
    }

    /**
     * Trabajos favoritos del usuario
     */
    public function bookmarkedJobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'user_bookmarks', 'user_id', 'bookmarkable_id')
                    ->wherePivot('bookmarkable_type', Job::class)
                    ->withTimestamps();
    }

    /**
     * Usuarios favoritos del usuario
     */
    public function bookmarkedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_bookmarks', 'user_id', 'bookmarkable_id')
                    ->wherePivot('bookmarkable_type', User::class)
                    ->withTimestamps();
    }

    // Métodos auxiliares

    /**
     * Verificar si el usuario sigue a otro usuario
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('followed_id', $user->id)->exists();
    }

    /**
     * Verificar si el usuario es miembro de un canal
     */
    public function isMemberOf(Channel $channel): bool
    {
        return $this->channels()->where('channel_id', $channel->id)->exists();
    }

    /**
     * Verificar si le gusta un post
     */
    public function likesPost(Post $post, string $type = 'like'): bool
    {
        return $this->likedPosts()->where('post_id', $post->id)->wherePivot('type', $type)->exists();
    }

    /**
     * Obtener iniciales del usuario
     */
    public function getInitialsAttribute(): string
    {
        $names = explode(' ', $this->full_name);
        $initials = '';

        foreach ($names as $name) {
            $initials .= strtoupper(substr($name, 0, 1));
        }

        return $initials;
    }

    /**
     * Check if the user has signed up using a social provider.
     */
    public function isSocialUser(): bool
    {
        return !empty($this->provider);
    }

    /**
     * Get the user's avatar with fallback to provider avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        // Priorizar avatar local, luego avatar del proveedor
        if (!empty($this->avatar)) {
            return $this->avatar;
        }
        
        // Si no hay avatar local, usar el del proveedor
        if (!empty($this->provider_avatar)) {
            return $this->provider_avatar;
        }
        
        return null;
    }

    /**
     * Update last login timestamp.
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Update provider avatar from social provider.
     */
    public function updateProviderAvatar(string $newAvatarUrl): void
    {
        $this->update([
            'provider_avatar' => $newAvatarUrl,
            // Si no hay avatar local, también actualizar el avatar principal
            'avatar' => empty($this->avatar) ? $newAvatarUrl : $this->avatar,
        ]);
    }

    /**
     * Create or update user from social provider data.
     * Returns array with user instance and isNewUser flag.
     */
    public static function createOrUpdateFromProvider(string $provider, array $providerUser): array
    {
        $user = self::where('provider', $provider)
            ->where('provider_id', $providerUser['id'])
            ->first();

        $isNewUser = false;

        if (!$user) {
            // Check if user exists with same email
            $user = self::where('email', $providerUser['email'])->first();
            
            // If no user found at all, this is a new user
            if (!$user) {
                $isNewUser = true;
            }
        }

        // 1. Generar username base según proveedor
        if ($provider === 'github') {
            $baseUsername = $providerUser['nickname'] ?? str_replace(' ', '_', strtolower($providerUser['name'] ?? 'user'));
        } else {
            $baseUsername = $providerUser['nickname'] ?? str_replace(' ', '_', strtolower($providerUser['name'] ?? 'user'));
        }

        // 2. Generar username único
        $username = $baseUsername;
        $counter = 1;
        while (self::where('username', $username)->exists()) {
            $username = $baseUsername . '_' . $counter;
            $counter++;
        }

        $userData = [
            'email' => $providerUser['email'],
            'full_name' => $providerUser['name'] ?? $providerUser['nickname'] ?? 'Developer',
            'provider' => $provider,
            'provider_id' => $providerUser['id'],
            'provider_avatar' => $providerUser['avatar'] ?? null,
            'provider_data' => $providerUser,
            'email_verified_at' => now(),
            'last_login_at' => now(),
            'username' => $username, // SIEMPRE el username único
        ];

        // Si no hay avatar local, usar el del proveedor
        if (empty($user?->avatar) && !empty($providerUser['avatar'])) {
            $userData['avatar'] = $providerUser['avatar'];
        }

        // Extraer datos adicionales
        if ($provider === 'github') {
            $userData['github_username'] = $providerUser['nickname'];
            $userData['bio'] = $providerUser['user']['bio'] ?? null;
            $userData['website'] = $providerUser['user']['blog'] ?? null;
            $userData['location'] = $providerUser['user']['location'] ?? null;
            // Nivel por repos
            if (isset($providerUser['user']['public_repos'])) {
                $repos = $providerUser['user']['public_repos'];
                if ($repos >= 20) {
                    $userData['level'] = 'senior';
                } elseif ($repos >= 10) {
                    $userData['level'] = 'mid';
                } else {
                    $userData['level'] = 'junior';
                }
            }
        }
        // NO volver a asignar username aquí

        if ($user) {
            $user->update($userData);
        } else {
            $userData['username'] = $userData['username'] ?? 'user_' . time();
            $userData['level'] = $userData['level'] ?? 'junior';
            $userData['years_experience'] = $userData['years_experience'] ?? 0;
            $user = self::create($userData);
        }

        return [
            'user' => $user,
            'isNewUser' => $isNewUser
        ];
    }
}
