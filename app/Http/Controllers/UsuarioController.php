<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsuarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar    = $request->get('buscar', '');
        $ordenar   = $request->get('ordenar', 'name');
        $direccion = $request->get('direccion', 'asc');
        $porPagina = min((int) $request->get('por_pagina', 10), 50);

        $permitidas = ['name', 'username', 'email', 'created_at'];
        $ordenar    = in_array($ordenar, $permitidas) ? $ordenar : 'name';

        $usuarios = User::with('roles:id,name')
            ->when($buscar, fn ($q) =>
                $q->where(fn ($q2) =>
                    $q2->where('name', 'like', "%{$buscar}%")
                       ->orWhere('username', 'like', "%{$buscar}%")
                       ->orWhere('email', 'like', "%{$buscar}%")
                )
            )
            ->orderBy($ordenar, $direccion === 'desc' ? 'desc' : 'asc')
            ->paginate($porPagina);

        return response()->json($usuarios);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username', 'regex:/^[a-zA-Z0-9_]+$/'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'rol_id'   => ['required', 'exists:roles,id'],
        ]);

        $usuario = User::create([
            'name'     => $datos['name'],
            'username' => $datos['username'],
            'email'    => $datos['email'],
            'password' => Hash::make($datos['password']),
        ]);

        $usuario->assignRole(Role::findById($datos['rol_id']));

        return response()->json($usuario->load('roles:id,name'), 201);
    }

    public function update(Request $request, User $usuario): JsonResponse
    {
        $datos = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', "unique:users,username,{$usuario->id}", 'regex:/^[a-zA-Z0-9_]+$/'],
            'email'    => ['required', 'email', "unique:users,email,{$usuario->id}"],
            'password' => ['nullable', 'string', 'min:8'],
            'rol_id'   => ['required', 'exists:roles,id'],
        ]);

        $actualizar = [
            'name'     => $datos['name'],
            'username' => $datos['username'],
            'email'    => $datos['email'],
        ];

        if (!empty($datos['password'])) {
            $actualizar['password'] = Hash::make($datos['password']);
        }

        $usuario->update($actualizar);
        $usuario->syncRoles([Role::findById($datos['rol_id'])]);

        return response()->json($usuario->load('roles:id,name'));
    }

    public function destroy(Request $request, User $usuario): JsonResponse
    {
        if ($usuario->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        if ($usuario->hasRole('superadmin') && User::role('superadmin')->count() <= 1) {
            return response()->json(['message' => 'Debe existir al menos un superadmin.'], 422);
        }

        $usuario->delete();

        return response()->json(null, 204);
    }

    public function listarRoles(): JsonResponse
    {
        return response()->json(Role::orderBy('name')->get(['id', 'name']));
    }
}
