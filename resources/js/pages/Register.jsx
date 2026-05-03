import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

export default function Register({ registrar }) {
    const [form, setForm] = useState({
        name: '', username: '', email: '', password: '', password_confirmation: '',
    });
    const [errores, setErrores]   = useState({});
    const [error, setError]       = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrores({});

        if (form.password !== form.password_confirmation) {
            setErrores({ password_confirmation: 'Las contraseñas no coinciden.' });
            return;
        }

        setCargando(true);
        try {
            await registrar(form);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) {
                const e = err.response.data?.errors ?? {};
                const errs = {};
                for (const key of Object.keys(e)) errs[key] = e[key][0];
                setErrores(errs);
                if (!Object.keys(errs).length) {
                    setError(err.response.data?.message ?? 'Revisa los campos.');
                }
            } else {
                setError('Error al registrar. Intenta de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    const campo = (key) => ({
        value:    form[key],
        onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
        disabled: cargando,
        error:    errores[key],
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <Logo variante="horizontal" tamano="lg" className="mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Panel de administración</p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-zinc-900 dark:text-white font-semibold text-lg mb-1">Crear cuenta</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Completa los datos para registrarte</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input label="Nombre completo"        type="text"     icono="fa-id-card"  placeholder="Ej. Juan Pérez"       autoComplete="name"     {...campo('name')} />
                    <Input label="Usuario"                type="text"     icono="fa-at"       placeholder="usuario_ejemplo"       autoComplete="username" {...campo('username')} />
                    <Input label="Correo electrónico"     type="email"    icono="fa-envelope" placeholder="tu@correo.com"         autoComplete="email"    {...campo('email')} />
                    <Input label="Contraseña"             type="password" icono="fa-lock"     placeholder="Mínimo 8 caracteres"   autoComplete="new-password" {...campo('password')} />
                    <Input label="Confirmar contraseña"  type="password" icono="fa-lock-open" placeholder="Repite la contraseña" autoComplete="new-password" {...campo('password_confirmation')} />

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                            <i className="fa-solid fa-circle-exclamation shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button type="submit" variante="primary" tamaño="lg" loading={cargando} className="w-full mt-2">
                        {cargando ? 'Registrando...' : 'Crear cuenta'}
                    </Button>
                </form>

                <div className="flex justify-center mt-5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
                        >
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>

            <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mt-6">
                © {new Date().getFullYear()} EnergíaHogar · Todos los derechos reservados
            </p>
        </motion.div>
    );
}
