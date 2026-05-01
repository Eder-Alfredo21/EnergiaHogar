# EnergíaHogar — Panel de Administración

Panel de administración SPA para la gestión de usuarios, roles, permisos y menús del sistema EnergíaHogar.

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Laravel | 12.x |
| Autenticación | Laravel Fortify | 1.37 |
| Permisos | Spatie Laravel Permission | 6.25 |
| Frontend | React | 19.x |
| Enrutamiento SPA | React Router | 7.x |
| Estilos | Tailwind CSS | 4.x |
| Animaciones | Framer Motion | 12.x |
| Build tool | Vite | 8.x |
| Base de datos | MySQL | 8.x |
| Servidor local | Laragon | — |

---

## Requisitos previos

- PHP 8.2+
- Composer 2.x
- Node.js 20+ y npm
- MySQL 8.x (Laragon lo incluye)
- Laragon (recomendado en Windows)

---

## Levantar el proyecto

### 1. Clonar e instalar dependencias

```bash
git clone <repo> energiaHogar
cd energiaHogar

composer install
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con los valores del entorno local:

```env
APP_NAME=Laravel
APP_URL=http://energiahogar.test
APP_LOCALE=es

DB_DATABASE=energiahogar
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### 3. Base de datos

```bash
# Crear base de datos en MySQL:
# CREATE DATABASE energiahogar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

php artisan migrate
php artisan db:seed
```

El seeder crea el usuario superadmin:

| Campo | Valor |
|-------|-------|
| Nombre | Eder Alfredo |
| Username | superadmin |
| Email | reynaalfredo421@gmail.com |
| Password | 12345678 |
| Rol | superadmin |

### 4. Levantar servidores

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (assets)
npm run dev
```

Con Laragon configurado con dominio virtual `energiahogar.test`, solo se necesita `npm run dev`.

### 5. Build para producción

```bash
npm run build
php artisan optimize
```

---

## Estructura del proyecto

```
energiaHogar/
│
├── app/
│   ├── Actions/
│   │   └── Fortify/              # Lógica de registro, reset de contraseña, etc.
│   ├── Http/
│   │   └── Controllers/          # Controladores (actualmente vacíos — API via routes/web.php)
│   ├── Models/
│   │   ├── User.php              # Usuario con Spatie HasRoles
│   │   ├── Menu.php              # Menús con SoftDeletes
│   │   ├── Submenu.php           # Submenús con SoftDeletes
│   │   └── Permission.php        # Permiso extendido de Spatie
│   ├── Observers/
│   │   ├── MenuObserver.php      # Auto-genera permisos al crear/editar menú
│   │   ├── SubmenuObserver.php   # Auto-genera permisos al crear/editar submenú
│   │   └── PermissionObserver.php# Auto-asigna permisos nuevos al rol superadmin
│   ├── Providers/
│   │   ├── AppServiceProvider.php# Registra observers
│   │   └── FortifyServiceProvider.php # Login con email O username
│   └── Services/
│       ├── MenuService.php       # CRUD de menús en transacciones
│       └── SubmenuService.php    # CRUD de submenús + permisos personalizados
│
├── database/
│   ├── migrations/               # Ver sección "Migraciones"
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── SuperadminSeeder.php
│
├── lang/
│   └── es/
│       ├── auth.php              # Mensajes de autenticación en español
│       ├── passwords.php         # Mensajes de reset de contraseña en español
│       └── validation.php        # Mensajes de validación en español
│
├── resources/
│   ├── css/
│   │   └── app.css               # Tailwind 4 + tokens de diseño + dark mode
│   ├── js/
│   │   ├── app.jsx               # Punto de entrada — BrowserRouter + verificación sesión
│   │   ├── bootstrap.js          # Axios: CSRF, credentials, headers
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Topbar, Breadcrumb
│   │   │   └── ui/               # Button, Badge, Input, Modal, Table, Dropdown, Alert, Checkbox
│   │   ├── data/
│   │   │   ├── mockData.js       # Datos simulados para páginas
│   │   │   └── menus.js          # Estructura de navegación del sidebar
│   │   ├── hooks/
│   │   │   ├── useAuth.js        # login, logout, verificarSesion, tienePermiso
│   │   │   └── useDarkMode.js    # Toggle dark mode con persistencia en localStorage
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx   # Sidebar + Topbar + <Outlet />
│   │   │   └── AuthLayout.jsx    # Layout para login y recuperación
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   ├── Roles.jsx
│   │   │   ├── Permisos.jsx
│   │   │   ├── Menus.jsx
│   │   │   └── Submenus.jsx
│   │   └── routes/
│   │       └── index.jsx         # Rutas protegidas por autenticación
│   └── views/
│       └── spa.blade.php         # Única vista Blade — sirve el SPA
│
├── routes/
│   └── web.php                   # Catch-all SPA + rutas nombradas Fortify + /api/me
│
├── config/
│   ├── fortify.php               # SPA mode, campo login, home: /dashboard
│   └── permission.php            # Modelo Permission personalizado
│
├── vite.config.js
├── package.json
└── composer.json
```

---

## Migraciones

Orden de ejecución y descripción:

| Archivo | Tabla(s) | Descripción |
|---------|----------|-------------|
| `0001_01_01_000000_create_users_table` | `users`, `password_reset_tokens`, `sessions` | Usuarios con `username` (unique) |
| `0001_01_01_000001_create_cache_table` | `cache`, `cache_locks` | Cache en DB |
| `0001_01_01_000002_create_jobs_table` | `jobs`, `failed_jobs` | Cola de trabajos |
| `2026_04_28_232824_create_permission_tables` | `permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions` | Tablas Spatie |
| `2026_04_28_232827_add_two_factor_columns_to_users_table` | `users` | 2FA (Fortify) |
| `2026_04_28_232828_create_passkeys_table` | `passkeys` | Passkeys (Fortify) |
| `2026_04_28_233000_create_menus_table` | `menus` | Menús del sistema |
| `2026_04_28_233001_create_submenus_table` | `submenus` | Submenús con FK a menus |
| `2026_04_28_233002_add_columns_to_permissions_table` | `permissions` | Columnas extra (menu_id, submenu_id, grupo, estado) |

### Columnas importantes

**`users`**
```
id, name, username (unique), email (unique), password, remember_token,
email_verified_at, two_factor_secret, two_factor_recovery_codes, timestamps
```

**`menus`**
```
id, menu_nombre, menu_funcion (unique), menu_orden, menu_icono,
menu_mostrar (bool), menu_estado (tinyint 0/1), deleted_at, timestamps
```

**`submenus`**
```
id, menu_id (FK→menus), submenu_nombre, submenu_funcion (unique),
submenu_orden, submenu_mostrar (bool), submenu_estado (tinyint 0/1),
deleted_at, timestamps
```

**`permissions`** (Spatie + columnas extra)
```
id, name, guard_name, menu_id (FK nullable), submenu_id (FK nullable),
permissions_group (1=menu, 2=submenu, 3=acción), permissions_group_id,
permission_status (tinyint 0/1), timestamps
```

---

## Flujo de autenticación

```
Usuario → POST /login (campo: login = email o username)
         ↓
   FortifyServiceProvider::authenticateUsing()
   → detecta tipo: filter_var(FILTER_VALIDATE_EMAIL)
   → busca por email o username
   → valida password con Hash::check()
         ↓
   Sesión iniciada → redirect /dashboard
         ↓
   React: GET /api/me → retorna usuario con rol y permisos
         ↓
   useAuth.js → setUsuario(data) → rutas desprotegidas redirigen a /dashboard
```

### Verificación en F5 / recarga

```
app.jsx monta → useEffect → verificarSesion()
→ GET /api/me
  → 200: setUsuario(data), verificando=false → muestra app
  → 401: setUsuario(null), verificando=false → muestra login
```

### Logout

```
handleLogout() en Topbar
→ logout() en useAuth [setUsuario(null) ANTES del await → guard ve null]
→ await axios.post('/logout')
→ navigate('/login', { replace: true })
```

---

## Sistema de permisos y roles

Ver documentación completa en [`docs/permisos-roles.md`](docs/permisos-roles.md).

**Grupos de permisos:**

| Valor | Constante | Descripción |
|-------|-----------|-------------|
| 1 | `GRUPO_MENU` | Permiso de acceso al menú |
| 2 | `GRUPO_SUBMENU` | Permiso de acceso al submenú |
| 3 | `GRUPO_ACCIONES` | Permisos de acción (crear, actualizar, cambiar_estado, eliminar) |

**Convención de nombres:**
```
{funcion}.acceso          → acceso a menú o submenú
{funcion}.crear           → crear registros
{funcion}.actualizar      → editar registros
{funcion}.cambiar_estado  → activar/desactivar
{funcion}.eliminar        → eliminar registros
```

---

## Comandos útiles

```bash
# Limpiar caché de permisos Spatie
php artisan permission:cache-reset

# Limpiar caché general
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Volver a ejecutar seeders
php artisan db:seed --class=SuperadminSeeder

# Ver rutas registradas
php artisan route:list

# Verificar migraciones
php artisan migrate:status
```

---

## Convenciones de código

- **PHP**: camelCase para variables/métodos, PascalCase para clases, snake_case en base de datos
- **JS/JSX**: camelCase en español para variables, PascalCase para componentes
- **Eloquent** sobre `DB::` siempre que sea posible
- Mutations de DB en `DB::transaction()`
- No usar `(array)` casting — usar `->toArray()`
- Validaciones de formularios en español (`lang/es/validation.php`)

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [`docs/diseño-web.md`](docs/diseño-web.md) | Sistema de diseño: colores, tipografía, componentes, reglas UI |
| [`docs/estructura-archivos.md`](docs/estructura-archivos.md) | Cómo crear nuevos módulos, convenciones de carpetas |
| [`docs/permisos-roles.md`](docs/permisos-roles.md) | Sistema RBAC, observers, ciclo de vida de permisos |
| [`docs/flujo-spa.md`](docs/flujo-spa.md) | Arquitectura SPA, comunicación Laravel↔React, rutas |
