import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ mobileAbierto, setMobileAbierto, usuario, menus }) {
    const location = useLocation();
    const [expandidos, setExpandidos] = useState([]);

    // Auto-expande el menú padre cuando la ruta activa es un submenú suyo
    useEffect(() => {
        const menuActivo = menus.find(m =>
            m.submenus?.some(s =>
                location.pathname.startsWith(`/${m.menu_funcion}/${s.submenu_funcion}`)
            )
        );
        if (menuActivo) {
            setExpandidos(prev =>
                prev.includes(menuActivo.id) ? prev : [...prev, menuActivo.id]
            );
        }
    }, [menus, location.pathname]);

    const toggleExpandido = (id) => {
        setExpandidos(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const submenuActivo = (menu) => {
        return menu.submenus?.some(s =>
            location.pathname.startsWith(`/${menu.menu_funcion}/${s.submenu_funcion}`)
        );
    };

    const cerrarMobile = () => setMobileAbierto(false);

    const contenido = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center h-16 px-5 border-b border-zinc-200 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                        <i className="fa-solid fa-bolt text-white text-xs" />
                    </div>
                    <div>
                        <p className="text-zinc-900 dark:text-white font-bold text-sm leading-none">EnergíaHogar</p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">Panel Admin</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {/* Dashboard — siempre visible y fijo */}
                <NavLink
                    to="/dashboard"
                    onClick={cerrarMobile}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative
                        ${isActive
                            ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-indigo-500 before:rounded-full'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                        }`}
                >
                    <i className="fa-solid fa-house w-4 text-center text-sm shrink-0" />
                    <span className="text-sm font-medium">Dashboard</span>
                </NavLink>

                {/* Menus dinámicos desde la BD filtrados por rol */}
                {menus.map((menu) => {
                    const tieneSubmenus = menu.submenus && menu.submenus.length > 0;
                    const estaExpandido = expandidos.includes(menu.id);
                    const esActivo      = submenuActivo(menu);

                    if (!tieneSubmenus) {
                        return (
                            <NavLink
                                key={menu.id}
                                to={`/${menu.menu_funcion}`}
                                onClick={cerrarMobile}
                                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative
                                    ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-indigo-500 before:rounded-full'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <i className={`${menu.menu_icono} w-4 text-center text-sm shrink-0`} />
                                <span className="text-sm font-medium">{menu.menu_nombre}</span>
                            </NavLink>
                        );
                    }

                    return (
                        <div key={menu.id}>
                            <button
                                onClick={() => toggleExpandido(menu.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                    ${esActivo
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <i className={`${menu.menu_icono} w-4 text-center text-sm shrink-0`} />
                                <span className="text-sm font-medium flex-1 text-left">{menu.menu_nombre}</span>
                                <motion.i
                                    animate={{ rotate: estaExpandido ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fa-solid fa-chevron-down text-xs text-zinc-400 dark:text-zinc-600 shrink-0"
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {estaExpandido && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="ml-4 mt-0.5 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 pb-1">
                                            {menu.submenus.map((sub) => (
                                                <NavLink
                                                    key={sub.id}
                                                    to={`/${menu.menu_funcion}/${sub.submenu_funcion}`}
                                                    onClick={cerrarMobile}
                                                    className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                                                        ${isActive
                                                            ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-medium'
                                                            : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    <i className="fa-solid fa-circle-dot text-[10px] w-3.5 text-center shrink-0" />
                                                    {sub.submenu_nombre}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Footer usuario */}
            <div className="border-t border-zinc-200 dark:border-white/5 p-3 shrink-0">
                <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
                    <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {usuario?.name?.charAt(0) ?? 'U'}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <p className="text-zinc-800 dark:text-zinc-200 text-xs font-medium truncate">{usuario?.name}</p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] truncate">{usuario?.rol}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop: siempre visible */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-40">
                {contenido}
            </aside>

            {/* Mobile: overlay deslizable */}
            <AnimatePresence>
                {mobileAbierto && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                            onClick={cerrarMobile}
                        />
                        <motion.aside
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed left-0 top-0 h-screen w-[260px] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 lg:hidden"
                        >
                            {contenido}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
