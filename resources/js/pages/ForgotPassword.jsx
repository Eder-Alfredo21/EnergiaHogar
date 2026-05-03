import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';

export default function ForgotPassword() {
    const [email, setEmail]       = useState('');
    const [enviado, setEnviado]   = useState(false);
    const [error, setError]       = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Ingresa tu correo electrónico.');
            return;
        }

        setCargando(true);
        try {
            await axios.post('/forgot-password', { email });
            setEnviado(true);
        } catch (err) {
            if (err.response?.status === 422) {
                const errores = err.response.data?.errors ?? {};
                const primer  = Object.values(errores).flat()[0]
                    ?? err.response.data?.message
                    ?? 'Correo no encontrado.';
                setError(primer);
            } else {
                setError('Error al enviar el correo. Intenta de nuevo.');
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
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Recuperar contraseña</p>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                {enviado ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="size-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-envelope-circle-check text-emerald-500 dark:text-emerald-400 text-2xl" />
                        </div>
                        <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">Correo enviado</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            Revisa tu bandeja de entrada. Te enviamos un enlace para restablecer tu contraseña.
                        </p>
                        <Link
                            to="/login"
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                            ← Volver al inicio de sesión
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <h2 className="text-zinc-900 dark:text-white font-semibold text-lg mb-1">¿Olvidaste tu contraseña?</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            Ingresa tu correo y te enviaremos un enlace para restablecerla.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <Input
                                label="Correo electrónico"
                                type="email"
                                icono="fa-envelope"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                autoComplete="email"
                                disabled={cargando}
                            />

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                                    <i className="fa-solid fa-circle-exclamation shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" variante="primary" tamaño="lg" loading={cargando} className="w-full">
                                {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
                    </>
                )}
            </div>
        </motion.div>
    );
}
