<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateSocialAvatar implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public string $provider
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            switch ($this->provider) {
                case 'github':
                    $this->updateGitHubAvatar();
                    break;
                case 'google':
                    $this->updateGoogleAvatar();
                    break;
                default:
                    Log::warning("Provider {$this->provider} not supported for avatar update");
            }
        } catch (\Exception $e) {
            Log::error("Error updating {$this->provider} avatar for user {$this->user->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update GitHub avatar
     */
    private function updateGitHubAvatar(): void
    {
        if (empty($this->user->github_username)) {
            Log::warning("User {$this->user->id} has no GitHub username");
            return;
        }

        try {
            $response = Http::timeout(10)->get("https://api.github.com/users/{$this->user->github_username}");
            
            if ($response->successful()) {
                $data = $response->json();
                $avatarUrl = $data['avatar_url'] ?? null;
                
                if ($avatarUrl) {
                    $this->user->updateProviderAvatar($avatarUrl);
                    Log::info("GitHub avatar updated for user {$this->user->id}");
                }
            } else {
                Log::warning("GitHub API returned status {$response->status()} for user {$this->user->id}");
            }
        } catch (\Exception $e) {
            Log::error("GitHub API error for user {$this->user->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update Google avatar
     */
    private function updateGoogleAvatar(): void
    {
        // Para Google, necesitaríamos re-autenticar al usuario
        // ya que no tenemos acceso directo a su API de perfil
        Log::info("Google avatar update requires re-authentication for user {$this->user->id}");
    }
}
