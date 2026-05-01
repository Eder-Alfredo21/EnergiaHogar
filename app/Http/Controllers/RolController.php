<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar    = $request->get('buscar', '');
        $ordenar   = $request->get('ordenar', 'name');
        $direccion = $request->get('direccion', 'asc');
        $porPagina = min((int) $request->get('por_pagina', 10), 50);

        $roles = Role::withCount(['permissions', 'users'])
            ->when($buscar, fn ($q) => $q->where('name', 'like', "%{$buscar}%"))
            ->orderBy('name', $direccion === 'desc' ? 'desc' : 'asc')
            ->paginate($porPagina);

        return response()->json($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
        ]);

        $rol = DB::transaction(fn () => Role::create([
            'name'       => $datos['name'],
            'guard_name' => 'web',
        ]));

        return response()->json($rol->loadCount('permissions', 'users'), 201);
    }

    public function update(Request $request, Role $rol): JsonResponse
    {
        $datos = $request->validate([
            'name'       => ['required', 'string', 'max:100', "unique:roles,name,{$rol->id}"],
            'permisos'   => ['array'],
            'permisos.*' => ['integer', 'exists:permissions,id'],
        ]);

        DB::transaction(function () use ($rol, $datos) {
            $rol->update(['name' => $datos['name']]);
            $permisos = Permission::whereIn('id', $datos['permisos'] ?? [])->get();
            $rol->syncPermissions($permisos);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json($rol->loadCount('permissions', 'users'));
    }

    public function permisosDelRol(Role $rol): JsonResponse
    {
        return response()->json($rol->permissions()->pluck('id'));
    }

    public function destroy(Role $rol): JsonResponse
    {
        if ($rol->name === 'superadmin') {
            return response()->json(['message' => 'El rol superadmin no se puede eliminar.'], 422);
        }

        DB::transaction(fn () => $rol->delete());

        return response()->json(null, 204);
    }

    public function permisosJerarquia(): JsonResponse
    {
        $menus = Menu::with([
            'permisos' => fn ($q) => $q->where('permissions_group', Permission::GRUPO_MENU)
                                       ->where('permission_status', 1),
            'submenus' => fn ($q) => $q->orderBy('submenu_orden'),
            'submenus.permisos' => fn ($q) => $q->whereIn('permissions_group', [
                Permission::GRUPO_SUBMENU,
                Permission::GRUPO_ACCIONES,
            ])->where('permission_status', 1),
        ])->orderBy('menu_orden')->get();

        $jerarquia = $menus->map(fn ($menu) => [
            'menu'     => $menu->only(['id', 'menu_nombre', 'menu_funcion', 'menu_icono']),
            'acceso'   => $menu->permisos->first()?->only(['id', 'name']),
            'submenus' => $menu->submenus->map(fn ($sub) => [
                'submenu'  => $sub->only(['id', 'submenu_nombre', 'submenu_funcion']),
                'acceso'   => $sub->permisos->firstWhere('permissions_group', Permission::GRUPO_SUBMENU)?->only(['id', 'name']),
                'acciones' => $sub->permisos
                    ->where('permissions_group', Permission::GRUPO_ACCIONES)
                    ->values()
                    ->map(fn ($p) => $p->only(['id', 'name'])),
            ]),
        ]);

        return response()->json($jerarquia);
    }
}
