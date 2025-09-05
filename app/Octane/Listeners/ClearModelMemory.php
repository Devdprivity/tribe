<?php

namespace App\Octane\Listeners;

use Laravel\Octane\Contracts\OperationTerminated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ClearModelMemory
{
    /**
     * Handle the event.
     */
    public function handle(OperationTerminated $event): void
    {
        // Clear Eloquent model registry to prevent memory leaks
        Model::clearBootedModels();
        
        // Clear connection resolver instances
        DB::purge();
        
        // Force garbage collection of model instances
        if (function_exists('gc_collect_cycles')) {
            gc_collect_cycles();
        }
        
        // Clear any cached relationship data
        $this->clearModelRelationshipCache();
    }
    
    /**
     * Clear cached relationship data that might accumulate
     */
    private function clearModelRelationshipCache(): void
    {
        // Clear Laravel's internal caches that can grow over time
        if (app()->bound('events')) {
            // Clear event listeners that might hold model references
            app('events')->flush();
        }
        
        // Clear view shared data that might reference models
        if (app()->bound('view')) {
            app('view')->flushState();
        }
    }
}