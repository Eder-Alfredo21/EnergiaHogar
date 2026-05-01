export const usuariosMock = [
    { id: 1, name: 'Ana García', username: 'ana.garcia', email: 'ana@energiahogar.com', rol: 'Administrador', estado: true, creado: '2024-01-15' },
    { id: 2, name: 'Carlos Méndez', username: 'carlos.m', email: 'carlos@energiahogar.com', rol: 'Editor', estado: true, creado: '2024-02-20' },
    { id: 3, name: 'Lucía Fernández', username: 'lucia.f', email: 'lucia@energiahogar.com', rol: 'Visor', estado: false, creado: '2024-03-10' },
    { id: 4, name: 'Roberto Silva', username: 'roberto.s', email: 'roberto@energiahogar.com', rol: 'Editor', estado: true, creado: '2024-04-05' },
    { id: 5, name: 'María Torres', username: 'maria.t', email: 'maria@energiahogar.com', rol: 'Visor', estado: true, creado: '2024-04-18' },
];

export const rolesMock = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', permisos: 24, usuarios: 1, creado: '2024-01-01' },
    { id: 2, nombre: 'Editor', descripcion: 'Crear y editar contenido', permisos: 12, usuarios: 2, creado: '2024-01-01' },
    { id: 3, nombre: 'Visor', descripcion: 'Solo lectura', permisos: 6, usuarios: 2, creado: '2024-01-01' },
];

export const permisosMock = [
    { id: 1, nombre: 'usuarios.ver', modulo: 'Usuarios', descripcion: 'Ver listado de usuarios' },
    { id: 2, nombre: 'usuarios.crear', modulo: 'Usuarios', descripcion: 'Crear nuevos usuarios' },
    { id: 3, nombre: 'usuarios.editar', modulo: 'Usuarios', descripcion: 'Editar usuarios existentes' },
    { id: 4, nombre: 'usuarios.eliminar', modulo: 'Usuarios', descripcion: 'Eliminar usuarios' },
    { id: 5, nombre: 'roles.ver', modulo: 'Roles', descripcion: 'Ver listado de roles' },
    { id: 6, nombre: 'roles.crear', modulo: 'Roles', descripcion: 'Crear nuevos roles' },
    { id: 7, nombre: 'roles.editar', modulo: 'Roles', descripcion: 'Editar roles existentes' },
    { id: 8, nombre: 'roles.eliminar', modulo: 'Roles', descripcion: 'Eliminar roles' },
    { id: 9, nombre: 'permisos.ver', modulo: 'Permisos', descripcion: 'Ver listado de permisos' },
    { id: 10, nombre: 'menus.ver', modulo: 'Menús', descripcion: 'Ver menús del sistema' },
    { id: 11, nombre: 'menus.crear', modulo: 'Menús', descripcion: 'Crear menús' },
    { id: 12, nombre: 'menus.editar', modulo: 'Menús', descripcion: 'Editar menús' },
];

export const statsCards = [
    { titulo: 'Usuarios activos', valor: '1,284', cambio: '+12%', tendencia: 'up', icono: 'fa-users', color: 'indigo' },
    { titulo: 'Roles creados', valor: '8', cambio: '+2', tendencia: 'up', icono: 'fa-shield', color: 'violet' },
    { titulo: 'Permisos totales', valor: '24', cambio: '0%', tendencia: 'neutral', icono: 'fa-key', color: 'cyan' },
    { titulo: 'Sesiones hoy', valor: '342', cambio: '+8%', tendencia: 'up', icono: 'fa-chart-line', color: 'emerald' },
];

export const actividadReciente = [
    { usuario: 'Ana García', accion: 'Creó el rol "Supervisor"', tiempo: 'Hace 5 min', tipo: 'crear' },
    { usuario: 'Carlos Méndez', accion: 'Editó el usuario #24', tiempo: 'Hace 18 min', tipo: 'editar' },
    { usuario: 'Sistema', accion: 'Backup automático completado', tiempo: 'Hace 1 hora', tipo: 'sistema' },
    { usuario: 'Lucía Fernández', accion: 'Intentó acceder a Permisos', tiempo: 'Hace 2 horas', tipo: 'denegado' },
    { usuario: 'Roberto Silva', accion: 'Inició sesión', tiempo: 'Hace 3 horas', tipo: 'login' },
];
