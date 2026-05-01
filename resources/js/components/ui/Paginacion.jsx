export default function Paginacion({ pagina, ultimaPagina, total, setPagina }) {
    if (ultimaPagina <= 1 && total === 0) return null;

    const generarPaginas = () => {
        const paginas = [];
        for (let i = 1; i <= ultimaPagina; i++) {
            if (i === 1 || i === ultimaPagina || (i >= pagina - 1 && i <= pagina + 1)) {
                paginas.push(i);
            } else if (i === pagina - 2 || i === pagina + 2) {
                paginas.push('...');
            }
        }
        return [...new Set(paginas)];
    };

    return (
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {total > 0
                    ? `Página ${pagina} de ${ultimaPagina} · ${total} registros`
                    : 'Sin registros'}
            </p>

            {ultimaPagina > 1 && (
                <div className="flex items-center gap-1">
                    <BtnPag
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        icono="fa-chevron-left"
                    />
                    {generarPaginas().map((p, i) =>
                        p === '...'
                            ? <span key={`e${i}`} className="px-2 text-zinc-400 text-sm select-none">…</span>
                            : <BtnPag
                                key={p}
                                onClick={() => setPagina(p)}
                                activo={p === pagina}
                                label={p}
                              />
                    )}
                    <BtnPag
                        onClick={() => setPagina(p => Math.min(ultimaPagina, p + 1))}
                        disabled={pagina === ultimaPagina}
                        icono="fa-chevron-right"
                    />
                </div>
            )}
        </div>
    );
}

function BtnPag({ onClick, disabled, activo, label, icono }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                ${activo
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
        >
            {icono ? <i className={`fa-solid ${icono} text-xs`} /> : label}
        </button>
    );
}
