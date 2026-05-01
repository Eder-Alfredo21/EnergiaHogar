# Patrón de diseño — Tablas CRUD

Referencia para implementar nuevas páginas de listado con búsqueda, paginación y ordenamiento.

---

## Stack de componentes

| Pieza | Archivo | Responsabilidad |
|-------|---------|----------------|
| Hook de datos | `hooks/useTabla.js` | Estado, fetch, paginación, búsqueda, orden |
| Paginación UI | `components/ui/Paginacion.jsx` | Controles de página + contador |
| Badge | `components/ui/Badge.jsx` | Etiquetas de estado |
| Button | `components/ui/Button.jsx` | Botones con variantes e íconos |
| Modal | `components/ui/Modal.jsx` | Diálogos crear/editar/confirmar |
| Input | `components/ui/Input.jsx` | Campos de formulario con error |

---

## useTabla — parámetros y retorno

```js
const tabla = useTabla(url, filtrosIniciales?)
```

**Params que envía al backend:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `buscar` | string | Término de búsqueda libre |
| `page` | number | Página actual |
| `por_pagina` | number | Registros por página (10/25/50) |
| `ordenar` | string | Nombre de columna |
| `direccion` | `asc` \| `desc` | Dirección del orden |
| `...filtrosIniciales` | object | Filtros fijos (p.ej. `{ menu_id: 3 }`) |

**Valores expuestos:**

```js
const {
    datos, cargando, total, ultimaPagina,
    buscar, setBuscar,          // búsqueda (resetea página)
    pagina, setPagina,
    porPagina, setPorPagina,    // cambia cantidad (resetea página)
    ordenar, direccion, toggleOrden,
    cargar,                     // recarga manual tras mutaciones
} = tabla;
```

---

## Estructura HTML de la tabla

```jsx
{/* Contenedor */}
<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

    {/* ── Toolbar ─────────────────────────────────────── */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">

        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
            <input
                type="text"
                value={tabla.buscar}
                onChange={e => tabla.setBuscar(e.target.value)}
                placeholder="Buscar por ..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200
                           placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-200
                           dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors"
            />
        </div>

        {/* Contador de registros */}
        <span className="text-xs text-zinc-400 shrink-0">{tabla.total} registros</span>

        {/* Selector por página */}
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-zinc-400">Mostrar</span>
            <select
                value={tabla.porPagina}
                onChange={e => tabla.setPorPagina(e.target.value)}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800
                           text-xs text-zinc-700 dark:text-zinc-300 px-2 py-1.5 focus:outline-none
                           focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900
                           focus:border-indigo-400 transition-colors cursor-pointer"
            >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
        </div>
    </div>

    {/* ── Tabla ───────────────────────────────────────── */}
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                    {/* Columna de numeración — siempre primera */}
                    <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-400
                                   dark:text-zinc-500 uppercase tracking-wider w-10">#</th>

                    {/* Columnas ordenables */}
                    <ThOrdenable col="campo_db" label="Etiqueta" {...tabla} />

                    {/* Columnas no ordenables */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500
                                   uppercase tracking-wider">Columna</th>

                    {/* Acciones — siempre última, alineada a la derecha */}
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500
                                   uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">

                {/* Estado: cargando */}
                {tabla.cargando && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: N }).map((_, j) => (   // N = total de columnas
                            <td key={j} className="px-4 py-3">
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                            </td>
                        ))}
                    </tr>
                ))}

                {/* Estado: sin resultados */}
                {!tabla.cargando && tabla.datos.length === 0 && (
                    <tr>
                        <td colSpan={N} className="px-4 py-12 text-center text-zinc-400 dark:text-zinc-500">
                            <i className="fa-solid fa-inbox text-3xl mb-2 block" />
                            Sin registros
                        </td>
                    </tr>
                )}

                {/* Estado: datos */}
                {!tabla.cargando && tabla.datos.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        {/* Numeración: (página - 1) × porPagina + índice + 1 */}
                        <td className="px-3 py-3 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                            {(tabla.pagina - 1) * tabla.porPagina + idx + 1}
                        </td>
                        {/* ...resto de celdas */}
                    </tr>
                ))}

            </tbody>
        </table>
    </div>

    {/* ── Paginación ──────────────────────────────────── */}
    <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <Paginacion
            pagina={tabla.pagina}
            ultimaPagina={tabla.ultimaPagina}
            total={tabla.total}
            setPagina={tabla.setPagina}
        />
    </div>
</div>
```

---

## Componente ThOrdenable

Se define localmente en cada página (no es un componente global):

```jsx
function ThOrdenable({ col, label, ordenar, direccion, toggleOrden }) {
    const activo = ordenar === col;
    return (
        <th onClick={() => toggleOrden(col)}
            className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400
                       uppercase tracking-wider cursor-pointer select-none
                       hover:text-zinc-700 dark:hover:text-zinc-200 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
                {label}
                <span className={activo ? 'text-indigo-500' : 'text-zinc-300 dark:text-zinc-600'}>
                    <i className={`fa-solid fa-${activo && direccion === 'desc' ? 'arrow-down' : 'arrow-up'} text-[10px]`} />
                </span>
            </span>
        </th>
    );
}
```

Uso: `<ThOrdenable col="nombre_columna_db" label="Etiqueta visible" {...tabla} />`

---

## Componente BtnAccion

También local en cada página:

```jsx
function BtnAccion({ titulo, icono, color, onClick }) {
    return (
        <button title={titulo} onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${color}`}>
            <i className={`fa-solid ${icono} text-xs`} />
        </button>
    );
}
```

**Colores estándar por acción:**

| Acción | `color` |
|--------|---------|
| Editar | `text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20` |
| Eliminar | `text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20` |
| Habilitar | `text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20` |
| Deshabilitar | `text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800` |
| Navegar / Ver detalle | `text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20` |
| Deshabilitado (no clic) | `text-zinc-300 dark:text-zinc-600 cursor-not-allowed` |

---

## Conteo de columnas (N)

`N` debe ser consistente entre el skeleton de carga, el `colSpan` del estado vacío y las celdas de datos.

| Módulo | N |
|--------|---|
| Menus | 8 |
| Submenus | 7 |
| Roles | 5 |
| Usuarios | 7 |

Al agregar o quitar columnas, actualizar los tres puntos simultáneamente.

---

## Convenciones de la toolbar

- El buscador ocupa el espacio restante (`flex-1 min-w-[200px]`).
- El contador `{tabla.total} registros` usa `text-xs text-zinc-400`.
- El selector de página usa `text-xs`; opciones fijas: **10, 25, 50**.
- Orden visual: `[buscador] ── [contador] [selector]`.

---

## Backend — controller de listado

El controlador debe leer los parámetros y aplicarlos en este orden:

```php
public function index(Request $request)
{
    $query = Modelo::query();

    // 1. Búsqueda
    if ($buscar = $request->buscar) {
        $query->where(function ($q) use ($buscar) {
            $q->where('campo_a', 'like', "%{$buscar}%")
              ->orWhere('campo_b', 'like', "%{$buscar}%");
        });
    }

    // 2. Orden
    $columnas = ['campo_a', 'campo_b', 'created_at'];  // whitelist
    $ordenar  = in_array($request->ordenar, $columnas) ? $request->ordenar : 'created_at';
    $dir      = $request->direccion === 'desc' ? 'desc' : 'asc';
    $query->orderBy($ordenar, $dir);

    // 3. Paginación
    $porPagina = in_array((int) $request->por_pagina, [10, 25, 50])
        ? (int) $request->por_pagina
        : 10;

    return $query->paginate($porPagina);
}
```

La respuesta de `paginate()` devuelve `data`, `total`, `last_page` — exactamente lo que consume `useTabla`.
