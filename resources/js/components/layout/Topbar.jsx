import { useNavigate } from 'react-router-dom';
import Dropdown from '../ui/Dropdown';
import Breadcrumb from './Breadcrumb';

export default function Topbar({ isDark, setIsDark, usuario, logout, setMobileAbierto }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();            // usuario=null corre de forma síncrona dentro de logout()
        navigate('/login', { replace: true });
    };

    const itemsUsuario = [
        { label: 'Mi perfil', icono: 'fa-user' },
        { label: 'Configuración', icono: 'fa-gear' },
        { separador: true },
        { label: 'Cerrar sesión', icono: 'fa-arrow-right-from-bracket', peligro: true, onClick: handleLogout },
    ];

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 z-30">
            <div className="flex items-center gap-3">
                {/* Hamburger — solo mobile */}
                <button
                    onClick={() => setMobileAbierto(v => !v)}
                    className="lg:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <i className="fa-solid fa-bars text-sm" />
                </button>

                <Breadcrumb />
            </div>

            <div className="flex items-center gap-2">
                {/* Notificaciones */}
                <button className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <i className="fa-solid fa-bell text-sm" />
                    <span className="absolute top-1.5 right-1.5 size-2 bg-indigo-500 rounded-full" />
                </button>

                {/* Dark mode */}
                <button
                    onClick={() => setIsDark(v => !v)}
                    className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={isDark ? 'Modo claro' : 'Modo oscuro'}
                >
                    <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-sm`} />
                </button>

                {/* Separador */}
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

                {/* Avatar + Dropdown */}
                <Dropdown
                    align="right"
                    trigger={
                        <div className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                            <div className="size-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                                {usuario?.name?.charAt(0) ?? 'U'}
                            </div>
                            <div className="hidden sm:block leading-none">
                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{usuario?.name}</p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">{usuario?.rol}</p>
                            </div>
                            <i className="fa-solid fa-chevron-down text-xs text-zinc-400 hidden sm:block" />
                        </div>
                    }
                    items={itemsUsuario}
                />
            </div>
        </header>
    );
}
