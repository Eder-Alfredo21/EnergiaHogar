<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MenuService
{
    /**
     * Crear un menú. El Observer genera el permiso automáticamente.
     *
     * @throws ValidationException
     */
    public function crear(array $datos): Menu
    {
        $this->validarFuncionUnica($datos['menu_funcion']);

        return DB::transaction(function () use ($datos) {
            return Menu::create($datos);
            // MenuObserver::created() → crea {menu_funcion}.acceso
        });
    }

    /**
     * Actualizar un menú. El Observer renombra permisos si cambió menu_funcion.
     *
     * @throws ValidationException
     */
    public function actualizar(Menu $menu, array $datos): Menu
    {
        if (isset($datos['menu_funcion']) && $datos['menu_funcion'] !== $menu->menu_funcion) {
            $this->validarFuncionUnica($datos['menu_funcion'], $menu->id);
        }

        return DB::transaction(function () use ($menu, $datos) {
            $menu->update($datos);
            // MenuObserver::updated() → renombra permisos si cambió menu_funcion
            return $menu->fresh();
        });
    }

    /**
     * Cambiar estado activo/inactivo.
     */
    public function cambiarEstado(Menu $menu): Menu
    {
        return DB::transaction(function () use ($menu) {
            $menu->update([
                'menu_estado' => $menu->menu_estado === 1 ? 0 : 1,
            ]);

            return $menu->fresh();
        });
    }

    /**
     * Soft delete del menú y desactivar sus permisos.
     * El Observer::deleting() se encarga de los permisos.
     */
    public function eliminar(Menu $menu): void
    {
        DB::transaction(function () use ($menu) {
            // Soft delete en cascada a submenús
            $menu->submenus()->each(fn($sub) => app(SubmenuService::class)->eliminar($sub));
            $menu->delete();
            // MenuObserver::deleting() → desactiva permisos del menú
        });
    }

    /**
     * Restaurar un menú eliminado (soft delete).
     */
    public function restaurar(int $id): Menu
    {
        return DB::transaction(function () use ($id) {
            $menu = Menu::withTrashed()->findOrFail($id);
            $menu->restore();
            // MenuObserver::restored() → reactiva permisos
            return $menu;
        });
    }

    // ─── Privados ────────────────────────────────────────────────

    /**
     * @throws ValidationException
     */
    private function validarFuncionUnica(string $funcion, ?int $excepto = null): void
    {
        $query = Menu::where('menu_funcion', $funcion);

        if ($excepto) {
            $query->where('id', '!=', $excepto);
        }

        if ($query->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'menu_funcion' => "La función '{$funcion}' ya está en uso.",
            ]);
        }
    }
}
