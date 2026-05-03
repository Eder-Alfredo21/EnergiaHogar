<?php

use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\SubmenuController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// ─── Rutas nombradas requeridas por Fortify para generar URLs en emails ───────
Route::get('/forgot-password', fn () => view('spa'))->name('password.request');
Route::get('/reset-password/{token}', fn () => view('spa'))->name('password.reset');

// ─── API interna (sesión web) ─────────────────────────────────────────────────
Route::middleware('auth')->prefix('api')->group(function () {

    // Sesión del usuario autenticado
    Route::get('/me',    [ConfiguracionController::class, 'perfil']);
    Route::get('/menus', [ConfiguracionController::class, 'menusSidebar']);

    // Perfil del usuario autenticado
    Route::get('/perfil',          [PerfilController::class, 'show']);
    Route::put('/perfil',          [PerfilController::class, 'update']);
    Route::put('/perfil/password', [PerfilController::class, 'updatePassword']);
    Route::delete('/perfil',       [PerfilController::class, 'destroy']);

    // ── Módulo Configuración ──────────────────────────────────────────────────
    Route::prefix('configuracion')->group(function () {

        // Menús
        Route::get('menus',                    [MenuController::class, 'index']);
        Route::post('menus',                   [MenuController::class, 'store']);
        Route::get('menus/{menu}',             [MenuController::class, 'show']);
        Route::put('menus/{menu}',             [MenuController::class, 'update']);
        Route::patch('menus/{menu}/estado',    [MenuController::class, 'cambiarEstado']);
        Route::delete('menus/{menu}',          [MenuController::class, 'destroy']);

        // Submenús
        Route::get('submenus',                    [SubmenuController::class, 'index']);
        Route::post('submenus',                   [SubmenuController::class, 'store']);
        Route::put('submenus/{submenu}',          [SubmenuController::class, 'update']);
        Route::patch('submenus/{submenu}/estado', [SubmenuController::class, 'cambiarEstado']);
        Route::delete('submenus/{submenu}',       [SubmenuController::class, 'destroy']);

        // Roles
        Route::get('roles',                      [RolController::class, 'index']);
        Route::post('roles',                     [RolController::class, 'store']);
        Route::put('roles/{rol}',                [RolController::class, 'update']);
        Route::delete('roles/{rol}',             [RolController::class, 'destroy']);
        Route::get('roles/{rol}/permisos',       [RolController::class, 'permisosDelRol']);
        Route::get('permisos-jerarquia',         [RolController::class, 'permisosJerarquia']);

        // Usuarios
        Route::get('usuarios',                 [UsuarioController::class, 'index']);
        Route::post('usuarios',                [UsuarioController::class, 'store']);
        Route::put('usuarios/{usuario}',       [UsuarioController::class, 'update']);
        Route::delete('usuarios/{usuario}',    [UsuarioController::class, 'destroy']);
        Route::get('roles-lista',              [UsuarioController::class, 'listarRoles']);

    });

});

// ─── SPA catch-all (siempre al final) ────────────────────────────────────────
Route::get('/{any?}', fn () => view('spa'))->where('any', '.*');
