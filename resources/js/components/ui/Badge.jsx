const variantes = {
    indigo:   'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-indigo-200 dark:ring-indigo-800',
    emerald:  'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
    red:      'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-800',
    amber:    'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
    zinc:     'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ring-zinc-200 dark:ring-zinc-700',
    violet:   'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ring-violet-200 dark:ring-violet-800',
    cyan:     'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-800',
};

export default function Badge({ children, variante = 'indigo', dot = false }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantes[variante]}`}>
            {dot && <span className="size-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}
