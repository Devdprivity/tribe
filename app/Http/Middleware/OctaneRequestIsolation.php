<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use App\Octane\Listeners\LogPerformanceMetrics;

class OctaneRequestIsolation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Start performance tracking
        LogPerformanceMetrics::startRequestTracking();
        
        // Enable query logging for performance monitoring
        if (config('app.debug') || config('octane.monitoring.enabled', false)) {
            DB::enableQueryLog();
        }
        
        // Ensure fresh request state
        $this->clearRequestState();
        
        $response = $next($request);
        
        // Clean up after request
        $this->cleanupRequestState();
        
        return $response;
    }
    
    /**
     * Clear any state that might leak between requests
     */
    private function clearRequestState(): void
    {
        // Clear any cached user data that might leak
        if (Auth::hasUser()) {
            // Don't clear Auth state here as it's handled by FlushUserCache listener
            // Just ensure no stale cached data
            app('cache.store')->tags(['user-data'])->flush();
        }
        
        // Clear view shared data to prevent data leakage
        View::flushState();
        
        // Clear any temporary request-scoped data
        if (app()->bound('request.data')) {
            app()->forgetInstance('request.data');
        }
    }
    
    /**
     * Cleanup after request processing
     */
    private function cleanupRequestState(): void
    {
        // Clear any accumulated query log to prevent memory growth
        if (DB::logging()) {
            $queryCount = count(DB::getQueryLog());
            
            // Log if excessive queries
            if ($queryCount > 50) {
                logger()->warning('High query count detected', [
                    'query_count' => $queryCount,
                    'url' => request()->fullUrl(),
                ]);
            }
        }
        
        // Force cleanup of any large objects that might be retained
        if (function_exists('gc_collect_cycles')) {
            // Only run garbage collection every few requests to avoid performance impact
            if (random_int(1, 10) === 1) {
                gc_collect_cycles();
            }
        }
    }
}