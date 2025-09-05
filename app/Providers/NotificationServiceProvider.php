<?php

namespace App\Providers;

use App\Services\NotificationService;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register NotificationService as singleton for Octane compatibility
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService();
        });

        // Create alias for easier injection
        $this->app->alias(NotificationService::class, 'notification.service');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}