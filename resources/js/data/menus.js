export const menus = [
    {
        id: 1,
        nombre: 'Dashboard',
        icono: 'fa-house',
        ruta: '/dashboard',
        permisos: [],
        submenus: [],
    },
    {
        id: 2,
        nombre: 'Gestión',
        icono: 'fa-users-gear',
        permisos: ['usuarios.ver', 'roles.ver', 'permisos.ver'],
        submenus: [
            { id: 21, nombre: 'Usuarios', ruta: '/usuarios', icono: 'fa-user', permisos: ['usuarios.ver'] },
            { id: 22, nombre: 'Roles', ruta: '/roles', icono: 'fa-shield', permisos: ['roles.ver'] },
            { id: 23, nombre: 'Permisos', ruta: '/permisos', icono: 'fa-key', permisos: ['permisos.ver'] },
        ],
    },
    {
        id: 3,
        nombre: 'Configuración',
        icono: 'fa-sliders',
        permisos: ['menus.ver'],
        submenus: [
            { id: 31, nombre: 'Menús', ruta: '/menus', icono: 'fa-bars', permisos: ['menus.ver'] },
            { id: 32, nombre: 'Submenús', ruta: '/submenus', icono: 'fa-list', permisos: ['menus.ver'] },
        ],
    },
];
