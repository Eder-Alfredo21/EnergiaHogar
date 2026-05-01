# Sistema de Diseño — EnergíaHogar

Guía de referencia para mantener consistencia visual en el panel de administración.

---

## Tecnologías de estilo

- **Tailwind CSS 4** con `@theme` para tokens personalizados
- **Vite + @tailwindcss/vite** como plugin (no postcss)
- **Dark mode**: clase `.dark` en `<html>` — NO media query
- **Fuente**: Inter (Google Fonts, variable `--font-sans`)
- **Íconos**: Font Awesome 6 Free (CDN en `spa.blade.php`)

---

## Paleta de colores

### Color primario — Indigo

Definido en `resources/css/app.css` vía `@theme`:

| Token | Hex | Uso |
|-------|-----|-----|
| `indigo-50` | `#eef2ff` | Fondo activo en sidebar (light) |
| `indigo-100` | `#e0e7ff` | — |
| `indigo-200` | `#c7d2fe` | — |
| `indigo-300` | `#a5b4fc` | — |
| `indigo-400` | `#818cf8` | Íconos activos (dark) |
| `indigo-500` | `#6366f1` | Spinner, indicador notificaciones |
| `indigo-600` | `#4f46e5` | Botón primary, links activos |
| `indigo-700` | `#4338ca` | Hover botón primary |
| `indigo-800` | `#3730a3` | — |
| `indigo-900` | `#312e81` | — |
| `indigo-950` | `#1e1b4b` | — |

### Escala de grises — Zinc

Zinc es la escala base para fondos, bordes y texto.

| Clase | Uso light | Uso dark |
|-------|-----------|----------|
| `zinc-50` | Fondo app / main | — |
| `zinc-100` | Hover en botones, inputs | — |
| `zinc-200` | Bordes, separadores | — |
| `zinc-400` | Texto secundario, íconos inactivos | — |
| `zinc-500` | Texto terciario | Texto secundario |
| `zinc-700` | — | Bordes, separadores |
| `zinc-800` | — | Hover items sidebar |
| `zinc-900` | — | Fondo app / main |
| `zinc-950` | — | Sidebar, topbar |

### Colores semánticos (badges y alertas)

| Color | Clase base | Uso |
|-------|-----------|-----|
| Emerald | `emerald-*` | Estado activo / éxito |
| Red | `red-*` | Error / peligro / eliminar |
| Amber | `amber-*` | Advertencia |
| Violet | `violet-*` | Roles / permisos |
| Cyan | `cyan-*` | Info / sesiones |
| Indigo | `indigo-*` | Primario / módulos |
| Zinc | `zinc-*` | Neutro / inactivo |

---

## Tipografía

**Fuente única**: Inter (importada desde Google Fonts)

```css
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

### Escala tipográfica usada

| Clase Tailwind | Tamaño | Uso |
|----------------|--------|-----|
| `text-xs` | 12px | Labels de íconos, meta info |
| `text-[11px]` | 11px | Rol de usuario en topbar |
| `text-sm` | 14px | Texto general, filas de tabla |
| `text-base` | 16px | — (rara vez usado directo) |
| `text-lg` | 18px | Títulos de sección |
| `text-xl` | 20px | Títulos de página |
| `text-2xl` | 24px | Números grandes en stats |
| `text-3xl` | 30px | — |

### Pesos usados

| Clase | Peso | Uso |
|-------|------|-----|
| `font-normal` | 400 | Texto general |
| `font-medium` | 500 | Etiquetas, nombre usuario |
| `font-semibold` | 600 | Títulos, cabeceras de sección |
| `font-bold` | 700 | Avatar inicial, números destacados |

---

## Espaciado y layout

### Grid principal

```
Sidebar: 260px fijo (desktop), overlay animado (mobile)
Topbar: 64px altura (h-16), fixed, z-30
Main: padding-top 64px (pt-16), margin-left 260px (lg:ml-[260px])
Contenido: max-w-screen-2xl, padding p-6
```

### Breakpoints

Tailwind 4 usa los mismos breakpoints por defecto:

| Prefijo | Mínimo | Uso en el proyecto |
|---------|--------|--------------------|
| `sm` | 640px | Mostrar nombre usuario en topbar |
| `md` | 768px | — |
| `lg` | 1024px | Sidebar visible, topbar con offset |
| `xl` | 1280px | — |
| `2xl` | 1536px | Límite max-width del contenido |

### Espaciado en componentes

| Contexto | Valor |
|----------|-------|
| Padding interior de cards | `p-5` / `p-6` |
| Gap entre elementos de formulario | `gap-4` / `gap-6` |
| Padding horizontal de la topbar | `px-4 lg:px-6` |
| Padding de botones (md) | `px-4 py-2` |
| Border radius estándar | `rounded-lg` (8px) |
| Border radius de avatares | `rounded-full` |

---

## Componentes UI

Todos en `resources/js/components/ui/`.

### Button

```jsx
<Button variant="primary" size="md" icono="fa-plus">Crear</Button>
```

| Variant | Apariencia |
|---------|-----------|
| `primary` | Fondo indigo-600, texto blanco |
| `secondary` | Fondo zinc-100/800, texto zinc-700/200 |
| `danger` | Fondo red-600, texto blanco |
| `ghost` | Sin fondo, texto zinc-600 |
| `success` | Fondo emerald-600, texto blanco |

| Size | Padding | Texto |
|------|---------|-------|
| `sm` | `px-3 py-1.5` | `text-xs` |
| `md` | `px-4 py-2` | `text-sm` |
| `lg` | `px-5 py-2.5` | `text-base` |

### Badge

```jsx
<Badge variant="emerald" dot>Activo</Badge>
```

Variantes disponibles: `indigo`, `emerald`, `red`, `amber`, `zinc`, `violet`, `cyan`

### Input

```jsx
<Input label="Email" icono="fa-envelope" error={errores.email} />
```

- Borde `zinc-200 dark:zinc-700`
- Focus: ring `indigo-500`
- Error: borde y texto `red-500`
- Ícono opcional a la izquierda (Font Awesome)

### Modal

```jsx
<Modal abierto={open} onClose={setOpen} titulo="Crear usuario" size="md">
    {/* contenido */}
</Modal>
```

Tamaños: `sm` (384px), `md` (512px), `lg` (640px), `xl` (768px), `2xl` (896px)

Animación con Framer Motion: `scale 0.95→1`, `opacity 0→1`, duración 150ms.

### Table

```jsx
<Table
    columnas={[{ key: 'name', label: 'Nombre' }]}
    datos={usuarios}
    acciones={(row) => <Button>Editar</Button>}
/>
```

- Header: `bg-zinc-50 dark:bg-zinc-800/50`
- Filas: hover `bg-zinc-50 dark:bg-zinc-800/30`
- Skeleton loader mientras carga

### Dropdown

```jsx
<Dropdown
    trigger={<button>Abrir</button>}
    items={[{ label: 'Opción', icono: 'fa-gear', onClick: fn }]}
    align="right"
/>
```

- Cierre al hacer click fuera (event listener en document)
- Items con `peligro: true` → texto red-600

### Alert

```jsx
<Alert variant="error" titulo="Error" mensaje="..." onClose={fn} />
```

Variantes: `info`, `success`, `warning`, `error`

---

## Dark mode

### Activación

La clase `dark` se aplica al elemento `<html>`:

```js
document.documentElement.classList.toggle('dark', isDark);
```

Persiste en `localStorage` con clave `theme`. Si no hay preferencia guardada, usa `window.matchMedia('(prefers-color-scheme: dark)')`.

### Implementación en CSS

```css
/* app.css — define el variant */
@variant dark (&:where(.dark, .dark *));
```

Esto permite usar `dark:` como prefijo en clases Tailwind.

### Transición global

```css
*, *::before, *::after {
    transition: background-color 0.15s ease, border-color 0.15s ease;
}
/* Las animaciones se excluyen para no interferir */
.animate-spin, [class*='animate-'] {
    transition: none !important;
}
```

### Pares de color más comunes

| Elemento | Light | Dark |
|----------|-------|------|
| Fondo app | `bg-zinc-50` | `dark:bg-zinc-900` |
| Sidebar / Topbar | `bg-white` | `dark:bg-zinc-950` |
| Bordes | `border-zinc-200` | `dark:border-zinc-800` |
| Texto principal | `text-zinc-800` | `dark:text-zinc-200` |
| Texto secundario | `text-zinc-500` | `dark:text-zinc-400` |
| Hover item | `hover:bg-zinc-100` | `dark:hover:bg-zinc-800` |
| Item activo sidebar | `bg-indigo-50 text-indigo-600` | `dark:bg-indigo-600/15 dark:text-indigo-400` |

---

## Layout del panel admin

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR (fixed, h-16, z-30)                          │
│  [hamburger] [breadcrumb]    [notif][dark][|][avatar] │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │  MAIN CONTENT                            │
│ (260px)  │  pt-16, p-6, max-w-screen-2xl            │
│ fixed    │                                          │
│ left-0   │  <Outlet /> ← página activa              │
│ top-0    │                                          │
│ bottom-0 │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘

Mobile: sidebar como overlay con AnimatePresence (x: -260 → 0)
        backdrop semitransparente al fondo
```

### Sidebar — estructura

```
┌─────────────────┐
│ Logo            │  h-16, border-bottom
├─────────────────┤
│ NavLink 1       │  Directo (sin submenús)
│ NavLink 2       │
│ ▼ Sección       │  Expandible con AnimatePresence
│   └ Subitem     │
│   └ Subitem     │
├─────────────────┤
│ Avatar + nombre │  al pie, border-top
└─────────────────┘
```

---

## Animaciones (Framer Motion)

| Elemento | Animación | Duración |
|----------|-----------|----------|
| Sidebar mobile | `x: -260 → 0` | 200ms ease |
| Backdrop sidebar | `opacity: 0 → 0.4` | 200ms |
| Submenús sidebar | `height: 0 → auto` | 200ms |
| Modales | `scale: 0.95→1, opacity: 0→1` | 150ms |
| Dropdown | `scale: 0.95→1, opacity: 0→1` | 100ms |

---

## Reglas de diseño

1. **Consistencia de padding**: usar siempre `p-5` o `p-6` para cards, nunca mezclar.
2. **Border radius**: `rounded-lg` para casi todo; `rounded-full` solo para avatares y pills.
3. **Estados interactivos**: siempre declarar hover, focus y estado activo.
4. **Iconos**: solo Font Awesome Solid (`fa-solid fa-*`). No mezclar estilos de icono.
5. **Colores de estado**: emerald=activo, red=error/eliminar, amber=advertencia, zinc=inactivo.
6. **Texto de error**: siempre `text-red-500 text-sm`, bajo el input correspondiente.
7. **Botón de peligro** (eliminar): usar `variant="danger"`, pedir confirmación antes de ejecutar.
8. **Loading**: mostrar skeleton o spinner indigo, nunca dejar la UI en blanco.
9. **Responsive**: diseñar mobile-first, el sidebar siempre como overlay en mobile.
10. **Dark mode**: todo componente nuevo debe tener sus pares `dark:` definidos.
