<?php

namespace App\Observers;

use App\Models\Permission;
use App\Models\Submenu;
use Spatie\Permission\PermissionRegistrar;

class SubmenuObserver
{
    /**
     * Al crear un submenú → generar permiso de acceso + 4 acciones automáticas.
     */
    public function created(Submenu $submenu): void
    {
        // 1. Permiso de acceso (grupo 2 - Submenú)
        Permission::create([
            'name'                 => "{$submenu->submenu_funcion}.acceso",
            'guard_name'           => 'web',
            'menu_id'              => $submenu->menu_id,
            'submenu_id'           => $submenu->id,
            'permissions_group'    => Permission::GRUPO_SUBMENU,
            'permissions_group_id' => $submenu->id,
            'permission_status'    => 1,
        ]);

        // 2. Cuatro acciones automáticas (grupo 3 - Acciones)
        foreach (Permission::ACCIONES_AUTOMATICAS as $accion) {
            Permission::create([
                'name'                 => "{$submenu->submenu_funcion}.{$accion}",
                'guard_name'           => 'web',
                'menu_id'              => $submenu->menu_id,
                'submenu_id'           => $submenu->id,
                'permissions_group'    => Permission::GRUPO_ACCIONES,
                'permissions_group_id' => $submenu->id,
                'permission_status'    => 1,
            ]);
        }

        $this->limpiarCache();
    }

    /**
     * Al actualizar → si cambió submenu_funcion, renombrar TODOS los permisos relacionados.
     */
    public function updated(Submenu $submenu): void
    {
        if (! $submenu->wasChanged('submenu_funcion')) {
            return;
        }

        $funcionAnterior = $submenu->getOriginal('submenu_funcion');
        $funcionNueva    = $submenu->submenu_funcion;

        // Obtener todos los permisos: acceso (submenu_id) + acciones (permissions_group_id)
        $permisosAcceso   = $submenu->permisos()->get();
        $permisosAcciones = $submenu->permisosAcciones()->get();

        $todos = $permisosAcceso->merge($permisosAcciones);

        $todos->each(function (Permission $permiso) use ($funcionAnterior, $funcionNueva) {
            $nuevoNombre = preg_replace(
                '/^' . preg_quote($funcionAnterior, '/') . '\./',
                "{$funcionNueva}.",
                $permiso->name
            );

            $permiso->update(['name' => $nuevoNombre]);
        });

        $this->limpiarCache();
    }

    /**
     * Al hacer soft delete → desactivar todos los permisos del submenú.
     */
    public function deleting(Submenu $submenu): void
    {
        if ($submenu->isForceDeleting()) {
            // Hard delete: eliminar acceso, dejar acciones (no eliminables) o eliminarlas también
            $submenu->permisos()->delete();
            $submenu->permisosAcciones()->delete();
            return;
        }

        // Soft delete: desactivar todos
        $submenu->permisos()->update(['permission_status' => 0]);
        $submenu->permisosAcciones()->update(['permission_status' => 0]);
        $this->limpiarCache();
    }

    /**
     * Al restaurar → reactivar todos los permisos.
     */
    public function restored(Submenu $submenu): void
    {
        $submenu->permisos()->update(['permission_status' => 1]);
        $submenu->permisosAcciones()->update(['permission_status' => 1]);
        $this->limpiarCache();
    }

    private function limpiarCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
