import { Link, useLocation } from 'react-router-dom';

const mapa = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    roles: 'Roles',
    permisos: 'Permisos',
    menus: 'Menús',
    submenus: 'Submenús',
};

export default function Breadcrumb() {
    const location = useLocation();
    const segmentos = location.pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center gap-1.5 text-sm">
            <Link to="/dashboard" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <i className="fa-solid fa-house text-xs" />
            </Link>
            {segmentos.map((seg, i) => {
                const ruta = '/' + segmentos.slice(0, i + 1).join('/');
                const esUltimo = i === segmentos.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300 dark:text-zinc-700" />
                        {esUltimo ? (
                            <span className="font-medium text-zinc-700 dark:text-zinc-200">
                                {mapa[seg] ?? seg}
                            </span>
                        ) : (
                            <Link to={ruta} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                {mapa[seg] ?? seg}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
