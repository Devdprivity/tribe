<?php

namespace App\Http\Middleware;

use App\Jobs\UpdateSocialAvatar;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckSocialAvatar
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Solo verificar para usuarios autenticados
        if (Auth::check()) {
            $user = Auth::user();
            
            // Verificar si es un usuario social y necesita actualización de avatar
            if ($this->shouldUpdateAvatar($user)) {
                $this->scheduleAvatarUpdate($user);
            }
        }

        return $next($request);
    }

    /**
     * Check if user avatar should be updated
     */
    private function shouldUpdateAvatar(User $user): bool
    {
        // Solo usuarios sociales
        if (empty($user->provider)) {
            return false;
        }

        // Verificar si ya se actualizó recientemente (cada 24 horas)
        $cacheKey = "avatar_update_{$user->id}";
        if (Cache::has($cacheKey)) {
            return false;
        }

        // Verificar si necesita actualización
        if ($user->provider === 'github' && !empty($user->github_username)) {
            return true;
        }

        return false;
    }

    /**
     * Schedule avatar update job
     */
    private function scheduleAvatarUpdate(User $user): void
    {
        // Marcar como actualizado para evitar múltiples jobs
        $cacheKey = "avatar_update_{$user->id}";
        Cache::put($cacheKey, true, now()->addHours(24));

        // Despachar job para actualizar avatar
        UpdateSocialAvatar::dispatch($user, $user->provider)
            ->delay(now()->addMinutes(5)); // Pequeño delay para no bloquear la request
    }
}
