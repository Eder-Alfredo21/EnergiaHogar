import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function Login({ login }) {
    const [form, setForm]       = useState({ login: '', password: '' });
    const [error, setError]     = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.login || !form.password) {
            setError('Completa todos los campos.');
            return;
        }

        setCargando(true);
        try {
            await login(form);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) {
                const errores = err.response.data?.errors ?? {};
                const primer  = Object.values(errores).flat()[0]
                    ?? err.response.data?.message
                    ?? 'Credenciales incorrectas.';
                setError(primer);
            } else if (err.response?.status === 429) {
                setError('Demasiados intentos. Espera unos minutos.');
            } else {
                setError('Error al conectar. Intenta de nuevo.');
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
                <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-900/50 mb-4">
                    <i className="fa-solid fa-bolt text-white text-lg" />
                </div>
                <h1 className="text-white text-2xl font-bold tracking-tight">EnergíaHogar</h1>
                <p className="text-zinc-500 text-sm mt-1">Panel de administración</p>
            </div>

            {/* Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-white font-semibold text-lg mb-1">Iniciar sesión</h2>
                <p className="text-zinc-500 text-sm mb-6">Ingresa con tu email o nombre de usuario</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                            Usuario o correo
                        </label>
                        <input
                            type="text"
                            value={form.login}
                            onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                            placeholder="usuario o correo@ejemplo.com"
                            autoComplete="username"
                            disabled={cargando}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={cargando}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-400 text-sm">
                            <i className="fa-solid fa-circle-exclamation shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button type="submit" variante="primary" tamaño="lg" loading={cargando} className="w-full mt-2">
                        {cargando ? 'Verificando...' : 'Ingresar'}
                    </Button>
                </form>

                <div className="flex justify-center mt-5">
                    <Link
                        to="/forgot-password"
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>

            <p className="text-center text-zinc-700 text-xs mt-6">
                © {new Date().getFullYear()} EnergíaHogar · Todos los derechos reservados
            </p>
        </motion.div>
    );
}
