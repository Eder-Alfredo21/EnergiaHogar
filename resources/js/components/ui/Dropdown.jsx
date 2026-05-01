import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dropdown({ trigger, items, align = 'right' }) {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const alineacion = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setAbierto(v => !v)} className="cursor-pointer">
                {trigger}
            </div>
            <AnimatePresence>
                {abierto && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className={`absolute ${alineacion} top-full mt-2 min-w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/50 overflow-hidden z-50`}
                    >
                        {items.map((item, i) =>
                            item.separador ? (
                                <div key={i} className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                            ) : (
                                <button
                                    key={i}
                                    onClick={() => { item.onClick?.(); setAbierto(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left
                                        ${item.peligro ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                >
                                    {item.icono && <i className={`fa-solid ${item.icono} w-4 text-center opacity-70`} />}
                                    {item.label}
                                </button>
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
