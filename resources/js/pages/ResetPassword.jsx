import { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

export default function ResetPassword() {
    const { token }               = useParams();
    const [searchParams]          = useSearchParams();
    const navigate                = useNavigate();

    const [form, setForm]         = useState({
        email:                 searchParams.get('email') ?? '',
        password:              '',
        password_confirmation: '',
    });
    const [error, setError]       = useState('');
    const [errores, setErrores]   = useState({});
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrores({});

        if (form.password !== form.password_confirmation) {
            setErrores({ password_confirmation: ['Las contraseñas no coinciden.'] });
            return;
        }

        setCargando(true);
        try {
            await axios.post('/reset-password', {
                token,
                email:                 form.email,
                password:              form.password,
                password_confirmation: form.password_confirmation,
            });

            navigate('/login', {
                replace: true,
                state: { mensaje: 'Contraseña restablecida. Inicia sesión.' },
            });
        } catch (err) {
            if (err.response?.status === 422) {
                const e = err.response.data?.errors ?? {};
                setErrores(e);
                setError(err.response.data?.message ?? 'Revisa los datos ingresados.');
            } else {
                setError('Error al restablecer. Solicita un nuevo enlace.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <Logo variante="horizontal" tamano="lg" className="mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nueva contraseña</p>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-zinc-900 dark:text-white font-semibold text-lg mb-1">Restablecer contraseña</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Ingresa tu nueva contraseña.</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input
                        label="Correo electrónico"
                        type="email"
                        icono="fa-envelope"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        disabled={cargando}
                        error={errores.email?.[0]}
                    />
                    <Input
                        label="Nueva contraseña"
                        type="password"
                        icono="fa-lock"
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        disabled={cargando}
                        error={errores.password?.[0]}
                    />
                    <Input
                        label="Confirmar contraseña"
                        type="password"
                        icono="fa-lock-open"
                        placeholder="Repite la contraseña"
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                        disabled={cargando}
                        error={errores.password_confirmation?.[0]}
                    />

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                            <i className="fa-solid fa-circle-exclamation shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button type="submit" variante="primary" tamaño="lg" loading={cargando} className="w-full">
                        {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
                    </Button>
                </form>

                <div className="flex justify-center mt-5">
                    <Link
                        to="/login"
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
                    >
                        <i className="fa-solid fa-arrow-left text-[10px]" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
