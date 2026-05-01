import { useState } from 'react';

const variantes = {
    info:    { base: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200', icono: 'fa-circle-info text-indigo-500' },
    success: { base: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200', icono: 'fa-circle-check text-emerald-500' },
    warning: { base: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200', icono: 'fa-triangle-exclamation text-amber-500' },
    error:   { base: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200', icono: 'fa-circle-xmark text-red-500' },
};

export default function Alert({ tipo = 'info', titulo, children, cerrable = false }) {
    const [visible, setVisible] = useState(true);
    const v = variantes[tipo];
    if (!visible) return null;

    return (
        <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${v.base}`}>
            <i className={`fa-solid ${v.icono} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
                {titulo && <p className="font-semibold mb-0.5">{titulo}</p>}
                <p className="opacity-90">{children}</p>
            </div>
            {cerrable && (
                <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-xmark" />
                </button>
            )}
        </div>
    );
}
