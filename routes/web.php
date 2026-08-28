<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacebookAppAccountController;
use App\Http\Controllers\FacebookAppController;
use App\Http\Controllers\FacebookAuthController;
use App\Http\Controllers\PostCommentController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');
Route::get('/facebook/callback', [FacebookAuthController::class, 'callback'])->name('facebook.callback');
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    Route::get('/facebook/connect', [FacebookAuthController::class, 'connect'])->name('facebook.connect');

    Route::get('/facebook-apps', [FacebookAppController::class, 'index'])->name('facebook-apps.index');
    Route::post('/facebook-apps', [FacebookAppController::class, 'store'])->name('facebook-apps.store');
    Route::post('/facebook-apps/{facebookApp}/update', [FacebookAppController::class, 'update'])->name('facebook-apps.update');
    Route::post('/facebook-apps/{facebookApp}/delete', [FacebookAppController::class, 'destroy'])->name('facebook-apps.destroy');
    Route::post('/facebook-apps/{facebookApp}/generate-token', [FacebookAppController::class, 'generateToken'])->name('facebook-apps.generate-token');

    Route::get('/facebook-apps/{facebookApp}/accounts', [FacebookAppAccountController::class, 'index'])->name('facebook-app-accounts.index');
    Route::post('/facebook-apps/{facebookApp}/accounts/fetch', [FacebookAppAccountController::class, 'fetch'])->name('facebook-app-accounts.fetch');

    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('/posts/text', [PostController::class, 'showText'])->name('posts.text');
    Route::post('/posts/text', [PostController::class, 'storeText'])->name('posts.text.store');
    Route::get('/posts/image', [PostController::class, 'showImage'])->name('posts.image');
    Route::post('/posts/image', [PostController::class, 'storeImage'])->name('posts.image.store');
    Route::post('/posts/{post}/retry', [PostController::class, 'retry'])->name('posts.retry');

    Route::post('/posts/comments/{postComment}/retry', [PostCommentController::class, 'retry'])->name('posts.comments.retry');
});

require __DIR__.'/auth.php';
