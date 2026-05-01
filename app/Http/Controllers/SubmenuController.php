<?php

namespace App\Http\Controllers;

use App\Models\Submenu;
use App\Services\SubmenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmenuController extends Controller
{
    public function __construct(protected SubmenuService $submenuService) {}

    public function index(Request $request): JsonResponse
    {
        $buscar    = $request->get('buscar', '');
        $menuId    = $request->get('menu_id');
        $ordenar   = $request->get('ordenar', 'submenu_orden');
        $direccion = $request->get('direccion', 'asc');
        $porPagina = min((int) $request->get('por_pagina', 10), 50);

        $permitidas = ['submenu_nombre', 'submenu_funcion', 'submenu_orden', 'submenu_estado'];
        $ordenar    = in_array($ordenar, $permitidas) ? $ordenar : 'submenu_orden';

        $submenus = Submenu::with('menu:id,menu_nombre,menu_funcion')
            ->when($menuId, fn ($q) => $q->where('menu_id', $menuId))
            ->when($buscar, fn ($q) =>
                $q->where(fn ($q2) =>
                    $q2->where('submenu_nombre', 'like', "%{$buscar}%")
                       ->orWhere('submenu_funcion', 'like', "%{$buscar}%")
                )
            )
            ->orderBy($ordenar, $direccion === 'desc' ? 'desc' : 'asc')
            ->paginate($porPagina);

        return response()->json($submenus);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'menu_id'         => ['required', 'exists:menus,id'],
            'submenu_nombre'  => ['required', 'string', 'max:100'],
            'submenu_funcion' => ['required', 'string', 'max:100', 'regex:/^[a-z][a-z0-9_]*$/'],
            'submenu_orden'   => ['required', 'integer', 'min:1'],
            'submenu_mostrar' => ['boolean'],
        ]);

        $datos['submenu_estado'] = 1;
        $datos['submenu_mostrar'] = $datos['submenu_mostrar'] ?? true;

        $submenu = $this->submenuService->crear($datos);

        return response()->json($submenu->load('menu:id,menu_nombre,menu_funcion'), 201);
    }

    public function update(Request $request, Submenu $submenu): JsonResponse
    {
        $datos = $request->validate([
            'submenu_nombre'  => ['required', 'string', 'max:100'],
            'submenu_funcion' => ['required', 'string', 'max:100', "unique:submenus,submenu_funcion,{$submenu->id}", 'regex:/^[a-z][a-z0-9_]*$/'],
            'submenu_orden'   => ['required', 'integer', 'min:1'],
            'submenu_mostrar' => ['boolean'],
        ]);

        $submenu = $this->submenuService->actualizar($submenu, $datos);

        return response()->json($submenu->load('menu:id,menu_nombre,menu_funcion'));
    }

    public function cambiarEstado(Submenu $submenu): JsonResponse
    {
        $submenu = $this->submenuService->cambiarEstado($submenu);

        return response()->json($submenu->load('menu:id,menu_nombre,menu_funcion'));
    }

    public function destroy(Submenu $submenu): JsonResponse
    {
        $this->submenuService->eliminar($submenu);

        return response()->json(null, 204);
    }
}
