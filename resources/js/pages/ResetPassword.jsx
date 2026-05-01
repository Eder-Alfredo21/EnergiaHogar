import { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';

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

    const campo = (key) => ({
        value: form[key],
        onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
        disabled: cargando,
        className: `w-full rounded-lg border ${errores[key] ? 'border-red-600' : 'border-zinc-700'} bg-zinc-800 text-zinc-100 placeholder-zinc-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-900/50 mb-4">
                    <i className="fa-solid fa-bolt text-white text-lg" />
                </div>
                <h1 className="text-white text-2xl font-bold tracking-tight">EnergíaHogar</h1>
                <p className="text-zinc-500 text-sm mt-1">Nueva contraseña</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-white font-semibold text-lg mb-1">Restablecer contraseña</h2>
                <p className="text-zinc-500 text-sm mb-6">Ingresa tu nueva contraseña.</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Correo electrónico</label>
                        <input type="email" autoComplete="email" placeholder="tu@correo.com" {...campo('email')} />
                        {errores.email && <p className="text-xs text-red-400 mt-1">{errores.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nueva contraseña</label>
                        <input type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...campo('password')} />
                        {errores.password && <p className="text-xs text-red-400 mt-1">{errores.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirmar contraseña</label>
                        <input type="password" autoComplete="new-password" placeholder="Repite la contraseña" {...campo('password_confirmation')} />
                        {errores.password_confirmation && (
                            <p className="text-xs text-red-400 mt-1">{errores.password_confirmation[0]}</p>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-400 text-sm">
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
                        className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1.5"
                    >
                        <i className="fa-solid fa-arrow-left text-[10px]" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
