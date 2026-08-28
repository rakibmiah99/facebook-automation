<?php

namespace App\Providers;

use App\Helpers\FacebookHelper;
use App\Helpers\MediaHelper;
use App\Repositories\FacebookRepositoryInterface;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->singleton(MediaHelperRepositoryInterface::class, MediaHelper::class);
        $this->app->singleton(FacebookRepositoryInterface::class, FacebookHelper::class);
    }
}
