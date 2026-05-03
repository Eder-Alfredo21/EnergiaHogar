import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';

export default function Perfil({ usuario, verificarSesion, logout }) {
    const navigate = useNavigate();

    // ── Datos personales ──────────────────────────────────────────────────────
    const [datos, setDatos]           = useState({ name: usuario?.name ?? '', username: usuario?.username ?? '', email: usuario?.email ?? '' });
    const [erroresDatos, setErroresDatos] = useState({});
    const [guardandoDatos, setGuardandoDatos] = useState(false);
    const [alertaDatos, setAlertaDatos]   = useState(null);

    const guardarDatos = async (e) => {
        e.preventDefault();
        setErroresDatos({});
        setAlertaDatos(null);
        setGuardandoDatos(true);
        try {
            await axios.put('/api/perfil', datos);
            await verificarSesion();
            setAlertaDatos({ tipo: 'success', mensaje: 'Perfil actualizado correctamente.', ts: Date.now() });
        } catch (err) {
            if (err.response?.status === 422) {
                const e = err.response.data?.errors ?? {};
                const errs = {};
                for (const key of Object.keys(e)) errs[key] = e[key][0];
                setErroresDatos(errs);
            } else {
                setAlertaDatos({ tipo: 'error', mensaje: 'Error al guardar. Intenta de nuevo.', ts: Date.now() });
            }
        } finally {
            setGuardandoDatos(false);
        }
    };

    // ── Cambiar contraseña ────────────────────────────────────────────────────
    const [pass, setPass]             = useState({ current_password: '', password: '', password_confirmation: '' });
    const [erroresPass, setErroresPass] = useState({});
    const [guardandoPass, setGuardandoPass] = useState(false);
    const [alertaPass, setAlertaPass]   = useState(null);

    const guardarPassword = async (e) => {
        e.preventDefault();
        setErroresPass({});
        setAlertaPass(null);

        if (pass.password !== pass.password_confirmation) {
            setErroresPass({ password_confirmation: 'Las contraseñas no coinciden.' });
            return;
        }

        setGuardandoPass(true);
        try {
            await axios.put('/api/perfil/password', pass);
            setPass({ current_password: '', password: '', password_confirmation: '' });
            setAlertaPass({ tipo: 'success', mensaje: 'Contraseña actualizada correctamente.', ts: Date.now() });
        } catch (err) {
            if (err.response?.status === 422) {
                const e = err.response.data?.errors ?? {};
                const errs = {};
                for (const key of Object.keys(e)) errs[key] = e[key][0];
                setErroresPass(errs);
            } else {
                setAlertaPass({ tipo: 'error', mensaje: 'Error al actualizar. Intenta de nuevo.', ts: Date.now() });
            }
        } finally {
            setGuardandoPass(false);
        }
    };

    // ── Eliminar cuenta ───────────────────────────────────────────────────────
    const [modalEliminar, setModalEliminar] = useState(false);
    const [passEliminar, setPassEliminar]   = useState('');
    const [errorEliminar, setErrorEliminar] = useState('');
    const [eliminando, setEliminando]       = useState(false);

    const abrirModalEliminar = () => {
        setPassEliminar('');
        setErrorEliminar('');
        setModalEliminar(true);
    };

    const eliminarCuenta = async () => {
        setErrorEliminar('');
        setEliminando(true);
        try {
            await axios.delete('/api/perfil', { data: { password: passEliminar } });
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) {
                const e = err.response.data?.errors ?? {};
                setErrorEliminar(Object.values(e).flat()[0] ?? 'Contraseña incorrecta.');
            } else {
                setErrorEliminar('Error al eliminar. Intenta de nuevo.');
            }
            setEliminando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl"
        >
            {/* Encabezado */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Mi perfil</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Administra tu información personal y seguridad.</p>
            </div>

            <div className="space-y-6">
                {/* Datos personales */}
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Datos personales</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">Actualiza tu nombre, usuario y correo.</p>

                    {alertaDatos && (
                        <div className="mb-4">
                            <Alert key={alertaDatos.ts} tipo={alertaDatos.tipo} cerrable>{alertaDatos.mensaje}</Alert>
                        </div>
                    )}

                    <form onSubmit={guardarDatos} className="space-y-4">
                        <Input
                            label="Nombre completo"
                            type="text"
                            icono="fa-id-card"
                            value={datos.name}
                            onChange={e => setDatos(d => ({ ...d, name: e.target.value }))}
                            disabled={guardandoDatos}
                            error={erroresDatos.name}
                        />
                        <Input
                            label="Usuario"
                            type="text"
                            icono="fa-at"
                            value={datos.username}
                            onChange={e => setDatos(d => ({ ...d, username: e.target.value }))}
                            disabled={guardandoDatos}
                            error={erroresDatos.username}
                        />
                        <Input
                            label="Correo electrónico"
                            type="email"
                            icono="fa-envelope"
                            value={datos.email}
                            onChange={e => setDatos(d => ({ ...d, email: e.target.value }))}
                            disabled={guardandoDatos}
                            error={erroresDatos.email}
                        />
                        <div className="flex justify-end pt-1">
                            <Button type="submit" variante="primary" loading={guardandoDatos}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Cambiar contraseña */}
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Cambiar contraseña</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">Usa una contraseña segura de al menos 8 caracteres.</p>

                    {alertaPass && (
                        <div className="mb-4">
                            <Alert key={alertaPass.ts} tipo={alertaPass.tipo} cerrable>{alertaPass.mensaje}</Alert>
                        </div>
                    )}

                    <form onSubmit={guardarPassword} className="space-y-4">
                        <Input
                            label="Contraseña actual"
                            type="password"
                            icono="fa-lock"
                            placeholder="Tu contraseña actual"
                            value={pass.current_password}
                            onChange={e => setPass(p => ({ ...p, current_password: e.target.value }))}
                            disabled={guardandoPass}
                            error={erroresPass.current_password}
                        />
                        <Input
                            label="Nueva contraseña"
                            type="password"
                            icono="fa-lock-open"
                            placeholder="Mínimo 8 caracteres"
                            value={pass.password}
                            onChange={e => setPass(p => ({ ...p, password: e.target.value }))}
                            disabled={guardandoPass}
                            error={erroresPass.password}
                        />
                        <Input
                            label="Confirmar nueva contraseña"
                            type="password"
                            icono="fa-lock-open"
                            placeholder="Repite la nueva contraseña"
                            value={pass.password_confirmation}
                            onChange={e => setPass(p => ({ ...p, password_confirmation: e.target.value }))}
                            disabled={guardandoPass}
                            error={erroresPass.password_confirmation}
                        />
                        <div className="flex justify-end pt-1">
                            <Button type="submit" variante="primary" loading={guardandoPass}>
                                Actualizar contraseña
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Zona peligrosa */}
                <section className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">Zona peligrosa</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                        Eliminar tu cuenta es permanente e irreversible. Se perderán todos tus datos.
                    </p>
                    <Button variante="danger" onClick={abrirModalEliminar}>
                        Eliminar mi cuenta
                    </Button>
                </section>
            </div>

            {/* Modal confirmación eliminar cuenta */}
            <Modal
                abierto={modalEliminar}
                onCerrar={() => setModalEliminar(false)}
                titulo="Eliminar cuenta"
                tamaño="sm"
                footer={
                    <>
                        <Button variante="secondary" onClick={() => setModalEliminar(false)} disabled={eliminando}>
                            Cancelar
                        </Button>
                        <Button variante="danger" loading={eliminando} onClick={eliminarCuenta}>
                            Eliminar definitivamente
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Esta acción no se puede deshacer. Ingresa tu contraseña para confirmar.
                </p>
                <Input
                    label="Contraseña"
                    type="password"
                    icono="fa-lock"
                    placeholder="Tu contraseña actual"
                    value={passEliminar}
                    onChange={e => setPassEliminar(e.target.value)}
                    disabled={eliminando}
                    error={errorEliminar}
                />
            </Modal>
        </motion.div>
    );
}
