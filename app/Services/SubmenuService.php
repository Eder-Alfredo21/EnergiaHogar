<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Submenu;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubmenuService
{
    /**
     * Crear un submenú. El Observer genera acceso + 4 acciones automáticamente.
     *
     * @throws ValidationException
     */
    public function crear(array $datos): Submenu
    {
        $this->validarFuncionUnica($datos['submenu_funcion']);

        return DB::transaction(function () use ($datos) {
            return Submenu::create($datos);
            // SubmenuObserver::created() → crea {funcion}.acceso + 4 acciones
        });
    }

    /**
     * Actualizar un submenú. El Observer renombra permisos si cambió submenu_funcion.
     *
     * @throws ValidationException
     */
    public function actualizar(Submenu $submenu, array $datos): Submenu
    {
        if (isset($datos['submenu_funcion']) && $datos['submenu_funcion'] !== $submenu->submenu_funcion) {
            $this->validarFuncionUnica($datos['submenu_funcion'], $submenu->id);
        }

        return DB::transaction(function () use ($submenu, $datos) {
            $submenu->update($datos);
            // SubmenuObserver::updated() → renombra permisos
            return $submenu->fresh();
        });
    }

    /**
     * Cambiar estado activo/inactivo.
     */
    public function cambiarEstado(Submenu $submenu): Submenu
    {
        return DB::transaction(function () use ($submenu) {
            $submenu->update([
                'submenu_estado' => $submenu->submenu_estado === 1 ? 0 : 1,
            ]);

            return $submenu->fresh();
        });
    }

    /**
     * Soft delete del submenú y desactivar sus permisos.
     * El Observer::deleting() gestiona los permisos.
     */
    public function eliminar(Submenu $submenu): void
    {
        DB::transaction(function () use ($submenu) {
            $submenu->delete();
            // SubmenuObserver::deleting() → desactiva permisos
        });
    }

    /**
     * Restaurar un submenú eliminado (soft delete).
     */
    public function restaurar(int $id): Submenu
    {
        return DB::transaction(function () use ($id) {
            $submenu = Submenu::withTrashed()->findOrFail($id);
            $submenu->restore();
            // SubmenuObserver::restored() → reactiva permisos
            return $submenu;
        });
    }

    /**
     * Crear un permiso personalizado para un submenú.
     *
     * @throws ValidationException
     */
    public function crearPermisoPersonalizado(Submenu $submenu, string $sufijo): Permission
    {
        $nombre = "{$submenu->submenu_funcion}.{$sufijo}";

        if (Permission::where('name', $nombre)->where('guard_name', 'web')->exists()) {
            throw ValidationException::withMessages([
                'nombre' => "El permiso '{$nombre}' ya existe.",
            ]);
        }

        return DB::transaction(function () use ($submenu, $nombre) {
            return Permission::create([
                'name'                 => $nombre,
                'guard_name'           => 'web',
                'menu_id'              => $submenu->menu_id,
                'submenu_id'           => $submenu->id,
                'permissions_group'    => Permission::GRUPO_ACCIONES,
                'permissions_group_id' => $submenu->id,
                'permission_status'    => 1,
            ]);
        });
    }

    /**
     * Eliminar un permiso (solo si es eliminable — no es del grupo acciones automáticas).
     *
     * @throws ValidationException
     */
    public function eliminarPermiso(Permission $permiso): void
    {
        if (! $permiso->esEliminable()) {
            throw ValidationException::withMessages([
                'permiso' => 'Los permisos de acciones automáticas no se pueden eliminar.',
            ]);
        }

        DB::transaction(fn() => $permiso->delete());
    }

    // ─── Privados ────────────────────────────────────────────────

    /**
     * @throws ValidationException
     */
    private function validarFuncionUnica(string $funcion, ?int $excepto = null): void
    {
        $query = Submenu::where('submenu_funcion', $funcion);

        if ($excepto) {
            $query->where('id', '!=', $excepto);
        }

        if ($query->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'submenu_funcion' => "La función '{$funcion}' ya está en uso.",
            ]);
        }
    }
}
