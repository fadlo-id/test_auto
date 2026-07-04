<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This is a single-origin Inertia.js application — the frontend is always
    | served from the same domain as the backend, and the public /api/* routes
    | (analytics tracking pings) are only ever called from that same origin.
    | There is no legitimate cross-origin use case today, so the allowlist is
    | restricted to APP_URL only. Widen this deliberately if a mobile app or
    | third-party embed is introduced later — never use '*' together with
    | supports_credentials.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([env('APP_URL')]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
