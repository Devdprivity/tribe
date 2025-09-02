<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncSocialAvatars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'social:sync-avatars {--force : Force update even if avatar exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza avatares de usuarios autenticados socialmente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Iniciando sincronización de avatares sociales...');

        $users = User::whereNotNull('provider')
            ->whereNotNull('provider_id')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('No se encontraron usuarios con autenticación social.');
            return;
        }

        $this->info("📱 Encontrados {$users->count()} usuarios con autenticación social.");
        
        $updated = 0;
        $errors = 0;

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            try {
                if ($this->updateUserAvatar($user)) {
                    $updated++;
                }
            } catch (\Exception $e) {
                $errors++;
                Log::error("Error updating avatar for user {$user->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($updated > 0) {
            $this->info("✅ {$updated} avatares actualizados exitosamente.");
        }

        if ($errors > 0) {
            $this->warn("⚠️  {$errors} errores durante la actualización.");
        }

        $this->info('🎯 Sincronización completada.');
    }

    /**
     * Update avatar for a specific user
     */
    private function updateUserAvatar(User $user): bool
    {
        $force = $this->option('force');
        
        // Si no es forzado y ya tiene avatar, saltar
        if (!$force && !empty($user->avatar)) {
            return false;
        }

        try {
            switch ($user->provider) {
                case 'github':
                    return $this->updateGitHubAvatar($user);
                case 'google':
                    return $this->updateGoogleAvatar($user);
                default:
                    return false;
            }
        } catch (\Exception $e) {
            $this->error("Error updating {$user->provider} avatar for user {$user->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update GitHub avatar
     */
    private function updateGitHubAvatar(User $user): bool
    {
        if (empty($user->github_username)) {
            return false;
        }

        try {
            $response = Http::get("https://api.github.com/users/{$user->github_username}");
            
            if ($response->successful()) {
                $data = $response->json();
                $avatarUrl = $data['avatar_url'] ?? null;
                
                if ($avatarUrl) {
                    $user->updateProviderAvatar($avatarUrl);
                    return true;
                }
            }
        } catch (\Exception $e) {
            Log::error("GitHub API error for user {$user->id}: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Update Google avatar
     */
    private function updateGoogleAvatar(User $user): bool
    {
        // Para Google, necesitaríamos re-autenticar al usuario
        // ya que no tenemos acceso directo a su API de perfil
        // Por ahora, solo logueamos que no se puede hacer
        $this->warn("Google avatars require re-authentication for user {$user->id}");
        return false;
    }
}
