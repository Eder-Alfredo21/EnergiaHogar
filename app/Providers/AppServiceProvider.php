<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\Permission;
use App\Models\Submenu;
use App\Observers\MenuObserver;
use App\Observers\PermissionObserver;
use App\Observers\SubmenuObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Menu::observe(MenuObserver::class);
        Submenu::observe(SubmenuObserver::class);
        Permission::observe(PermissionObserver::class);
    }
}
