<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Chrome / Chromium executable path
    |--------------------------------------------------------------------------
    |
    | Browsershot needs a real Chrome/Chromium binary to drive via Puppeteer.
    | Never hard-code a server-specific path here — set it per environment via
    | BROWSERSHOT_CHROME_PATH in .env (e.g. the Chrome for Testing binary path
    | on the production VPS).
    |
    */
    'chrome_path' => env('BROWSERSHOT_CHROME_PATH'),

    /*
    |--------------------------------------------------------------------------
    | Node / npm binaries
    |--------------------------------------------------------------------------
    |
    | Only needed when `node`/`npm` aren't reliably on PATH for the PHP
    | process (e.g. running behind a process manager with a stripped
    | environment). Leave empty to let Browsershot resolve them itself.
    |
    */
    'node_binary' => env('BROWSERSHOT_NODE_BINARY'),

    'npm_binary' => env('BROWSERSHOT_NPM_BINARY'),

];
