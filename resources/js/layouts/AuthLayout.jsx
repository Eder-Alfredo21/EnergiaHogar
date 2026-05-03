import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/8 dark:bg-violet-600/15 rounded-full blur-3xl" />
            </div>
            {/* Grid de puntos */}
            <div
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
                style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
            <div className="relative w-full max-w-sm">
                <Outlet />
            </div>
        </div>
    );
}
