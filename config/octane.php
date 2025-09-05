<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Octane Server
    |--------------------------------------------------------------------------
    */

    'server' => env('OCTANE_SERVER', 'swoole'),

    /*
    |--------------------------------------------------------------------------
    | Swoole Configuration
    |--------------------------------------------------------------------------
    */

    'swoole' => [
        'options' => [
            // Worker Configuration - OPTIMIZED for Social Network
            'worker_num' => env('OCTANE_SWOOLE_WORKERS', function_exists('swoole_cpu_num') ? swoole_cpu_num() : 4),
            'task_worker_num' => env('OCTANE_TASK_WORKERS', function_exists('swoole_cpu_num') ? swoole_cpu_num() : 4),
            
            // Memory Management - CRITICAL for Social Network
            'max_request' => env('OCTANE_MAX_REQUESTS', 1000), // Restart worker after 1000 requests
            'max_conn' => env('OCTANE_MAX_CONNECTIONS', 10000), // High concurrent connections
            'package_max_length' => env('OCTANE_PACKAGE_MAX_LENGTH', 20 * 1024 * 1024), // 20MB for stories/media
            
            // Performance Optimizations
            'open_tcp_nodelay' => true,
            'open_cpu_affinity' => true,
            'enable_coroutine' => true,
            'hook_flags' => defined('SWOOLE_HOOK_ALL') ? SWOOLE_HOOK_ALL : 0,
            
            // Buffer Sizes for Media Content
            'socket_buffer_size' => 128 * 1024 * 1024, // 128MB
            'buffer_output_size' => 32 * 1024 * 1024,  // 32MB
            
            // Timeouts
            'heartbeat_check_interval' => 60,
            'heartbeat_idle_time' => 600,
            
            // Log Configuration
            'log_file' => storage_path('logs/octane-swoole.log'),
            'log_level' => defined('SWOOLE_LOG_INFO') ? SWOOLE_LOG_INFO : 0,
            'log_rotation' => defined('SWOOLE_LOG_ROTATION_DAILY') ? SWOOLE_LOG_ROTATION_DAILY : 0,
        ],

        'tables' => [
            // Shared memory table for caching user sessions
            'user_sessions' => [
                'size' => 10000, // 10k concurrent users
                'columns' => [
                    ['name' => 'user_id', 'type' => class_exists('\Swoole\Table') ? \Swoole\Table::TYPE_INT : 1, 'size' => 8],
                    ['name' => 'last_activity', 'type' => class_exists('\Swoole\Table') ? \Swoole\Table::TYPE_INT : 1, 'size' => 8],
                    ['name' => 'data', 'type' => class_exists('\Swoole\Table') ? \Swoole\Table::TYPE_STRING : 2, 'size' => 1024],
                ],
            ],
            
            // Shared memory for rate limiting
            'rate_limits' => [
                'size' => 100000,
                'columns' => [
                    ['name' => 'requests', 'type' => class_exists('\Swoole\Table') ? \Swoole\Table::TYPE_INT : 1, 'size' => 8],
                    ['name' => 'reset_time', 'type' => class_exists('\Swoole\Table') ? \Swoole\Table::TYPE_INT : 1, 'size' => 8],
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | RoadRunner Configuration  
    |--------------------------------------------------------------------------
    */

    'roadrunner' => [
        'rpc_port' => env('OCTANE_RPC_PORT', 6001),
        'options' => [
            'command' => 'php app.php',
            'relay' => 'pipes',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Octane Listeners
    |--------------------------------------------------------------------------
    */

    'listeners' => [
        // Worker lifecycle
        \Laravel\Octane\Events\WorkerStarting::class => [
            \Laravel\Octane\Listeners\EnsureUploadedFilesAreValid::class,
            \Laravel\Octane\Listeners\EnsureUploadedFilesCanBeMoved::class,
        ],

        // Request lifecycle - CRITICAL for memory management
        \Laravel\Octane\Events\RequestReceived::class => [
            ...(class_exists('\Laravel\Octane\Octane') ? \Laravel\Octane\Octane::prepareApplicationForNextOperation() : []),
            ...(class_exists('\Laravel\Octane\Octane') ? \Laravel\Octane\Octane::prepareApplicationForNextRequest([
                'db', 'redis', // Keep these connections
            ]) : []),
        ],

        \Laravel\Octane\Events\RequestHandled::class => [
        ],

        \Laravel\Octane\Events\RequestTerminated::class => [
            // CUSTOM: Our memory cleanup listeners
            \App\Octane\Listeners\FlushUserCache::class,
            \App\Octane\Listeners\ClearModelMemory::class,
            \App\Octane\Listeners\LogPerformanceMetrics::class,
        ],

        // Task lifecycle
        \Laravel\Octane\Events\TaskReceived::class => [
            ...(class_exists('\Laravel\Octane\Octane') ? \Laravel\Octane\Octane::prepareApplicationForNextOperation() : []),
        ],

        \Laravel\Octane\Events\TaskTerminated::class => [
        ],

        // Worker lifecycle
        \Laravel\Octane\Events\WorkerErrorOccurred::class => [
            \Laravel\Octane\Listeners\ReportException::class,
            \Laravel\Octane\Listeners\StopWorkerIfNecessary::class,
        ],

        \Laravel\Octane\Events\WorkerStopping::class => [
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Warm / Flush
    |--------------------------------------------------------------------------
    */

    'warm' => [
        ...\Laravel\Octane\Octane::defaultServicesToWarm(),
        // Add your services that should be warmed
        \App\Services\NotificationService::class,
    ],

    'flush' => [
        // Services to flush between requests
        'cookie',
    ],

    /*
    |--------------------------------------------------------------------------
    | Octane Cache Table
    |--------------------------------------------------------------------------
    */

    'cache' => [
        'driver' => env('OCTANE_CACHE_DRIVER', 'octane'),
        'stores' => [
            'octane' => [
                'driver' => 'octane',
                'rows' => env('OCTANE_CACHE_ROWS', 1000),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Garbage Collection
    |--------------------------------------------------------------------------
    */

    'garbage_collection' => [
        'enabled' => env('OCTANE_GC_ENABLED', true),
        'interval' => env('OCTANE_GC_INTERVAL', 500), // Every 500 requests
        'memory_limit' => env('OCTANE_GC_MEMORY_LIMIT', 128), // 128MB threshold
    ],

];