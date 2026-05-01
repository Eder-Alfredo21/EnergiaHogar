# Sistema de Permisos y Roles — EnergíaHogar

Documentación del sistema RBAC (Role-Based Access Control) basado en Spatie Laravel Permission v6 con extensiones propias.

---

## Arquitectura general

```
Menú creado
    → MenuObserver::created()
        → Permission::create({ name: '{funcion}.acceso', grupo: 1 })
            → PermissionObserver::created()
                → superadmin_role->permissions()->attach(permiso)

Submenú creado
    → SubmenuObserver::created()
        → Permission::create({ name: '{funcion}.acceso', grupo: 2 })
        → Permission::create({ name: '{funcion}.crear', grupo: 3 })
        → Permission::create({ name: '{funcion}.actualizar', grupo: 3 })
        → Permission::create({ name: '{funcion}.cambiar_estado', grupo: 3 })
        → Permission::create({ name: '{funcion}.eliminar', grupo: 3 })
            → PermissionObserver::created() × 5
                → superadmin_role->permissions()->attach(permiso) × 5
```

---

## Grupos de permisos

Definidos como constantes en `app/Models/Permission.php`:

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `GRUPO_MENU` | `1` | Permiso de acceso al menú principal |
| `GRUPO_SUBMENU` | `2` | Permiso de acceso al submenú |
| `GRUPO_ACCIONES` | `3` | Permisos de acción sobre el módulo |

---

## Convención de nombres de permisos

```
{funcion_del_menu_o_submenu}.{accion}
```

Ejemplos:
```
usuarios.acceso          → puede ver el módulo Usuarios
usuarios.crear           → puede crear nuevos usuarios
usuarios.actualizar      → puede editar usuarios
usuarios.cambiar_estado  → puede activar/desactivar usuarios
usuarios.eliminar        → puede eliminar usuarios

dashboard.acceso         → puede ver el Dashboard
roles.acceso             → puede ver el módulo Roles
```

Las **acciones automáticas** están definidas en `Permission::ACCIONES_AUTOMATICAS`:
```php
['crear', 'actualizar', 'cambiar_estado', 'eliminar']
```

---

## Ciclo de vida de permisos

### Al crear un Menú

`MenuObserver::created()` genera:
```
{menu_funcion}.acceso  (grupo=1, menu_id=menu->id)
```

### Al crear un Submenú

`SubmenuObserver::created()` genera:
```
{submenu_funcion}.acceso     (grupo=2, submenu_id=submenu->id)
{submenu_funcion}.crear      (grupo=3, submenu_id=submenu->id)
{submenu_funcion}.actualizar (grupo=3, submenu_id=submenu->id)
{submenu_funcion}.cambiar_estado (grupo=3, submenu_id=submenu->id)
{submenu_funcion}.eliminar   (grupo=3, submenu_id=submenu->id)
```

### Al renombrar la función de un Menú

`MenuObserver::updated()` si cambió `menu_funcion`:
```
// Antes: dashboard.acceso
// Después: panel.acceso

// Usa regex: preg_replace('/^dashboard\./', 'panel.', $permiso->name)
```

### Al renombrar la función de un Submenú

`SubmenuObserver::updated()` renombra todos los permisos (acceso + acciones).

### Al eliminar (soft delete)

- Permisos asociados pasan a `permission_status = 0`
- Los usuarios conservan el registro pero el permiso está inactivo

### Al forzar eliminación

- Los permisos se eliminan permanentemente

### Al restaurar

- Los permisos vuelven a `permission_status = 1`

---

## Asignación automática al superadmin

`PermissionObserver::created()` se ejecuta cada vez que se crea un permiso:

```php
public function created(Permission $permiso): void
{
    $rol = Role::where('name', 'superadmin')->first();
    if ($rol) {
        $rol->permissions()->attach($permiso->id);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
```

Esto garantiza que el rol `superadmin` siempre tiene todos los permisos, incluso los creados en el futuro.

---

## Rol superadmin

El rol `superadmin` tiene comportamiento especial en el frontend:

```js
// useAuth.js
const tienePermiso = (permiso) => {
    if (!usuario) return false;
    if (usuario.rol === 'superadmin') return true;  // bypasa checks
    return usuario.permisos.includes(permiso);
};
```

Y en el backend la verificación de permisos con Spatie también retorna `true` para el rol superadmin gracias a `syncPermissions(Permission::all())` en el seeder.

---

## Modelo Permission extendido

`app/Models/Permission.php` extiende `Spatie\Permission\Models\Permission`:

```php
// Scopes disponibles
Permission::activos()    // permission_status = 1
Permission::deMenu()     // permissions_group = 1
Permission::deSubmenu()  // permissions_group = 2
Permission::acciones()   // permissions_group = 3

// Métodos de instancia
$permiso->esEliminable()   // false si es GRUPO_ACCIONES automático
$permiso->esAutomatico()   // true si el sufijo está en ACCIONES_AUTOMATICAS
$permiso->estaActivo()     // permission_status === 1
```

---

## Services: operaciones atómicas

Todas las operaciones van en `DB::transaction()`.

### MenuService

```php
$menuService->crear([
    'menu_nombre'   => 'Clientes',
    'menu_funcion'  => 'clientes',
    'menu_orden'    => 5,
    'menu_icono'    => 'fa-users',
]);
// → Observer crea permiso clientes.acceso automáticamente

$menuService->cambiarEstado($menu);
// → menu_estado 1↔0

$menuService->eliminar($menu);
// → Soft delete del menú + soft delete en cascada de sus submenús

$menuService->restaurar($menuId);
// → Restore del menú
```

### SubmenuService

```php
$submenuService->crear([
    'menu_id'          => 1,
    'submenu_nombre'   => 'Listado',
    'submenu_funcion'  => 'clientes.listado',
    'submenu_orden'    => 1,
]);
// → Observer crea 5 permisos automáticamente

$submenuService->crearPermisoPersonalizado($submenu, 'exportar');
// → Crea clientes.listado.exportar (grupo=3)

$submenuService->eliminarPermiso($permiso);
// → Solo si $permiso->esEliminable() es true
```

---

## Verificación de permisos en el frontend

```jsx
// Hook
const { tienePermiso } = useAuth();

// En un componente
{tienePermiso('usuarios.crear') && (
    <Button onClick={abrirModal}>Nuevo usuario</Button>
)}

// En el sidebar (menus.js)
{ id: 'usuarios', ruta: '/usuarios', permiso: 'usuarios.acceso' }
// El sidebar filtra los items que el usuario no tiene permiso de ver
```

---

## Verificación de permisos en el backend

```php
// En controlador — middleware
Route::middleware(['auth', 'can:usuarios.crear'])->post('/api/usuarios', ...);

// O inline
public function store(Request $request)
{
    $this->authorize('usuarios.crear');
    // ...
}

// O en el gate
if (auth()->user()->can('usuarios.crear')) { ... }
```

---

## Datos del usuario en sesión

El endpoint `/api/me` retorna:

```json
{
    "id": 1,
    "name": "Eder Alfredo",
    "username": "superadmin",
    "email": "reynaalfredo421@gmail.com",
    "rol": "superadmin",
    "permisos": [
        "usuarios.acceso",
        "usuarios.crear",
        "usuarios.actualizar",
        "usuarios.cambiar_estado",
        "usuarios.eliminar",
        "..."
    ]
}
```

El array `permisos` contiene todos los permisos planos del usuario. El frontend los verifica con `usuario.permisos.includes(permiso)`.

---

## Caché de permisos

Spatie cachea los permisos por 24 horas. Después de cambios masivos:

```bash
php artisan permission:cache-reset
```

Los observers llaman internamente a:
```php
app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
```

---

## Tabla de referencia rápida

| Acción | Efecto en permisos |
|--------|--------------------|
| Crear Menú | +1 permiso `.acceso` (grupo 1) |
| Crear Submenú | +5 permisos: `.acceso` + 4 acciones (grupos 2 y 3) |
| Renombrar función Menú | Renombra permisos existentes (regex) |
| Renombrar función Submenú | Renombra todos sus permisos |
| Soft delete Menú | Desactiva permisos (status=0) |
| Restore Menú | Reactiva permisos (status=1) |
| Force delete Menú | Elimina permisos permanentemente |
| Cualquier permiso creado | Se asigna automáticamente a superadmin |
