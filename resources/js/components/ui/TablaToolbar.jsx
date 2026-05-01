export default function TablaToolbar({ buscar, setBuscar, porPagina, setPorPagina, placeholder = 'Buscar...' }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            {/* Buscador compacto */}
            <div className="relative w-56">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none" />
                <input
                    type="text"
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors"
                />
            </div>

            <div className="flex-1" />

            {/* Selector de registros por página */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Mostrar</span>
                <select
                    value={porPagina}
                    onChange={e => setPorPagina(e.target.value)}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors cursor-pointer"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">por página</span>
            </div>
        </div>
    );
}
