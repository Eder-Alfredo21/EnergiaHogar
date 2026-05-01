<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfiguracionController extends Controller
{
    public function perfil(Request $request): JsonResponse
    {
        $usuario = $request->user()->load('roles');

        return response()->json([
            'id'       => $usuario->id,
            'name'     => $usuario->name,
            'username' => $usuario->username,
            'email'    => $usuario->email,
            'rol'      => $usuario->getRoleNames()->first() ?? 'Sin rol',
            'permisos' => $usuario->getAllPermissions()->pluck('name')->values()->toArray(),
        ]);
    }

    public function menusSidebar(Request $request): JsonResponse
    {
        $roleId = $request->user()->roles->first()->id ?? null;

        $menus = Menu::where('menu_estado', 1)
            ->where('menu_mostrar', 1)
            ->whereHas('permisos', function ($query) use ($roleId) {
                $query->where('permissions_group', Permission::GRUPO_MENU)
                      ->where('permission_status', 1)
                      ->whereHas('roles', fn ($q) => $q->where('id', $roleId));
            })
            ->with(['submenus' => function ($query) use ($roleId) {
                $query->where('submenu_estado', 1)
                      ->where('submenu_mostrar', 1)
                      ->whereHas('permisos', function ($q) use ($roleId) {
                          $q->where('permissions_group', Permission::GRUPO_SUBMENU)
                            ->where('permission_status', 1)
                            ->whereHas('roles', fn ($q2) => $q2->where('id', $roleId));
                      })
                      ->orderBy('submenu_orden');
            }])
            ->orderBy('menu_orden')
            ->get();

        return response()->json($menus);
    }
}
