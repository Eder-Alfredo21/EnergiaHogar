import { useState } from 'react';
import { motion } from 'framer-motion';
import { permisosMock } from '../data/mockData';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const modulos = [...new Set(permisosMock.map(p => p.modulo))];

export default function Permisos() {
    const [moduloActivo, setModuloActivo] = useState('Todos');

    const filtrados = moduloActivo === 'Todos'
        ? permisosMock
        : permisosMock.filter(p => p.modulo === moduloActivo);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Permisos</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{permisosMock.length} permisos en el sistema</p>
                </div>
                <Button icono="fa-plus" variante="secondary">Nuevo permiso</Button>
            </div>

            {/* Filtros por módulo */}
            <div className="flex items-center gap-2 flex-wrap">
                {['Todos', ...modulos].map(m => (
                    <button
                        key={m}
                        onClick={() => setModuloActivo(m)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                            moduloActivo === m
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Grid de permisos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtrados.map((p) => (
                    <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                                <i className="fa-solid fa-key text-indigo-600 dark:text-indigo-400 text-xs" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                    <i className="fa-solid fa-pen text-xs" />
                                </button>
                            </div>
                        </div>
                        <p className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">{p.nombre}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{p.descripcion}</p>
                        <div className="mt-3">
                            <Badge variante="zinc">{p.modulo}</Badge>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
