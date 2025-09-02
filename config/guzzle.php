<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Guzzle HTTP Client Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for Guzzle HTTP client,
    | specifically for SSL certificate verification.
    |
    */

    'verify' => env('GUZZLE_VERIFY_SSL', true),
    'cert' => env('SSL_CERT_FILE', 'C:\\tools\\php84\\cacert.pem'),
    'ssl_key' => null,
    'timeout' => 30,
    'connect_timeout' => 10,
];