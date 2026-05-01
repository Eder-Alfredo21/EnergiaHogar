import { motion } from 'framer-motion';
import { statsCards, actividadReciente } from '../data/mockData';
import Badge from '../components/ui/Badge';

const colorMap = {
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-950/40', icon: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-100 dark:ring-indigo-900' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-950/40', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-900' },
    cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-950/40', icon: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-100 dark:ring-cyan-900' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900' },
};

const tipoActividad = {
    crear:    { badge: 'emerald', label: 'Crear' },
    editar:   { badge: 'indigo', label: 'Editar' },
    sistema:  { badge: 'zinc', label: 'Sistema' },
    denegado: { badge: 'red', label: 'Denegado' },
    login:    { badge: 'violet', label: 'Login' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

export default function Dashboard({ usuario }) {
    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Encabezado */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Buen día, {usuario?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Resumen de actividad del sistema</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                    <i className="fa-solid fa-calendar-day" />
                    {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statsCards.map((stat, i) => {
                    const c = colorMap[stat.color];
                    return (
                        <motion.div key={i} variants={item}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:shadow-md dark:hover:shadow-zinc-900 transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`size-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
                                    <i className={`fa-solid ${stat.icono} ${c.icon} text-sm`} />
                                </div>
                                <span className={`text-xs font-medium flex items-center gap-1 ${stat.tendencia === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                                    {stat.tendencia === 'up' && <i className="fa-solid fa-arrow-trend-up text-[10px]" />}
                                    {stat.cambio}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{stat.valor}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">{stat.titulo}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Contenido inferior */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Actividad reciente */}
                <motion.div variants={item} className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Actividad reciente</h3>
                        <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Ver todo</button>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/80">
                        {actividadReciente.map((act, i) => {
                            const tipo = tipoActividad[act.tipo];
                            return (
                                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                                    <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 text-xs font-bold">
                                        {act.usuario.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                                            <span className="font-medium">{act.usuario}</span> · {act.accion}
                                        </p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{act.tiempo}</p>
                                    </div>
                                    <Badge variante={tipo.badge}>{tipo.label}</Badge>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Acceso rápido */}
                <motion.div variants={item} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Acceso rápido</h3>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                        {[
                            { label: 'Nuevo usuario', icono: 'fa-user-plus', color: 'indigo', ruta: '/usuarios' },
                            { label: 'Crear rol', icono: 'fa-shield-plus', color: 'violet', ruta: '/roles' },
                            { label: 'Ver permisos', icono: 'fa-key', color: 'cyan', ruta: '/permisos' },
                            { label: 'Gestionar menús', icono: 'fa-bars', color: 'emerald', ruta: '/menus' },
                        ].map((link, i) => {
                            const c = colorMap[link.color];
                            return (
                                <a key={i} href={link.ruta}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${c.bg} ring-1 ${c.ring} hover:opacity-80 transition-opacity cursor-pointer`}
                                >
                                    <i className={`fa-solid ${link.icono} ${c.icon}`} />
                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center leading-tight">{link.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
