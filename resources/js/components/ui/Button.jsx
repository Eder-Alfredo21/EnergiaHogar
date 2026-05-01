const variantes = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900',
    secondary: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 dark:shadow-red-900',
    ghost:     'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200',
    warning:   'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900',
};

const tamaños = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({ children, variante = 'primary', tamaño = 'md', icono, iconoPos = 'left', loading, className = '', ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantes[variante]} ${tamaños[tamaño]} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <i className="fa-solid fa-spinner fa-spin" />}
            {!loading && icono && iconoPos === 'left' && <i className={`fa-solid ${icono}`} />}
            {children}
            {!loading && icono && iconoPos === 'right' && <i className={`fa-solid ${icono}`} />}
        </button>
    );
}
