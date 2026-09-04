<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\MyAppController;
use App\Http\Controllers\TemplateImageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public — exchanges email/password for a Sanctum bearer token. See AuthService::apiLogin().
Route::post('/login', [ApiAuthController::class, 'login'])->name('api.login');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Server-side (Browsershot) Template Image generation API — token-authenticated (Sanctum), for
// external/programmatic use. See TemplateImageController/TemplateImageGenerationService.
Route::middleware('auth:sanctum')->name('api.')->group(function () {
    // The caller's own Facebook Apps + their accounts (Pages), minimally projected — lets an API
    Route::get('/my-apps', [MyAppController::class, 'index'])->name('my-app');

    Route::prefix('templates')->name('templates.')->group(function () {
        // templates visible to the token's user (common + own)
        Route::get('/', [TemplateImageController::class, 'index'])->name('index');
        // one template's fields + a ready-to-use `values` example
        Route::get('/{template}', [TemplateImageController::class, 'show'])->name('show');
        // render + store the image, returns its url/path
        Route::post('/{template}/generate-image', [TemplateImageController::class, 'generate'])->name('generate-image');
    });
});
