<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Redirect to the OAuth provider
     */
    public function redirectToProvider(string $provider)
    {
        try {
            $this->validateProvider($provider);

            $scopes = $this->getProviderScopes($provider);
            $socialiteDriver = Socialite::driver($provider);

            if (!empty($scopes)) {
                $socialiteDriver->scopes($scopes);
            }

            return $socialiteDriver->redirect();
        } catch (Throwable $e) {
            Log::error("Social auth redirect error for {$provider}: " . $e->getMessage());

            return redirect()->route('login')
                ->with('error', 'Error al conectar con ' . ucfirst($provider) . '. Inténtalo de nuevo.');
        }
    }

    /**
     * Handle the OAuth provider callback
     */
    public function handleProviderCallback(string $provider)
    {
        try {
            $this->validateProvider($provider);

            // Configure SSL options for Guzzle
            $driver = Socialite::driver($provider);
            if (method_exists($driver, 'setHttpClient')) {
                $guzzleConfig = [
                    'verify' => env('SSL_CERT_FILE', 'C:\\tools\\php84\\cacert.pem'),
                    'timeout' => 30,
                    'connect_timeout' => 10,
                ];
                $httpClient = new \GuzzleHttp\Client($guzzleConfig);
                $driver->setHttpClient($httpClient);
            }

            $socialiteUser = $driver->user();

            // Validate required data
            if (empty($socialiteUser->getEmail())) {
                return redirect()->route('login')
                    ->with('error', 'No se pudo obtener tu email de ' . ucfirst($provider) . '. Verifica los permisos.');
            }

            // Create or update user
            $result = User::createOrUpdateFromProvider($provider, [
                'id' => $socialiteUser->getId(),
                'email' => $socialiteUser->getEmail(),
                'name' => $socialiteUser->getName(),
                'nickname' => $socialiteUser->getNickname(),
                'avatar' => $socialiteUser->getAvatar(),
                'user' => $socialiteUser->user ?? null, // Raw provider data
            ]);
            
            $user = $result['user'];
            $isNewUser = $result['isNewUser'];

            // Update provider avatar if it has changed
            $currentAvatar = $user->provider_avatar;
            $newAvatar = $socialiteUser->getAvatar();
            
            if ($newAvatar && $newAvatar !== $currentAvatar) {
                $user->updateProviderAvatar($newAvatar);
            }

            // Update last login
            $user->updateLastLogin();

            // Log the user in
            Auth::login($user, true);

            // Handle new user onboarding
            if ($isNewUser) {
                // Set default theme preference for new users
                $user->update(['theme_preference' => 'dark']);
                
                // Store flag in session to trigger onboarding
                session(['force_onboarding' => true]);
                
                // Clear any existing onboarding completion flag
                session(['clear_onboarding_storage' => true]);
            }

            // Redirect to intended destination or timeline
            $redirectTo = session()->pull('url.intended', route('timeline.redirect'));

            $welcomeMessage = $isNewUser 
                ? '¡Bienvenido a Tribe! Completemos tu perfil para comenzar.' 
                : '¡Bienvenido de vuelta! Te has autenticado exitosamente con ' . ucfirst($provider) . '.';

            return redirect()->to($redirectTo)
                ->with('success', $welcomeMessage);

        } catch (Throwable $e) {
            Log::error("Social auth callback error for {$provider}: " . $e->getMessage(), [
                'exception' => $e,
                'user_data' => $socialiteUser ?? null,
            ]);

            return redirect()->route('login')
                ->with('error', 'Error durante la autenticación con ' . ucfirst($provider) . '. Inténtalo de nuevo.');
        }
    }

    /**
     * Disconnect a social provider from user account
     */
    public function disconnect(Request $request, string $provider)
    {
        try {
            $this->validateProvider($provider);

            $user = Auth::user();

            // Check if user has password (can't disconnect if only auth method)
            if ($user->isSocialUser() && !$user->password) {
                return back()->with('error', 'No puedes desconectar ' . ucfirst($provider) . ' sin configurar primero una contraseña.');
            }

            // Remove provider data
            $user->update([
                'provider' => null,
                'provider_id' => null,
                'provider_avatar' => null,
                'provider_data' => null,
            ]);

            return back()->with('success', ucfirst($provider) . ' ha sido desconectado de tu cuenta.');

        } catch (Throwable $e) {
            Log::error("Social auth disconnect error for {$provider}: " . $e->getMessage());

            return back()->with('error', 'Error al desconectar ' . ucfirst($provider) . '.');
        }
    }

    /**
     * Get the scopes for a provider
     */
    private function getProviderScopes(string $provider): array
    {
        return match ($provider) {
            'github' => ['user:email', 'read:user'], // Access to user profile and email
            'google' => ['openid', 'profile', 'email'], // Basic profile and email
            default => [],
        };
    }

    /**
     * Validate that the provider is supported
     */
    private function validateProvider(string $provider): void
    {
        $supportedProviders = ['github', 'google'];

        if (!in_array($provider, $supportedProviders)) {
            throw new \InvalidArgumentException("Provider {$provider} is not supported.");
        }
    }

    /**
     * Show social auth settings page
     */
    public function settings()
    {
        $user = Auth::user();

        return inertia('settings/social', [
            'user' => $user,
            'connectedProviders' => [
                'github' => !empty($user->provider) && $user->provider === 'github',
                'google' => !empty($user->provider) && $user->provider === 'google',
            ],
        ]);
    }
}
