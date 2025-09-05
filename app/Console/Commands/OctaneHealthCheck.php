<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Http;

class OctaneHealthCheck extends Command
{
    protected $signature = 'octane:health-check 
                           {--port=8000 : Port to check Octane server}
                           {--memory-threshold=512 : Memory threshold in MB}
                           {--response-time-threshold=2000 : Response time threshold in ms}';

    protected $description = 'Check Octane server health and performance metrics';

    public function handle(): int
    {
        $this->info('🔍 Checking Octane Health...');
        
        $port = $this->option('port');
        $memoryThreshold = $this->option('memory-threshold') * 1024 * 1024; // Convert to bytes
        $responseThreshold = $this->option('response-time-threshold');
        
        $allChecks = [
            'server' => $this->checkServerStatus($port),
            'memory' => $this->checkMemoryUsage($memoryThreshold),
            'database' => $this->checkDatabaseConnection(),
            'redis' => $this->checkRedisConnection(),
            'response_time' => $this->checkResponseTime($port, $responseThreshold),
            'workers' => $this->checkQueueWorkers(),
        ];
        
        $passed = 0;
        $total = count($allChecks);
        
        foreach ($allChecks as $check => $result) {
            if ($result['status'] === 'ok') {
                $this->line("✅ {$result['message']}");
                $passed++;
            } else {
                $this->line("❌ {$result['message']}");
            }
        }
        
        $this->newLine();
        
        if ($passed === $total) {
            $this->info("🎉 All health checks passed! ({$passed}/{$total})");
            return Command::SUCCESS;
        } else {
            $this->error("⚠️  Some health checks failed. ({$passed}/{$total} passed)");
            return Command::FAILURE;
        }
    }
    
    private function checkServerStatus(int $port): array
    {
        try {
            $response = Http::timeout(5)->get("http://127.0.0.1:{$port}/health");
            
            if ($response->successful()) {
                return [
                    'status' => 'ok',
                    'message' => "Octane server is running on port {$port}"
                ];
            }
            
            return [
                'status' => 'error',
                'message' => "Octane server responded with status {$response->status()}"
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => "Cannot connect to Octane server on port {$port}: {$e->getMessage()}"
            ];
        }
    }
    
    private function checkMemoryUsage(int $threshold): array
    {
        $currentMemory = memory_get_usage(true);
        $peakMemory = memory_get_peak_usage(true);
        
        $currentMB = round($currentMemory / 1024 / 1024, 2);
        $peakMB = round($peakMemory / 1024 / 1024, 2);
        $thresholdMB = round($threshold / 1024 / 1024);
        
        if ($currentMemory < $threshold) {
            return [
                'status' => 'ok',
                'message' => "Memory usage: {$currentMB}MB (Peak: {$peakMB}MB) - Below threshold ({$thresholdMB}MB)"
            ];
        }
        
        return [
            'status' => 'error',
            'message' => "Memory usage: {$currentMB}MB (Peak: {$peakMB}MB) - Above threshold ({$thresholdMB}MB)"
        ];
    }
    
    private function checkDatabaseConnection(): array
    {
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $duration = round((microtime(true) - $start) * 1000, 2);
            
            return [
                'status' => 'ok',
                'message' => "Database connection OK ({$duration}ms)"
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => "Database connection failed: {$e->getMessage()}"
            ];
        }
    }
    
    private function checkRedisConnection(): array
    {
        try {
            $start = microtime(true);
            Redis::ping();
            $duration = round((microtime(true) - $start) * 1000, 2);
            
            return [
                'status' => 'ok',
                'message' => "Redis connection OK ({$duration}ms)"
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => "Redis connection failed: {$e->getMessage()}"
            ];
        }
    }
    
    private function checkResponseTime(int $port, int $threshold): array
    {
        try {
            $start = microtime(true);
            $response = Http::timeout(10)->get("http://127.0.0.1:{$port}/api/health");
            $duration = round((microtime(true) - $start) * 1000);
            
            if ($duration < $threshold) {
                return [
                    'status' => 'ok',
                    'message' => "Response time: {$duration}ms - Below threshold ({$threshold}ms)"
                ];
            }
            
            return [
                'status' => 'error',
                'message' => "Response time: {$duration}ms - Above threshold ({$threshold}ms)"
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => "Response time check failed: {$e->getMessage()}"
            ];
        }
    }
    
    private function checkQueueWorkers(): array
    {
        try {
            // Check if queue workers are running by examining the queue
            $defaultJobs = Redis::llen('queues:default');
            $notificationJobs = Redis::llen('queues:notifications');
            
            $totalPending = $defaultJobs + $notificationJobs;
            
            if ($totalPending > 100) {
                return [
                    'status' => 'error',
                    'message' => "Queue backlog: {$totalPending} pending jobs - Workers may be overloaded"
                ];
            }
            
            return [
                'status' => 'ok',
                'message' => "Queue status: {$totalPending} pending jobs"
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => "Queue worker check failed: {$e->getMessage()}"
            ];
        }
    }
}