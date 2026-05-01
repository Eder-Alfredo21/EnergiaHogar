<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Submenu;
use Illuminate\Database\Seeder;

class MenusBaseSeeder extends Seeder
{
    public function run(): void
    {
        // Los observers (MenuObserver, SubmenuObserver, PermissionObserver) se encargan
        // automáticamente de crear los permisos y asignarlos al rol superadmin.

        $menu = Menu::firstOrCreate(
            ['menu_funcion' => 'configuracion'],
            [
                'menu_nombre'  => 'Configuración',
                'menu_orden'   => 1,
                'menu_icono'   => 'fa-solid fa-bars',
                'menu_mostrar' => 1,
                'menu_estado'  => 1,
            ]
        );

        Submenu::firstOrCreate(
            ['submenu_funcion' => 'menus'],
            [
                'menu_id'         => $menu->id,
                'submenu_nombre'  => 'Menus',
                'submenu_orden'   => 1,
                'submenu_mostrar' => 1,
                'submenu_estado'  => 1,
            ]
        );

        Submenu::firstOrCreate(
            ['submenu_funcion' => 'submenus'],
            [
                'menu_id'         => $menu->id,
                'submenu_nombre'  => 'Submenus',
                'submenu_orden'   => 2,
                'submenu_mostrar' => 0,
                'submenu_estado'  => 1,
            ]
        );

        Submenu::firstOrCreate(
            ['submenu_funcion' => 'roles'],
            [
                'menu_id'         => $menu->id,
                'submenu_nombre'  => 'Roles',
                'submenu_orden'   => 3,
                'submenu_mostrar' => 1,
                'submenu_estado'  => 1,
            ]
        );

        Submenu::firstOrCreate(
            ['submenu_funcion' => 'usuario'],
            [
                'menu_id'         => $menu->id,
                'submenu_nombre'  => 'Usuarios',
                'submenu_orden'   => 4,
                'submenu_mostrar' => 1,
                'submenu_estado'  => 1,
            ]
        );

        $this->command->info("✅ Menú base '{$menu->menu_nombre}' y submenús creados.");
    }
}
