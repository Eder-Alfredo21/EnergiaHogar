<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function __construct(protected MenuService $menuService) {}

    public function index(Request $request): JsonResponse
    {
        $buscar    = $request->get('buscar', '');
        $ordenar   = $request->get('ordenar', 'menu_orden');
        $direccion = $request->get('direccion', 'asc');
        $porPagina = min((int) $request->get('por_pagina', 10), 50);

        $permitidas = ['menu_nombre', 'menu_funcion', 'menu_orden', 'menu_estado'];
        $ordenar    = in_array($ordenar, $permitidas) ? $ordenar : 'menu_orden';

        $menus = Menu::withCount('submenus')
            ->when($buscar, fn ($q) =>
                $q->where(fn ($q2) =>
                    $q2->where('menu_nombre', 'like', "%{$buscar}%")
                       ->orWhere('menu_funcion', 'like', "%{$buscar}%")
                )
            )
            ->orderBy($ordenar, $direccion === 'desc' ? 'desc' : 'asc')
            ->paginate($porPagina);

        return response()->json($menus);
    }

    public function show(Menu $menu): JsonResponse
    {
        return response()->json($menu->loadCount('submenus'));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'menu_nombre'  => ['required', 'string', 'max:100'],
            'menu_funcion' => ['required', 'string', 'max:100', 'regex:/^[a-z][a-z0-9_]*$/'],
            'menu_orden'   => ['required', 'integer', 'min:1'],
            'menu_icono'   => ['required', 'string', 'max:100'],
            'menu_mostrar' => ['boolean'],
        ]);

        $datos['menu_estado'] = 1;
        $datos['menu_mostrar'] = $datos['menu_mostrar'] ?? true;

        $menu = $this->menuService->crear($datos);

        return response()->json($menu->loadCount('submenus'), 201);
    }

    public function update(Request $request, Menu $menu): JsonResponse
    {
        $datos = $request->validate([
            'menu_nombre'  => ['required', 'string', 'max:100'],
            'menu_funcion' => ['required', 'string', 'max:100', "unique:menus,menu_funcion,{$menu->id}", 'regex:/^[a-z][a-z0-9_]*$/'],
            'menu_orden'   => ['required', 'integer', 'min:1'],
            'menu_icono'   => ['required', 'string', 'max:100'],
            'menu_mostrar' => ['boolean'],
        ]);

        $menu = $this->menuService->actualizar($menu, $datos);

        return response()->json($menu->loadCount('submenus'));
    }

    public function cambiarEstado(Menu $menu): JsonResponse
    {
        $menu = $this->menuService->cambiarEstado($menu);

        return response()->json($menu->loadCount('submenus'));
    }

    public function destroy(Menu $menu): JsonResponse
    {
        $this->menuService->eliminar($menu);

        return response()->json(null, 204);
    }
}
