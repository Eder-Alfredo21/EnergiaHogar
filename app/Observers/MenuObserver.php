<?php

namespace App\Observers;

use App\Models\Menu;
use App\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class MenuObserver
{
    /**
     * Al crear un menú → generar permiso de acceso.
     */
    public function created(Menu $menu): void
    {
        Permission::create([
            'name'                 => "{$menu->menu_funcion}.acceso",
            'guard_name'           => 'web',
            'menu_id'              => $menu->id,
            'submenu_id'           => null,
            'permissions_group'    => Permission::GRUPO_MENU,
            'permissions_group_id' => $menu->id,
            'permission_status'    => 1,
        ]);

        $this->limpiarCache();
    }

    /**
     * Al actualizar un menú → si cambió menu_funcion, renombrar permisos.
     */
    public function updated(Menu $menu): void
    {
        if (! $menu->wasChanged('menu_funcion')) {
            return;
        }

        $funcionAnterior = $menu->getOriginal('menu_funcion');
        $funcionNueva    = $menu->menu_funcion;

        $menu->permisos()->each(function (Permission $permiso) use ($funcionAnterior, $funcionNueva) {
            // Reemplaza solo el prefijo: ventas.acceso → ventas_admin.acceso
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
     * Al hacer soft delete → desactivar permisos del menú.
     */
    public function deleting(Menu $menu): void
    {
        if ($menu->isForceDeleting()) {
            // Hard delete: eliminar permisos (excepto los de acciones en submenús)
            $menu->permisos()->delete();
            return;
        }

        // Soft delete: solo desactivar
        $menu->permisos()->update(['permission_status' => 0]);
        $this->limpiarCache();
    }

    /**
     * Al restaurar → reactivar permisos.
     */
    public function restored(Menu $menu): void
    {
        $menu->permisos()->update(['permission_status' => 1]);
        $this->limpiarCache();
    }

    private function limpiarCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
