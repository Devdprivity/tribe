<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Streaming Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for live streaming functionality
    |
    */

    // RTMP Server Configuration (for receiving streams from OBS/streamers)
    'rtmp_server' => env('STREAMING_RTMP_SERVER', 'rtmp://localhost:1935/live'),
    'rtmp_port' => env('STREAMING_RTMP_PORT', 1935),

    // HLS Server Configuration (for playback to viewers)
    'hls_server' => env('STREAMING_HLS_SERVER', 'http://localhost:8080/hls'),
    'hls_port' => env('STREAMING_HLS_PORT', 8080),

    // WebRTC Configuration (for low-latency streaming)
    'webrtc_enabled' => env('STREAMING_WEBRTC_ENABLED', false),
    'webrtc_server' => env('STREAMING_WEBRTC_SERVER', 'ws://localhost:8081'),
    
    // For development - use test video stream
    'use_test_stream' => env('STREAMING_USE_TEST_STREAM', true),
    'test_stream_url' => env('STREAMING_TEST_STREAM_URL', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    
    // Streaming Quality Settings
    'default_quality' => env('STREAMING_DEFAULT_QUALITY', '720p'),
    'max_quality' => env('STREAMING_MAX_QUALITY', '1080p'),
    
    // Recording Settings
    'auto_record' => env('STREAMING_AUTO_RECORD', false),
    'recording_format' => env('STREAMING_RECORDING_FORMAT', 'mp4'),
    
    // Stream Limits
    'max_stream_duration' => env('STREAMING_MAX_DURATION', 14400), // 4 hours in seconds
    'max_concurrent_streams' => env('STREAMING_MAX_CONCURRENT', 100),
    
    // Chat Settings
    'max_message_length' => env('STREAMING_MAX_MESSAGE_LENGTH', 500),
    'rate_limit_messages' => env('STREAMING_RATE_LIMIT_MESSAGES', 5), // messages per minute
];