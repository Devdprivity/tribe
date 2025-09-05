<?php

namespace App\Octane\Listeners;

use Laravel\Octane\Contracts\OperationTerminated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LogPerformanceMetrics
{
    private static $requestStartTime;
    private static $requestStartMemory;
    
    /**
     * Handle the event.
     */
    public function handle(OperationTerminated $event): void
    {
        $this->logPerformanceMetrics();
        $this->checkMemoryUsage();
        $this->logDatabaseQueryCount();
    }
    
    /**
     * Set request start metrics (call this in middleware)
     */
    public static function startRequestTracking(): void
    {
        self::$requestStartTime = microtime(true);
        self::$requestStartMemory = memory_get_usage(true);
    }
    
    /**
     * Log performance metrics for the request
     */
    private function logPerformanceMetrics(): void
    {
        if (!self::$requestStartTime) {
            return;
        }
        
        $executionTime = microtime(true) - self::$requestStartTime;
        $memoryUsed = memory_get_usage(true) - self::$requestStartMemory;
        $peakMemory = memory_get_peak_usage(true);
        
        // Log only if request took more than 1 second or used excessive memory
        if ($executionTime > 1.0 || $memoryUsed > 50 * 1024 * 1024) { // 50MB
            Log::channel('octane')->warning('Slow request detected', [
                'execution_time' => round($executionTime, 3) . 's',
                'memory_used' => $this->formatBytes($memoryUsed),
                'peak_memory' => $this->formatBytes($peakMemory),
                'url' => request()->fullUrl(),
                'method' => request()->method(),
            ]);
        }
    }
    
    /**
     * Check memory usage and warn if high
     */
    private function checkMemoryUsage(): void
    {
        $currentMemory = memory_get_usage(true);
        $memoryLimit = $this->parsePhpMemoryLimit();
        
        // Warn if using more than 75% of memory limit
        if ($currentMemory > ($memoryLimit * 0.75)) {
            Log::channel('octane')->warning('High memory usage detected', [
                'current_memory' => $this->formatBytes($currentMemory),
                'memory_limit' => $this->formatBytes($memoryLimit),
                'usage_percentage' => round(($currentMemory / $memoryLimit) * 100, 2) . '%',
            ]);
        }
    }
    
    /**
     * Log database query count if excessive
     */
    private function logDatabaseQueryCount(): void
    {
        $queryLog = DB::getQueryLog();
        $queryCount = count($queryLog);
        
        // Warn if more than 20 queries per request
        if ($queryCount > 20) {
            Log::channel('octane')->warning('High query count detected', [
                'query_count' => $queryCount,
                'url' => request()->fullUrl(),
                'method' => request()->method(),
            ]);
        }
        
        // Clear query log to prevent memory accumulation
        DB::flushQueryLog();
    }
    
    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    /**
     * Parse PHP memory limit to bytes
     */
    private function parsePhpMemoryLimit(): int
    {
        $memoryLimit = ini_get('memory_limit');
        
        if ($memoryLimit == -1) {
            return PHP_INT_MAX;
        }
        
        $unit = strtolower(substr($memoryLimit, -1));
        $value = (int) substr($memoryLimit, 0, -1);
        
        switch ($unit) {
            case 'g':
                $value *= 1024 * 1024 * 1024;
                break;
            case 'm':
                $value *= 1024 * 1024;
                break;
            case 'k':
                $value *= 1024;
                break;
        }
        
        return $value;
    }
}