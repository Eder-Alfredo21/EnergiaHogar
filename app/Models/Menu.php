<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'menu_nombre',
        'menu_funcion',
        'menu_orden',
        'menu_icono',
        'menu_mostrar',
        'menu_estado',
    ];

    protected $casts = [
        'menu_mostrar' => 'boolean',
        'menu_estado'  => 'integer',
        'menu_orden'   => 'integer',
    ];

    public function submenus(): HasMany
    {
        return $this->hasMany(Submenu::class, 'menu_id')->orderBy('submenu_orden');
    }

    public function permisos(): HasMany
    {
        return $this->hasMany(Permission::class, 'menu_id');
    }

    public function permisoAcceso(): ?Permission
    {
        return $this->permisos()
            ->where('permissions_group', Permission::GRUPO_MENU)
            ->first();
    }

    public function estaActivo(): bool
    {
        return $this->menu_estado === 1;
    }
}
