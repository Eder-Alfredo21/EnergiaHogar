import './bootstrap';
import '../css/app.css';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/index';
import { useDarkMode } from './hooks/useDarkMode';
import { useAuth } from './hooks/useAuth';

function App() {
    const [isDark, setIsDark] = useDarkMode();
    const { usuario, verificando, verificarSesion, login, logout, tienePermiso, menus } = useAuth();

    // Verificar sesión activa al montar (útil tras F5)
    useEffect(() => {
        verificarSesion();
    }, []);

    if (verificando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-sm text-zinc-400">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <AppRoutes
                isDark={isDark}
                setIsDark={setIsDark}
                usuario={usuario}
                login={login}
                logout={logout}
                tienePermiso={tienePermiso}
                menus={menus}
            />
        </BrowserRouter>
    );
}

const el = document.getElementById('app');
if (el) createRoot(el).render(<App />);
