# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de desarrollo

```bash
# Instalar dependencias
composer install
npm install

# Desarrollo (ejecuta Vite + Laravel en paralelo)
npm run dev

# Build para producción
npm run build

# Servidor solo backend
php artisan serve

# Migraciones y seeders
php artisan migrate
php artisan db:seed --class=SuperadminSeeder

# Tests
php artisan test
php artisan test --filter NombreTest

# Formateo de código PHP
./vendor/bin/pint
```

## Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Auth**: Laravel Fortify (sesiones en DB, login por email o username)
- **RBAC**: Spatie Laravel Permission (extendido con observadores)
- **Frontend**: React 19 + React Router 7 (SPA), Tailwind CSS 4, Framer Motion, Axios
- **Build**: Vite 8

## Arquitectura SPA

Laravel sirve una única vista Blade (`spa.blade.php`). React Router maneja toda la navegación del cliente. El backend expone:

- `GET /api/me` → datos del usuario autenticado (id, name, username, email, rol, permisos[])
- `POST /login`, `POST /logout` → Fortify
- Rutas de restablecimiento de contraseña (`/forgot-password`, `/reset-password/{token}`) → misma SPA

Todo el código React vive en `resources/js/`:
- `app.jsx` → raíz con BrowserRouter, verificación de sesión, modo oscuro
- `hooks/useAuth.js` → estado de autenticación global (`verificarSesion`, `login`, `logout`, `tienePermiso`)
- `routes/index.jsx` → rutas lazy-loaded con guardas de autenticación
- `pages/` → páginas por módulo
- `components/` → `layout/` (Sidebar, Topbar, Breadcrumb) y `ui/` (componentes reutilizables)

## Sistema de permisos (Spatie + Observadores)

Los permisos se generan automáticamente al crear Menus/Submenus vía observadores:

| Evento | Permisos generados |
|--------|-------------------|
| Crear Menu | `{menu_funcion}.acceso` |
| Crear Submenu | `{submenu_funcion}.acceso` + 4 de acción: `.crear`, `.actualizar`, `.cambiar_estado`, `.eliminar` |
| Cualquier permiso nuevo | Auto-asignado al rol `superadmin` vía `PermissionObserver` |

**Grupos de permisos** (constantes en `Permission.php`):
- `GRUPO_MENU = 1` — acceso a menú
- `GRUPO_SUBMENU = 2` — acceso a submenú
- `GRUPO_ACCIONES = 3` — acciones CRUD

Toda la lógica de sincronización está en `app/Observers/`. Los servicios (`app/Services/MenuService.php`, `SubmenuService.php`) envuelven las operaciones CRUD en `DB::transaction()`.

## Base de datos

Tablas principales:
- `users` — incluye `username` (único, alternativa al email para login)
- `menus` / `submenus` — soft delete, columnas en español (`menu_nombre`, `submenu_funcion`, etc.)
- `permissions` — extendida con `menu_id`, `submenu_id`, `permissions_group`, `permissions_group_id`, `permission_status`
- Tablas Spatie: `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions`

Las sesiones, caché y colas usan driver `database`.

## Convenciones del proyecto

- Nombres de columnas de tablas propias en español (`menu_nombre`, `submenu_estado`, etc.)
- Métodos y variables en camelCase español (`permisoAcceso()`, `estaActivo()`, `crearPermisoPersonalizado()`)
- Usar Eloquent; evitar `DB::` salvo queries complejas
- Nunca usar cast `(array)` — usar `->toArray()`
- Frontend: modo oscuro via variables CSS (`--color-bg`, etc.) en `resources/css/app.css`

## Documentación interna

- `docs/diseño-web.md` — sistema de diseño (colores, tipografía, componentes UI)
- `docs/permisos-roles.md` — ciclo de vida de permisos, observadores
- `docs/flujo-spa.md` — arquitectura SPA, comunicación Laravel↔React
- `docs/estructura-archivos.md` — convenciones de organización de archivos
- `docs/patron-tablas.md` — patrón estándar para tablas CRUD (toolbar, columna #, ordenamiento, paginación)