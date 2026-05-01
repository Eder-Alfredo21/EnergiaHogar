export default function Input({ label, error, icono, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icono && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
                        <i className={`fa-solid ${icono} text-sm`} />
                    </span>
                )}
                <input
                    className={`w-full rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors text-sm
                        ${error ? 'border-red-400 focus:ring-red-300' : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'}
                        ${icono ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'}
                        focus:outline-none focus:ring-2 ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
