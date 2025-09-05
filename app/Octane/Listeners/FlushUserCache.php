<?php

namespace App\Octane\Listeners;

use Laravel\Octane\Contracts\OperationTerminated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class FlushUserCache
{
    /**
     * Handle the event.
     */
    public function handle(OperationTerminated $event): void
    {
        // Clear user-specific cache that might leak between requests
        if (Auth::check()) {
            $userId = Auth::id();
            
            // Clear potential cached user data
            Cache::forget("user.{$userId}.following");
            Cache::forget("user.{$userId}.notifications");
            Cache::forget("user.{$userId}.bookmarks");
        }
        
        // Clear any global user cache that might have been set
        Cache::forget('active_users');
        Cache::forget('online_count');
        
        // Clear Auth state to prevent bleeding between requests
        Auth::logout();
        
        // Clear any session data that might persist
        if (session()->isStarted()) {
            session()->flush();
        }
    }
}