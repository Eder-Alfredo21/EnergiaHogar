import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTabla } from '../hooks/useTabla';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Paginacion from '../components/ui/Paginacion';

const URL = '/api/configuracion/usuarios';
const FORM_VACIO = { name: '', username: '', email: '', password: '', rol_id: '' };

function BtnAccion({ titulo, icono, color, onClick }) {
    return (
        <button title={titulo} onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${color}`}>
            <i className={`fa-solid ${icono} text-xs`} />
        </button>
    );
}

function ThOrdenable({ col, label, ordenar, direccion, toggleOrden }) {
    const activo = ordenar === col;
    return (
        <th onClick={() => toggleOrden(col)}
            className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
                {label}
                <span className={activo ? 'text-indigo-500' : 'text-zinc-300 dark:text-zinc-600'}>
                    <i className={`fa-solid fa-${activo && direccion === 'desc' ? 'arrow-down' : 'arrow-up'} text-[10px]`} />
                </span>
            </span>
        </th>
    );
}

export default function Usuarios() {
    const tabla = useTabla(URL);

    const [modal, setModal]           = useState(false);
    const [editando, setEditando]     = useState(null);
    const [form, setForm]             = useState(FORM_VACIO);
    const [errores, setErrores]       = useState({});
    const [guardando, setGuardando]   = useState(false);
    const [confirmando, setConfirmando] = useState(null);
    const [alerta, setAlerta]         = useState(null);
    const [roles, setRoles]           = useState([]);

    useEffect(() => {
        axios.get('/api/configuracion/roles-lista')
            .then(r => setRoles(r.data))
            .catch(() => {});
    }, []);

    const mostrarAlerta = (tipo, texto) => {
        setAlerta({ tipo, texto });
        setTimeout(() => setAlerta(null), 3500);
    };

    const abrirCrear = () => {
        setEditando(null); setForm(FORM_VACIO); setErrores({}); setModal(true);
    };

    const abrirEditar = (item) => {
        setEditando(item);
        setForm({
            name:     item.name,
            username: item.username,
            email:    item.email,
            password: '',
            rol_id:   item.roles?.[0]?.id ?? '',
        });
        setErrores({}); setModal(true);
    };

    const cambiarForm = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

    const guardar = async () => {
        setGuardando(true); setErrores({});
        const payload = { ...form };
        if (editando && !payload.password) delete payload.password;
        try {
            if (editando) {
                await axios.put(`${URL}/${editando.id}`, payload);
                mostrarAlerta('success', 'Usuario actualizado.');
            } else {
                await axios.post(URL, payload);
                mostrarAlerta('success', 'Usuario creado.');
            }
            setModal(false);
            tabla.cargar();
        } catch (e) {
            if (e.response?.status === 422) setErrores(e.response.data.errors ?? {});
            else mostrarAlerta('error', e.response?.data?.message ?? 'Error al guardar.');
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async () => {
        try {
            await axios.delete(`${URL}/${confirmando.id}`);
            setConfirmando(null);
            mostrarAlerta('success', 'Usuario eliminado.');
            tabla.cargar();
        } catch (e) {
            mostrarAlerta('error', e.response?.data?.message ?? 'Error al eliminar.');
        }
    };

    const colorRol = (nombre) => {
        if (!nombre) return 'zinc';
        if (nombre === 'superadmin') return 'violet';
        return 'indigo';
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="space-y-5">

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Usuarios</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Gestión de usuarios del sistema</p>
                </div>
                <Button icono="fa-user-plus" onClick={abrirCrear}>Nuevo usuario</Button>
            </div>

            {alerta && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border
                    ${alerta.tipo === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                    <i className={`fa-solid ${alerta.tipo === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                    {alerta.texto}
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                        <input type="text" value={tabla.buscar} onChange={e => tabla.setBuscar(e.target.value)}
                            placeholder="Buscar por nombre, usuario o email..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors" />
                    </div>
                    <span className="text-xs text-zinc-400 shrink-0">{tabla.total} registros</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-zinc-400">Mostrar</span>
                        <select
                            value={tabla.porPagina}
                            onChange={e => tabla.setPorPagina(e.target.value)}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors cursor-pointer"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider w-10">#</th>
                                <ThOrdenable col="name" label="Nombre" {...tabla} />
                                <ThOrdenable col="username" label="Usuario" {...tabla} />
                                <ThOrdenable col="email" label="Correo" {...tabla} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rol</th>
                                <ThOrdenable col="created_at" label="Registrado" {...tabla} />
                                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {tabla.cargando
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                        </td>
                                    ))}</tr>
                                ))
                                : tabla.datos.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                                <i className="fa-solid fa-inbox text-3xl mb-2 block" />
                                                Sin registros
                                            </td>
                                        </tr>
                                    )
                                    : tabla.datos.map((item, idx) => {
                                        const rolNombre = item.roles?.[0]?.name;
                                        return (
                                            <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-3 py-3 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{(tabla.pagina - 1) * tabla.porPagina + idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {item.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">@{item.username}</td>
                                                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.email}</td>
                                                <td className="px-4 py-3">
                                                    {rolNombre
                                                        ? <Badge variante={colorRol(rolNombre)}>{rolNombre}</Badge>
                                                        : <span className="text-zinc-400 text-xs">Sin rol</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                                                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-0.5">
                                                        <BtnAccion titulo="Editar" icono="fa-pen-to-square"
                                                            color="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                            onClick={() => abrirEditar(item)} />
                                                        <BtnAccion titulo="Eliminar" icono="fa-trash"
                                                            color="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => setConfirmando(item)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                            }
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                    <Paginacion pagina={tabla.pagina} ultimaPagina={tabla.ultimaPagina} total={tabla.total} setPagina={tabla.setPagina} />
                </div>
            </div>

            {/* Modal Crear / Editar */}
            <Modal abierto={modal} onCerrar={() => setModal(false)}
                titulo={editando ? 'Editar usuario' : 'Nuevo usuario'}
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                        <Button icono="fa-check" loading={guardando} onClick={guardar}>Guardar</Button>
                    </>
                }>
                <div className="space-y-4">
                    <Input label="Nombre completo" placeholder="Juan Pérez" icono="fa-user"
                        value={form.name} onChange={e => cambiarForm('name', e.target.value)}
                        error={errores.name?.[0]} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Usuario" placeholder="juanp" icono="fa-at"
                            value={form.username} onChange={e => cambiarForm('username', e.target.value)}
                            error={errores.username?.[0]} />
                        <Input label="Correo electrónico" type="email" placeholder="juan@email.com" icono="fa-envelope"
                            value={form.email} onChange={e => cambiarForm('email', e.target.value)}
                            error={errores.email?.[0]} />
                    </div>
                    <Input
                        label={editando ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                        type="password" placeholder="••••••••" icono="fa-lock"
                        value={form.password} onChange={e => cambiarForm('password', e.target.value)}
                        error={errores.password?.[0]} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rol</label>
                        <select
                            value={form.rol_id}
                            onChange={e => cambiarForm('rol_id', e.target.value)}
                            className={`w-full rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 transition-colors
                                ${errores.rol_id ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700'}`}>
                            <option value="">Seleccionar rol...</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {errores.rol_id && <p className="text-xs text-red-500">{errores.rol_id[0]}</p>}
                    </div>
                </div>
            </Modal>

            <Modal abierto={!!confirmando} onCerrar={() => setConfirmando(null)}
                titulo="Eliminar usuario" tamaño="sm"
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setConfirmando(null)}>Cancelar</Button>
                        <Button variante="danger" icono="fa-trash" onClick={eliminar}>Eliminar</Button>
                    </>
                }>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Eliminar al usuario <strong className="text-zinc-900 dark:text-zinc-100">"{confirmando?.name}"</strong>?
                    Esta acción no se puede deshacer.
                </p>
            </Modal>
        </motion.div>
    );
}
