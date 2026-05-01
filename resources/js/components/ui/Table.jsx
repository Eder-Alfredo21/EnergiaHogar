export default function Table({ columnas, datos, acciones, cargando = false }) {
    if (cargando) {
        return (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <div className="animate-pulse">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700">
                            {columnas.map((col, i) => (
                                <th key={i} className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                            {acciones && <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {datos.length === 0 ? (
                            <tr>
                                <td colSpan={columnas.length + (acciones ? 1 : 0)} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                                    <i className="fa-solid fa-inbox text-2xl mb-2 block" />
                                    Sin resultados
                                </td>
                            </tr>
                        ) : datos.map((fila, i) => (
                            <tr key={i} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                {columnas.map((col, j) => (
                                    <td key={j} className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                        {col.render ? col.render(fila[col.key], fila) : fila[col.key]}
                                    </td>
                                ))}
                                {acciones && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {acciones(fila)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
