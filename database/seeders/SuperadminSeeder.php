<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear rol superadmin
        $rol = Role::firstOrCreate(
            ['name' => 'superadmin', 'guard_name' => 'web']
        );

        // 2. Asignar TODOS los permisos existentes al rol
        $todosLosPermisos = Permission::all();
        if ($todosLosPermisos->isNotEmpty()) {
            $rol->syncPermissions($todosLosPermisos);
        }

        // 3. Crear usuario superadmin
        $usuario = User::firstOrCreate(
            ['email' => 'reynaalfredo421@gmail.com'],
            [
                'name'     => 'Eder Alfredo',
                'username' => 'superadmin',
                'password' => Hash::make('12345678'),
            ]
        );

        // 4. Asignar rol al usuario
        if (! $usuario->hasRole('superadmin')) {
            $usuario->assignRole($rol);
        }

        $this->command->info("✅ Superadmin creado: {$usuario->email}");
        $this->command->info("✅ Permisos asignados al rol: {$todosLosPermisos->count()}");
    }
}
