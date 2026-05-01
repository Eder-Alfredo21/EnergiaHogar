import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTabla } from '../hooks/useTabla';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Paginacion from '../components/ui/Paginacion';

const URL = '/api/configuracion/submenus';
const FORM_VACIO = { submenu_nombre: '', submenu_funcion: '', submenu_orden: '', submenu_mostrar: true };

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

function SubmenusConMenu({ menuId }) {
    const navigate = useNavigate();
    const tabla = useTabla(URL, menuId ? { menu_id: menuId } : {});

    const [menuInfo, setMenuInfo]   = useState(null);
    const [modal, setModal]         = useState(false);
    const [editando, setEditando]   = useState(null);
    const [form, setForm]           = useState(FORM_VACIO);
    const [errores, setErrores]     = useState({});
    const [guardando, setGuardando] = useState(false);
    const [confirmando, setConfirmando] = useState(null);
    const [alerta, setAlerta]       = useState(null);

    useEffect(() => {
        if (menuId) {
            axios.get(`/api/configuracion/menus/${menuId}`)
                .then(r => setMenuInfo(r.data))
                .catch(() => {});
        }
    }, [menuId]);

    const mostrarAlerta = (tipo, texto) => {
        setAlerta({ tipo, texto });
        setTimeout(() => setAlerta(null), 3500);
    };

    const abrirCrear = () => {
        setEditando(null);
        setForm({ ...FORM_VACIO, menu_id: menuId });
        setErrores({}); setModal(true);
    };

    const abrirEditar = (item) => {
        setEditando(item);
        setForm({
            menu_id:         item.menu_id,
            submenu_nombre:  item.submenu_nombre,
            submenu_funcion: item.submenu_funcion,
            submenu_orden:   item.submenu_orden,
            submenu_mostrar: !!item.submenu_mostrar,
        });
        setErrores({}); setModal(true);
    };

    const cambiarForm = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

    const guardar = async () => {
        setGuardando(true); setErrores({});
        try {
            if (editando) {
                await axios.put(`${URL}/${editando.id}`, form);
                mostrarAlerta('success', 'Submenú actualizado.');
            } else {
                await axios.post(URL, form);
                mostrarAlerta('success', 'Submenú creado.');
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

    const cambiarEstado = async (item) => {
        try {
            await axios.patch(`${URL}/${item.id}/estado`);
            tabla.cargar();
        } catch { mostrarAlerta('error', 'Error al cambiar estado.'); }
    };

    const eliminar = async () => {
        try {
            await axios.delete(`${URL}/${confirmando.id}`);
            setConfirmando(null);
            mostrarAlerta('success', 'Submenú eliminado.');
            tabla.cargar();
        } catch (e) {
            mostrarAlerta('error', e.response?.data?.message ?? 'Error al eliminar.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="space-y-5">

            {/* Header con breadcrumb */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                        <button onClick={() => navigate('/configuracion/menus')}
                            className="hover:text-indigo-500 transition-colors">Menús</button>
                        <i className="fa-solid fa-chevron-right text-[10px]" />
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                            {menuInfo?.menu_nombre ?? 'Cargando...'}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Submenús</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Gestión de submenús del menú seleccionado</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variante="secondary" icono="fa-arrow-left" onClick={() => navigate('/configuracion/menus')}>
                        Volver
                    </Button>
                    <Button icono="fa-plus" onClick={abrirCrear}>Nuevo submenú</Button>
                </div>
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
                            placeholder="Buscar por nombre o función..."
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
                                <ThOrdenable col="submenu_nombre" label="Nombre" {...tabla} />
                                <ThOrdenable col="submenu_funcion" label="Función" {...tabla} />
                                <ThOrdenable col="submenu_orden" label="Orden" {...tabla} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visible</th>
                                <ThOrdenable col="submenu_estado" label="Estado" {...tabla} />
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
                                    : tabla.datos.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-3 py-3 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{(tabla.pagina - 1) * tabla.porPagina + idx + 1}</td>
                                            <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{item.submenu_nombre}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{item.submenu_funcion}</td>
                                            <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.submenu_orden}</td>
                                            <td className="px-4 py-3">
                                                <Badge variante={item.submenu_mostrar ? 'indigo' : 'zinc'}>
                                                    {item.submenu_mostrar ? 'Visible' : 'Oculto'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variante={item.submenu_estado === 1 ? 'emerald' : 'zinc'} dot>
                                                    {item.submenu_estado === 1 ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <BtnAccion titulo="Editar" icono="fa-pen-to-square"
                                                        color="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                        onClick={() => abrirEditar(item)} />
                                                    <BtnAccion
                                                        titulo={item.submenu_estado === 1 ? 'Deshabilitar' : 'Habilitar'}
                                                        icono={item.submenu_estado === 1 ? 'fa-ban' : 'fa-circle-check'}
                                                        color={item.submenu_estado === 1
                                                            ? 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}
                                                        onClick={() => cambiarEstado(item)} />
                                                    <BtnAccion titulo="Eliminar" icono="fa-trash"
                                                        color="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => setConfirmando(item)} />
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

            <Modal abierto={modal} onCerrar={() => setModal(false)}
                titulo={editando ? 'Editar submenú' : 'Nuevo submenú'}
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                        <Button icono="fa-check" loading={guardando} onClick={guardar}>Guardar</Button>
                    </>
                }>
                <div className="space-y-4">
                    <Input label="Nombre" placeholder="Usuarios" icono="fa-tag"
                        value={form.submenu_nombre} onChange={e => cambiarForm('submenu_nombre', e.target.value)}
                        error={errores.submenu_nombre?.[0]} />
                    <Input label="Función (identificador único)" placeholder="usuarios" icono="fa-code"
                        value={form.submenu_funcion} onChange={e => cambiarForm('submenu_funcion', e.target.value.toLowerCase())}
                        error={errores.submenu_funcion?.[0]} />
                    <Input label="Orden" type="number" min="1" placeholder="1" icono="fa-sort"
                        value={form.submenu_orden} onChange={e => cambiarForm('submenu_orden', e.target.value)}
                        error={errores.submenu_orden?.[0]} />
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.submenu_mostrar}
                            onChange={e => cambiarForm('submenu_mostrar', e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Visible en el sidebar</span>
                    </label>
                </div>
            </Modal>

            <Modal abierto={!!confirmando} onCerrar={() => setConfirmando(null)}
                titulo="Eliminar submenú" tamaño="sm"
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setConfirmando(null)}>Cancelar</Button>
                        <Button variante="danger" icono="fa-trash" onClick={eliminar}>Eliminar</Button>
                    </>
                }>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Eliminar <strong className="text-zinc-900 dark:text-zinc-100">"{confirmando?.submenu_nombre}"</strong>?
                    Se eliminarán todos sus permisos asociados.
                </p>
            </Modal>
        </motion.div>
    );
}

export default function Submenus() {
    const { menuId } = useParams();
    return <SubmenusConMenu key={menuId ?? 'all'} menuId={menuId ? parseInt(menuId) : null} />;
}
