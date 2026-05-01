<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Submenu extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'menu_id',
        'submenu_nombre',
        'submenu_funcion',
        'submenu_orden',
        'submenu_mostrar',
        'submenu_estado',
    ];

    protected $casts = [
        'submenu_mostrar' => 'boolean',
        'submenu_estado'  => 'integer',
        'submenu_orden'   => 'integer',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function permisos(): HasMany
    {
        return $this->hasMany(Permission::class, 'submenu_id');
    }

    public function permisosAcciones(): HasMany
    {
        return $this->hasMany(Permission::class, 'permissions_group_id')
            ->where('permissions_group', Permission::GRUPO_ACCIONES);
    }

    public function todosLosPermisos(): HasMany
    {
        // Acceso del submenú + acciones automáticas
        return $this->hasMany(Permission::class, 'submenu_id');
    }

    public function estaActivo(): bool
    {
        return $this->submenu_estado === 1;
    }
}
