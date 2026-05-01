# Estructura de Archivos — EnergíaHogar

Guía de referencia para saber dónde crear cada tipo de archivo y cómo extender el proyecto.

---

## Mapa mental del proyecto

```
EnergíaHogar/
├── Backend (Laravel)
│   ├── app/Models/          ← Modelos Eloquent
│   ├── app/Services/        ← Lógica de negocio
│   ├── app/Observers/       ← Efectos secundarios (auto-permisos)
│   ├── app/Http/Controllers/← Controladores HTTP
│   ├── app/Providers/       ← Configuración de servicios
│   ├── app/Actions/Fortify/ ← Acciones de autenticación
│   ├── database/migrations/ ← Esquema de base de datos
│   ├── database/seeders/    ← Datos iniciales
│   ├── routes/web.php       ← Rutas web + API inline
│   └── lang/es/             ← Traducciones
│
└── Frontend (React SPA)
    ├── resources/js/app.jsx         ← Punto de entrada
    ├── resources/js/routes/         ← Definición de rutas
    ├── resources/js/hooks/          ← Lógica reutilizable
    ├── resources/js/layouts/        ← Estructuras de página
    ├── resources/js/pages/          ← Páginas de la aplicación
    ├── resources/js/components/     ← Componentes reutilizables
    │   ├── layout/                  ← Sidebar, Topbar, Breadcrumb
    │   └── ui/                      ← Componentes genéricos
    ├── resources/js/data/           ← Datos mock / estructura de menús
    └── resources/css/app.css        ← Estilos globales + tokens
```

---

## Cómo crear un nuevo módulo

Ejemplo completo: crear el módulo **Clientes**.

### 1. Migración

```bash
php artisan make:migration create_clientes_table
```

Archivo en `database/migrations/YYYY_MM_DD_HHMMSS_create_clientes_table.php`:

```php
Schema::create('clientes', function (Blueprint $table) {
    $table->id();
    $table->string('cliente_nombre');
    $table->string('cliente_email')->unique()->nullable();
    $table->tinyInteger('cliente_estado')->default(1);
    $table->softDeletes();
    $table->timestamps();
});
```

Ejecutar: `php artisan migrate`

### 2. Modelo

Crear `app/Models/Cliente.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cliente_nombre',
        'cliente_email',
        'cliente_estado',
    ];

    protected $casts = [
        'cliente_estado' => 'integer',
    ];

    public function estaActivo(): bool
    {
        return $this->cliente_estado === 1;
    }
}
```

### 3. Service

Crear `app/Services/ClienteService.php`:

```php
<?php

namespace App\Services;

use App\Models\Cliente;
use Illuminate\Support\Facades\DB;

class ClienteService
{
    public function crear(array $datos): Cliente
    {
        return DB::transaction(function () use ($datos) {
            return Cliente::create($datos);
        });
    }

    public function actualizar(Cliente $cliente, array $datos): Cliente
    {
        return DB::transaction(function () use ($cliente, $datos) {
            $cliente->update($datos);
            return $cliente->fresh();
        });
    }

    public function cambiarEstado(Cliente $cliente): Cliente
    {
        return DB::transaction(function () use ($cliente) {
            $cliente->update(['cliente_estado' => $cliente->cliente_estado ? 0 : 1]);
            return $cliente->fresh();
        });
    }

    public function eliminar(Cliente $cliente): void
    {
        DB::transaction(function () use ($cliente) {
            $cliente->delete();
        });
    }
}
```

### 4. Controlador

Crear `app/Http/Controllers/ClienteController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Services\ClienteService;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function __construct(protected ClienteService $clienteService) {}

    public function index()
    {
        $clientes = Cliente::orderBy('cliente_nombre')->get();
        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'cliente_nombre' => ['required', 'string', 'max:100'],
            'cliente_email'  => ['nullable', 'email', 'unique:clientes'],
        ]);

        $cliente = $this->clienteService->crear($datos);
        return response()->json($cliente, 201);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $datos = $request->validate([
            'cliente_nombre' => ['required', 'string', 'max:100'],
            'cliente_email'  => ['nullable', 'email', "unique:clientes,cliente_email,{$cliente->id}"],
        ]);

        $cliente = $this->clienteService->actualizar($cliente, $datos);
        return response()->json($cliente);
    }

    public function destroy(Cliente $cliente)
    {
        $this->clienteService->eliminar($cliente);
        return response()->json(null, 204);
    }
}
```

### 5. Ruta en web.php

En `routes/web.php`, dentro del grupo `auth` + `api`:

```php
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/me', ...);

    // Agregar aquí
    Route::apiResource('clientes', ClienteController::class);
});
```

### 6. Menú en el sidebar

En `resources/js/data/menus.js`, agregar al array de menús:

```js
{
    id: 'clientes',
    label: 'Clientes',
    icono: 'fa-users',
    ruta: '/clientes',
    permiso: 'clientes.acceso',
},
```

Si el módulo tiene submenús:

```js
{
    id: 'comercial',
    label: 'Comercial',
    icono: 'fa-briefcase',
    submenu: [
        { id: 'clientes', label: 'Clientes', ruta: '/clientes', permiso: 'clientes.acceso' },
        { id: 'contratos', label: 'Contratos', ruta: '/contratos', permiso: 'contratos.acceso' },
    ],
},
```

### 7. Página React

Crear `resources/js/pages/Clientes.jsx`:

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const { data } = await axios.get('/api/clientes');
            setClientes(data);
        } finally {
            setCargando(false);
        }
    };

    const columnas = [
        { key: 'cliente_nombre', label: 'Nombre' },
        { key: 'cliente_email', label: 'Email' },
        {
            key: 'cliente_estado',
            label: 'Estado',
            render: (v) => (
                <Badge variant={v ? 'emerald' : 'zinc'} dot>
                    {v ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                        Clientes
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Gestión de clientes del sistema
                    </p>
                </div>
                <Button variant="primary" icono="fa-plus" onClick={() => setModalAbierto(true)}>
                    Nuevo cliente
                </Button>
            </div>

            <Table
                columnas={columnas}
                datos={clientes}
                cargando={cargando}
            />

            <Modal
                abierto={modalAbierto}
                onClose={setModalAbierto}
                titulo="Nuevo cliente"
            >
                {/* formulario aquí */}
            </Modal>
        </div>
    );
}
```

### 8. Registrar la ruta en React

En `resources/js/routes/index.jsx`:

```jsx
const Clientes = lazy(() => import('../pages/Clientes'));

// Dentro del grupo admin:
<Route path="/clientes" element={<Clientes />} />
```

### 9. Crear el menú en BD (opcional)

Si el módulo usa el sistema de permisos dinámico:

```php
// En un seeder o tinker
$menu = Menu::create([
    'menu_nombre'  => 'Clientes',
    'menu_funcion' => 'clientes',
    'menu_orden'   => 10,
    'menu_icono'   => 'fa-users',
]);
// El observer MenuObserver crea automáticamente el permiso clientes.acceso
// y lo asigna al superadmin
```

---

## Convenciones de nombres

### Archivos PHP

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Modelo | PascalCase singular | `Cliente.php` |
| Controlador | PascalCase + Controller | `ClienteController.php` |
| Service | PascalCase + Service | `ClienteService.php` |
| Observer | PascalCase + Observer | `ClienteObserver.php` |
| Migration | snake_case descriptivo | `create_clientes_table.php` |
| Seeder | PascalCase + Seeder | `ClienteSeeder.php` |

### Archivos JS/JSX

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Página | PascalCase plural | `Clientes.jsx` |
| Componente layout | PascalCase | `Sidebar.jsx` |
| Componente UI | PascalCase | `Button.jsx` |
| Hook | camelCase + use | `useAuth.js` |
| Datos | camelCase | `mockData.js` |

### Variables y métodos PHP

```php
// Métodos en camelCase español
public function crearCliente(array $datos): Cliente { ... }
public function estaActivo(): bool { ... }

// Variables en camelCase español
$nuevoCliente = new Cliente();
$clientesActivos = Cliente::where('cliente_estado', 1)->get();

// Columnas de BD en snake_case
cliente_nombre, cliente_email, cliente_estado
```

### Variables y funciones JS

```js
// Variables en camelCase español
const [clientesActivos, setClientesActivos] = useState([]);
const cargandoClientes = true;

// Handlers con prefijo "handle"
const handleGuardar = () => { ... };
const handleEliminar = (id) => { ... };
```

---

## Estructura de respuestas API

Todas las respuestas de la API son JSON:

```json
// Listado
[{ "id": 1, "cliente_nombre": "ACME", ... }]

// Recurso individual
{ "id": 1, "cliente_nombre": "ACME", ... }

// Éxito sin contenido
204 No Content

// Error de validación (automático Laravel)
{
    "message": "El campo cliente_nombre es obligatorio.",
    "errors": {
        "cliente_nombre": ["El campo cliente_nombre es obligatorio."]
    }
}
```

En React, leer errores de validación:

```js
try {
    await axios.post('/api/clientes', datos);
} catch (error) {
    if (error.response?.status === 422) {
        setErrores(error.response.data.errors);
    }
}
```

---

## Archivos que NO se deben modificar sin análisis

| Archivo | Razón |
|---------|-------|
| `app/Models/Permission.php` | Constantes usadas por observers y services |
| `app/Observers/PermissionObserver.php` | Auto-asigna permisos al superadmin |
| `resources/js/hooks/useAuth.js` | Flujo de auth crítico (orden de operaciones importa) |
| `resources/js/routes/index.jsx` | Guards de autenticación |
| `resources/css/app.css` | `@variant dark` — cambiarlo rompe el dark mode |
| `config/fortify.php` | `views: false` es crítico para el SPA |
| `routes/web.php` | Las rutas nombradas de password deben estar ANTES del catch-all |

---

## Flujo de datos entre Laravel y React

```
React (axios)  →  routes/web.php  →  Controller  →  Service  →  Model  →  DB
                                                          ↑
                                                     Observer (efectos)
```

1. React hace `axios.get/post/put/delete` con `withCredentials: true`
2. Laravel valida sesión por cookie de sesión
3. Si no autenticado → 401 → React redirige a `/login`
4. Controller recibe request, valida, llama al Service
5. Service ejecuta en `DB::transaction()`
6. Observer reacciona si aplica (auto-permisos, etc.)
7. Controller retorna JSON → React actualiza estado

---

## Dónde agregar traducciones

Las traducciones están en `lang/es/`:

- `auth.php` → mensajes de autenticación (login fallido, throttle)
- `passwords.php` → mensajes de reset de contraseña
- `validation.php` → mensajes de validación de formularios

Para agregar un campo con nombre legible en mensajes de error:

```php
// lang/es/validation.php, sección 'attributes':
'attributes' => [
    'cliente_nombre' => 'nombre del cliente',
    'cliente_email'  => 'correo del cliente',
],
```

Resultado: "El campo **nombre del cliente** es obligatorio."
