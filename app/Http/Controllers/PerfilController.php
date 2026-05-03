<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $usuario = $request->user()->load('roles');

        return response()->json([
            'id'       => $usuario->id,
            'name'     => $usuario->name,
            'username' => $usuario->username,
            'email'    => $usuario->email,
            'rol'      => $usuario->getRoleNames()->first() ?? 'Sin rol',
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users')->ignore($usuario->id)],
            'email'    => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($usuario->id)],
        ]);

        $usuario->update($request->only('name', 'username', 'email'));

        return response()->json(['message' => 'Perfil actualizado.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $usuario = $request->user();

        if (!Hash::check($request->current_password, $usuario->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $usuario->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Contraseña actualizada.']);
    }

    public function destroy(Request $request): Response
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $usuario = $request->user();

        if (!Hash::check($request->password, $usuario->password)) {
            throw ValidationException::withMessages([
                'password' => ['Contraseña incorrecta.'],
            ]);
        }

        if ($usuario->hasRole('superadmin') && User::role('superadmin')->count() <= 1) {
            throw ValidationException::withMessages([
                'password' => ['No puedes eliminar la única cuenta superadmin.'],
            ]);
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $usuario->delete();

        return response()->noContent();
    }
}
