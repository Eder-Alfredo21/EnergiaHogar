# Arquitectura SPA — EnergíaHogar

Documentación del flujo de comunicación entre Laravel (backend) y React (frontend).

---

## Concepto general

El proyecto es un **Monolith SPA**: Laravel sirve una única vista Blade (`spa.blade.php`) que carga el bundle de React. Desde ese punto, React controla toda la navegación del navegador.

```
Navegador → http://energiahogar.test/cualquier-ruta
    → Laravel: routes/web.php catch-all → view('spa')
    → spa.blade.php: carga app.jsx via Vite
    → React Router: toma control del path del navegador
    → Renderiza la página correspondiente
```

---

## Única vista Blade

`resources/views/spa.blade.php` es el único template HTML:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name') }}</title>
    <!-- Font Awesome 6 Free CDN -->
    <!-- Inter font (Google Fonts) -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

El CSRF token se inyecta como meta tag. `bootstrap.js` lo lee y lo pone en los headers de Axios.

---

## Rutas Laravel

`routes/web.php` tiene tres tipos de rutas:

```php
// 1. Rutas nombradas para reset de contraseña (ANTES del catch-all)
//    Fortify las necesita para generar URLs en los emails
Route::get('/forgot-password', fn() => view('spa'))->name('password.request');
Route::get('/reset-password/{token}', fn() => view('spa'))->name('password.reset');

// 2. API inline (requiere sesión activa)
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/me', function (Request $request) {
        $usuario = $request->user()->load('roles');
        return response()->json([
            'id'       => $usuario->id,
            'name'     => $usuario->name,
            'username' => $usuario->username,
            'email'    => $usuario->email,
            'rol'      => $usuario->getRoleNames()->first() ?? 'Sin rol',
            'permisos' => $usuario->getAllPermissions()->pluck('name')->values()->toArray(),
        ]);
    });
    // Aquí se agregan más rutas de recursos
});

// 3. Catch-all SPA (SIEMPRE al final)
Route::get('/{any?}', fn() => view('spa'))->where('any', '.*');
```

**Importante**: Las rutas nombradas deben estar ANTES del catch-all. Si el catch-all va primero, nunca se llegaría a las rutas nombradas.

---

## Rutas de Fortify (automáticas)

Fortify registra sus propias rutas al activarse. Con `views: false`:

| Método | Ruta | Acción |
|--------|------|--------|
| `POST` | `/login` | Iniciar sesión |
| `POST` | `/logout` | Cerrar sesión |
| `POST` | `/forgot-password` | Enviar email de reset |
| `POST` | `/reset-password` | Cambiar contraseña |
| `POST` | `/register` | Registrar usuario |
| `POST` | `/user/profile-information` | Actualizar perfil |
| `POST` | `/user/password` | Cambiar contraseña |

Con `views: false`, Fortify NO registra rutas `GET` — esas las maneja React.

---

## Rutas de React

`resources/js/routes/index.jsx`:

```
/login                 → Login.jsx          (pública, redirige si autenticado)
/forgot-password       → ForgotPassword.jsx (pública, redirige si autenticado)
/reset-password/:token → ResetPassword.jsx  (pública, redirige si autenticado)

/dashboard             → Dashboard.jsx      (requiere auth)
/usuarios              → Usuarios.jsx       (requiere auth)
/roles                 → Roles.jsx          (requiere auth)
/permisos              → Permisos.jsx       (requiere auth)
/menus                 → Menus.jsx          (requiere auth)
/submenus              → Submenus.jsx       (requiere auth)
/*                     → Redirect según autenticación
```

---

## Axios — configuración base

`resources/js/bootstrap.js`:

```js
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';
window.axios.defaults.withCredentials = true;

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
```

- `withCredentials: true` → envía la cookie de sesión en cada request
- `Accept: application/json` → Laravel devuelve JSON (no redirecciones HTML)
- `X-CSRF-TOKEN` → requerido por Laravel para POST/PUT/DELETE

---

## Flujo completo de autenticación

### Login

```
1. Usuario llena form → POST /login { login: "admin", password: "..." }
2. FortifyServiceProvider::authenticateUsing()
   → detecta email o username
   → busca usuario
   → valida password
   → retorna usuario (Fortify inicia sesión)
3. React recibe 200 (o 204)
4. React hace GET /api/me → obtiene datos del usuario
5. setUsuario(data) → route guard redirige a /dashboard
```

### Verificación en recarga (F5)

```
1. app.jsx monta → useEffect → verificarSesion()
2. GET /api/me
   → Cookie de sesión válida → 200 → setUsuario(data), verificando=false
   → Sin sesión → 401 → setUsuario(null), verificando=false → login visible
3. Mientras verificando=true → spinner pantalla completa
```

### Logout

```
1. Usuario hace clic en "Cerrar sesión"
2. handleLogout() en Topbar.jsx
3. await logout()
   → setUsuario(null)  [SÍNCRONO, inmediato]
   → await axios.post('/logout')
4. navigate('/login', { replace: true })
```

El `setUsuario(null)` va ANTES del `await` para que cuando `navigate` ejecute, el guard ya vea `usuario = null` y no redirija de vuelta al dashboard.

---

## Guards de ruta (React)

```jsx
// Ruta protegida (requiere auth)
<Route
    element={
        autenticado
            ? <AdminLayout ... />
            : <Navigate to="/login" replace />
    }
>

// Ruta pública (bloquea si ya autenticado)
<Route
    path="/login"
    element={autenticado ? <Navigate to="/dashboard" replace /> : <Login />}
/>
```

---

## Comunicación en tiempo real (pendiente)

Actualmente toda la comunicación es request-response clásica (axios). Para implementar notificaciones en tiempo real se puede agregar:

- **Laravel Echo + Pusher/Reverb** para WebSockets
- **Polling** con `setInterval` para casos simples

---

## Manejo de errores HTTP

Convenciones en el frontend:

| Código | Significado | Acción en React |
|--------|-------------|-----------------|
| 200/201 | Éxito | Actualizar estado |
| 204 | Sin contenido | Refrescar lista |
| 401 | No autenticado | Redirigir a /login |
| 403 | Sin permiso | Mostrar alert "Sin acceso" |
| 404 | No encontrado | Mostrar mensaje |
| 422 | Validación | Mostrar errores en campos |
| 429 | Rate limit | Mostrar "Demasiados intentos" |
| 500 | Error servidor | Mostrar alert error genérico |

---

## Variables de entorno relevantes para el SPA

```env
APP_URL=http://energiahogar.test    # Base URL (Fortify la usa para emails)
APP_LOCALE=es                        # Idioma de mensajes de error
SESSION_DRIVER=database              # Sesiones en BD (no file)
SESSION_LIFETIME=120                 # Minutos de sesión
SANCTUM_STATEFUL_DOMAINS=energiahogar.test  # Si se usa Sanctum en el futuro
```

---

## Build y despliegue

### Desarrollo

```bash
npm run dev    # Vite con HMR (hot reload)
```

Vite sirve los assets desde `http://localhost:5173` y los inyecta en la página via `@vite()`.

### Producción

```bash
npm run build
```

Genera archivos hasheados en `public/build/`. Laravel los sirve directamente sin Vite.

```bash
php artisan optimize        # Cachea config, routes, views
php artisan queue:work      # Si hay jobs en cola (emails)
```

---

## Estructura de datos del usuario en memoria

El hook `useAuth.js` normaliza los datos del usuario:

```js
{
    id: 1,
    name: "Eder Alfredo",
    username: "superadmin",
    email: "reynaalfredo421@gmail.com",
    rol: "superadmin",           // primer rol asignado
    permisos: [                  // array plano de nombres
        "usuarios.acceso",
        "usuarios.crear",
        ...
    ]
}
```

Este objeto está disponible en toda la app via props desde `app.jsx → AppRoutes → AdminLayout → páginas`.
