<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Queue Configuration for Octane Environment
    |--------------------------------------------------------------------------
    | 
    | Optimized queue configuration for Laravel Octane with Redis
    | Designed for high-throughput social network operations
    |
    */

    'default' => env('QUEUE_CONNECTION', 'redis'),

    'connections' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => env('QUEUE_RETRY_AFTER', 300), // 5 minutes
            'block_for' => null,
            'after_commit' => false,
        ],

        // High priority queue for real-time notifications
        'notifications' => [
            'driver' => 'redis',
            'connection' => 'redis',
            'queue' => 'notifications',
            'retry_after' => 60, // 1 minute retry for notifications
            'block_for' => null,
            'after_commit' => false,
        ],

        // Background processing for media uploads
        'media' => [
            'driver' => 'redis',
            'connection' => 'redis',
            'queue' => 'media',
            'retry_after' => 900, // 15 minutes for media processing
            'block_for' => null,
            'after_commit' => false,
        ],

        // Analytics and metrics processing
        'analytics' => [
            'driver' => 'redis',
            'connection' => 'redis',
            'queue' => 'analytics',
            'retry_after' => 1800, // 30 minutes for analytics
            'block_for' => null,
            'after_commit' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configuration for Octane
    |--------------------------------------------------------------------------
    */

    'workers' => [
        // Default worker configuration
        'default' => [
            'connection' => 'redis',
            'queue' => 'default',
            'balance' => 'simple',
            'processes' => env('QUEUE_WORKERS_DEFAULT', 3),
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
            'tries' => 3,
            'timeout' => 300, // 5 minutes
            'memory' => 512, // 512MB memory limit
            'sleep' => 3,
            'maxTime' => 0,
        ],

        // High-priority notification workers
        'notifications' => [
            'connection' => 'notifications',
            'queue' => 'notifications',
            'balance' => 'simple',
            'processes' => env('QUEUE_WORKERS_NOTIFICATIONS', 5),
            'balanceMaxShift' => 1,
            'balanceCooldown' => 1,
            'tries' => 2,
            'timeout' => 60, // 1 minute timeout for notifications
            'memory' => 256, // 256MB memory limit
            'sleep' => 1, // Quick polling for notifications
            'maxTime' => 0,
        ],

        // Media processing workers
        'media' => [
            'connection' => 'media',
            'queue' => 'media',
            'balance' => 'simple',
            'processes' => env('QUEUE_WORKERS_MEDIA', 2),
            'balanceMaxShift' => 1,
            'balanceCooldown' => 5,
            'tries' => 3,
            'timeout' => 900, // 15 minutes for media processing
            'memory' => 1024, // 1GB memory limit for media
            'sleep' => 5,
            'maxTime' => 3600, // Restart worker every hour
        ],

        // Analytics workers
        'analytics' => [
            'connection' => 'analytics',
            'queue' => 'analytics',
            'balance' => 'simple',
            'processes' => env('QUEUE_WORKERS_ANALYTICS', 1),
            'balanceMaxShift' => 1,
            'balanceCooldown' => 10,
            'tries' => 2,
            'timeout' => 1800, // 30 minutes for analytics
            'memory' => 512,
            'sleep' => 10, // Lower frequency for analytics
            'maxTime' => 7200, // Restart worker every 2 hours
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    */

    'batching' => [
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'job_batches',
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    */

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Monitoring
    |--------------------------------------------------------------------------
    */

    'monitoring' => [
        'enabled' => env('QUEUE_MONITORING_ENABLED', true),
        'log_slow_jobs' => env('QUEUE_LOG_SLOW_JOBS', true),
        'slow_job_threshold' => env('QUEUE_SLOW_JOB_THRESHOLD', 30), // seconds
        'log_failed_jobs' => env('QUEUE_LOG_FAILED_JOBS', true),
    ],
];