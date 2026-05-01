import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function AdminLayout({ isDark, setIsDark, usuario, logout, tienePermiso, menus }) {
    const [mobileAbierto, setMobileAbierto] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <Sidebar
                mobileAbierto={mobileAbierto}
                setMobileAbierto={setMobileAbierto}
                usuario={usuario}
                menus={menus}
            />
            <Topbar
                isDark={isDark}
                setIsDark={setIsDark}
                usuario={usuario}
                logout={logout}
                setMobileAbierto={setMobileAbierto}
            />
            <main className="lg:ml-[260px] min-h-screen pt-16">
                <div className="p-6 max-w-screen-2xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
