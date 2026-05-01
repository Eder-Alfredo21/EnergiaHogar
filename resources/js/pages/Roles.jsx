import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTabla } from '../hooks/useTabla';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Paginacion from '../components/ui/Paginacion';

const URL = '/api/configuracion/roles';

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

// ── Árbol de permisos ────────────────────────────────────────────────────────

function CheckIndeterminate({ checked, indeterminate, onChange, label, negrita }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate && !checked;
    }, [indeterminate, checked]);
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <input ref={ref} type="checkbox" checked={checked} onChange={onChange}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" />
            <span className={`text-sm select-none group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors
                ${negrita ? 'font-semibold text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {label}
            </span>
        </label>
    );
}

function ArbolPermisos({ jerarquia, marcados, setMarcados }) {
    const todosIds = jerarquia.flatMap(m => [
        m.acceso?.id,
        ...m.submenus.flatMap(s => [s.acceso?.id, ...s.acciones.map(a => a.id)])
    ]).filter(Boolean);

    const todos = todosIds.length > 0 && todosIds.every(id => marcados.includes(id));
    const alguno = todosIds.some(id => marcados.includes(id));

    const toggleTodos = () => {
        setMarcados(todos ? [] : todosIds);
    };

    const toggleMenu = (menu) => {
        const ids = [
            menu.acceso?.id,
            ...menu.submenus.flatMap(s => [s.acceso?.id, ...s.acciones.map(a => a.id)])
        ].filter(Boolean);
        const todosMarcados = ids.every(id => marcados.includes(id));
        setMarcados(prev =>
            todosMarcados ? prev.filter(p => !ids.includes(p)) : [...new Set([...prev, ...ids])]
        );
    };

    const toggleSubmenu = (sub) => {
        const ids = [sub.acceso?.id, ...sub.acciones.map(a => a.id)].filter(Boolean);
        const todosMarcados = ids.every(id => marcados.includes(id));
        setMarcados(prev =>
            todosMarcados ? prev.filter(p => !ids.includes(p)) : [...new Set([...prev, ...ids])]
        );
    };

    const togglePermiso = (id) => {
        setMarcados(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-1">
            {/* Marcar todo */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                <CheckIndeterminate
                    checked={todos}
                    indeterminate={alguno && !todos}
                    onChange={toggleTodos}
                    label="Seleccionar todo"
                    negrita
                />
                {marcados.length > 0 && (
                    <button onClick={() => setMarcados([])}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                        Limpiar
                    </button>
                )}
            </div>

            {jerarquia.map(({ menu, acceso, submenus: subs }) => {
                const idsMenu = [
                    acceso?.id,
                    ...subs.flatMap(s => [s.acceso?.id, ...s.acciones.map(a => a.id)])
                ].filter(Boolean);
                const menuChecked = idsMenu.every(id => marcados.includes(id));
                const menuIndeterminate = idsMenu.some(id => marcados.includes(id)) && !menuChecked;

                return (
                    <div key={menu.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        {/* Cabecera del menú */}
                        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50">
                            <CheckIndeterminate
                                checked={menuChecked}
                                indeterminate={menuIndeterminate}
                                onChange={() => toggleMenu({ acceso, submenus: subs })}
                                label=""
                            />
                            <i className={`${menu.menu_icono} text-indigo-500 text-sm w-4 text-center`} />
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-1">{menu.menu_nombre}</span>
                            {acceso && (
                                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                                    {acceso.name}
                                </span>
                            )}
                        </div>

                        {/* Submenús */}
                        {subs.length > 0 && (
                            <div className="px-3 py-2 space-y-2">
                                {subs.map(({ submenu, acceso: subAcceso, acciones }) => {
                                    const idsSub = [subAcceso?.id, ...acciones.map(a => a.id)].filter(Boolean);
                                    const subChecked = idsSub.every(id => marcados.includes(id));
                                    const subIndeterminate = idsSub.some(id => marcados.includes(id)) && !subChecked;

                                    return (
                                        <div key={submenu.id} className="ml-4 pl-3 border-l-2 border-zinc-100 dark:border-zinc-700">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <CheckIndeterminate
                                                    checked={subChecked}
                                                    indeterminate={subIndeterminate}
                                                    onChange={() => toggleSubmenu({ acceso: subAcceso, acciones })}
                                                    label={submenu.submenu_nombre}
                                                    negrita
                                                />
                                                {subAcceso && (
                                                    <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded ml-auto">
                                                        {subAcceso.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            {acciones.length > 0 && (
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-6">
                                                    {acciones.map(accion => (
                                                        <label key={accion.id}
                                                            className="flex items-center gap-2 cursor-pointer group">
                                                            <input type="checkbox"
                                                                checked={marcados.includes(accion.id)}
                                                                onChange={() => togglePermiso(accion.id)}
                                                                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" />
                                                            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                                                                {accion.name.split('.').pop()}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function Roles() {
    const tabla = useTabla(URL);

    const [modal, setModal]           = useState(false);
    const [editando, setEditando]     = useState(null);
    const [nombre, setNombre]         = useState('');
    const [errores, setErrores]       = useState({});
    const [guardando, setGuardando]   = useState(false);
    const [confirmando, setConfirmando] = useState(null);
    const [alerta, setAlerta]         = useState(null);

    const [jerarquia, setJerarquia]   = useState([]);
    const [marcados, setMarcados]     = useState([]);
    const [cargandoPermisos, setCargandoPermisos] = useState(false);

    const mostrarAlerta = (tipo, texto) => {
        setAlerta({ tipo, texto });
        setTimeout(() => setAlerta(null), 3500);
    };

    const cargarJerarquia = async () => {
        setCargandoPermisos(true);
        try {
            const { data } = await axios.get('/api/configuracion/permisos-jerarquia');
            setJerarquia(data);
        } finally {
            setCargandoPermisos(false);
        }
    };

    const abrirCrear = async () => {
        setEditando(null); setNombre(''); setMarcados([]); setErrores({});
        await cargarJerarquia();
        setModal(true);
    };

    const abrirEditar = async (item) => {
        setEditando(item); setNombre(item.name); setErrores({});
        await cargarJerarquia();
        // Cargar permisos actuales del rol
        try {
            const { data } = await axios.get(`${URL}/${item.id}`);
            // La API puede no tener show; cargamos los permisos del rol via permissions
            // Usamos los permissions_count del listado como referencia
        } catch {}
        // Obtener IDs de permisos del rol
        try {
            const { data } = await axios.get(`/api/configuracion/roles/${item.id}/permisos`);
            setMarcados(data);
        } catch {
            // Si no existe endpoint, dejamos vacío y el usuario los marca
            setMarcados([]);
        }
        setModal(true);
    };

    const guardar = async () => {
        setGuardando(true); setErrores({});
        try {
            if (editando) {
                await axios.put(`${URL}/${editando.id}`, { name: nombre, permisos: marcados });
                mostrarAlerta('success', 'Rol actualizado.');
            } else {
                await axios.post(URL, { name: nombre, permisos: marcados });
                mostrarAlerta('success', 'Rol creado.');
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
            mostrarAlerta('success', 'Rol eliminado.');
            tabla.cargar();
        } catch (e) {
            mostrarAlerta('error', e.response?.data?.message ?? 'Error al eliminar.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="space-y-5">

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Roles</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Gestión de roles y asignación de permisos</p>
                </div>
                <Button icono="fa-plus" onClick={abrirCrear}>Nuevo rol</Button>
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
                            placeholder="Buscar por nombre..."
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Permisos</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Usuarios</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {tabla.cargando
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                                        </td>
                                    ))}</tr>
                                ))
                                : tabla.datos.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                                <i className="fa-solid fa-inbox text-3xl mb-2 block" />
                                                Sin registros
                                            </td>
                                        </tr>
                                    )
                                    : tabla.datos.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-3 py-3 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{(tabla.pagina - 1) * tabla.porPagina + idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                                                        <i className="fa-solid fa-shield text-violet-500 text-xs" />
                                                    </div>
                                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variante="violet">{item.permissions_count} permisos</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variante="indigo">{item.users_count} usuarios</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <BtnAccion titulo="Editar y asignar permisos" icono="fa-pen-to-square"
                                                        color="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                        onClick={() => abrirEditar(item)} />
                                                    <BtnAccion titulo="Eliminar" icono="fa-trash"
                                                        color={item.name === 'superadmin'
                                                            ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                                            : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}
                                                        onClick={() => item.name !== 'superadmin' && setConfirmando(item)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                    <Paginacion pagina={tabla.pagina} ultimaPagina={tabla.ultimaPagina} total={tabla.total} setPagina={tabla.setPagina} />
                </div>
            </div>

            {/* Modal Crear / Editar Rol */}
            <Modal abierto={modal} onCerrar={() => setModal(false)}
                titulo={editando ? `Editar rol: ${editando.name}` : 'Nuevo rol'}
                tamaño="xl"
                footer={
                    <>
                        <span className="text-xs text-zinc-400 mr-auto">{marcados.length} permisos seleccionados</span>
                        <Button variante="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                        <Button icono="fa-check" loading={guardando} onClick={guardar}>Guardar</Button>
                    </>
                }>
                <div className="space-y-5">
                    <Input label="Nombre del rol" placeholder="editor" icono="fa-shield"
                        value={nombre} onChange={e => setNombre(e.target.value)}
                        error={errores.name?.[0]} />

                    <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                            Permisos
                        </p>
                        {cargandoPermisos
                            ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="size-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                                </div>
                            )
                            : jerarquia.length === 0
                                ? <p className="text-sm text-zinc-400 py-4 text-center">Sin módulos disponibles</p>
                                : (
                                    <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2">
                                        <ArbolPermisos
                                            jerarquia={jerarquia}
                                            marcados={marcados}
                                            setMarcados={setMarcados}
                                        />
                                    </div>
                                )
                        }
                    </div>
                </div>
            </Modal>

            <Modal abierto={!!confirmando} onCerrar={() => setConfirmando(null)}
                titulo="Eliminar rol" tamaño="sm"
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setConfirmando(null)}>Cancelar</Button>
                        <Button variante="danger" icono="fa-trash" onClick={eliminar}>Eliminar</Button>
                    </>
                }>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Eliminar el rol <strong className="text-zinc-900 dark:text-zinc-100">"{confirmando?.name}"</strong>?
                    Los usuarios con este rol quedarán sin rol asignado.
                </p>
            </Modal>
        </motion.div>
    );
}
