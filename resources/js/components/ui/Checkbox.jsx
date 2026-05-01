export default function Checkbox({ label, descripcion, ...props }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    {...props}
                />
                <div className="size-4 rounded border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 transition-all
                    peer-checked:bg-indigo-600 peer-checked:border-indigo-600
                    peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300 dark:peer-focus-visible:ring-indigo-800" />
                <i className="fa-solid fa-check text-white text-[9px] absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            {(label || descripcion) && (
                <div>
                    {label && <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>}
                    {descripcion && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">{descripcion}</p>}
                </div>
            )}
        </label>
    );
}
