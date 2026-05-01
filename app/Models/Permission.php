<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends SpatiePermission
{
    const GRUPO_MENU     = 1;
    const GRUPO_SUBMENU  = 2;
    const GRUPO_ACCIONES = 3;

    // Sufijos que se generan automáticamente al crear un submenú
    const ACCIONES_AUTOMATICAS = [
        'crear',
        'actualizar',
        'cambiar_estado',
        'eliminar',
    ];

    protected $fillable = [
        'name',
        'guard_name',
        'menu_id',
        'submenu_id',
        'permissions_group',
        'permissions_group_id',
        'permission_status',
    ];

    protected $casts = [
        'permissions_group'    => 'integer',
        'permissions_group_id' => 'integer',
        'permission_status'    => 'integer',
    ];

    // ─── Relaciones ──────────────────────────────────────────────

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function submenu(): BelongsTo
    {
        return $this->belongsTo(Submenu::class, 'submenu_id');
    }

    // ─── Lógica de negocio ───────────────────────────────────────

    /**
     * Los permisos del grupo 3 (acciones automáticas) no se pueden eliminar.
     */
    public function esEliminable(): bool
    {
        return $this->permissions_group !== self::GRUPO_ACCIONES;
    }

    /**
     * Indica si el permiso fue generado automáticamente por el sistema.
     */
    public function esAutomatico(): bool
    {
        return in_array($this->permissions_group, [
            self::GRUPO_MENU,
            self::GRUPO_SUBMENU,
            self::GRUPO_ACCIONES,
        ]);
    }

    public function estaActivo(): bool
    {
        return $this->permission_status === 1;
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopeActivos($query)
    {
        return $query->where('permission_status', 1);
    }

    public function scopeDeMenu($query)
    {
        return $query->where('permissions_group', self::GRUPO_MENU);
    }

    public function scopeDeSubmenu($query)
    {
        return $query->where('permissions_group', self::GRUPO_SUBMENU);
    }

    public function scopeAcciones($query)
    {
        return $query->where('permissions_group', self::GRUPO_ACCIONES);
    }
}
