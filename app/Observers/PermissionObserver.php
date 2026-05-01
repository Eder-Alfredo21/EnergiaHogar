<?php

namespace App\Observers;

use App\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionObserver
{
    /**
     * Cada vez que se crea un permiso, lo asigna automáticamente al rol superadmin.
     */
    public function created(Permission $permiso): void
    {
        $rol = Role::where('name', 'superadmin')->where('guard_name', 'web')->first();

        if (! $rol) {
            return;
        }

        // Adjuntar directamente en la tabla pivot (evita recargar todos los permisos)
        if (! $rol->permissions()->where('id', $permiso->id)->exists()) {
            $rol->permissions()->attach($permiso->id);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
