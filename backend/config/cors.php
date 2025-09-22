<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure cross-origin resource sharing settings for the application.
    | These options will be merged into the default Laravel configuration to
    | ensure first-party SPAs can send authenticated requests while running
    | on a different origin during local development.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
