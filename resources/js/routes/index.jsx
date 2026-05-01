import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

const Dashboard      = lazy(() => import('../pages/Dashboard'));
const Menus          = lazy(() => import('../pages/Menus'));
const Submenus       = lazy(() => import('../pages/Submenus'));
const Roles          = lazy(() => import('../pages/Roles'));
const Usuarios       = lazy(() => import('../pages/Usuarios'));
const Login          = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/ResetPassword'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="size-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <p className="text-sm text-zinc-400">Cargando...</p>
            </div>
        </div>
    );
}

export default function AppRoutes({ isDark, setIsDark, usuario, login, logout, tienePermiso, menus }) {
    const autenticado = !!usuario;

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ── Auth (sin sesión) ─────────────────────────────── */}
                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={autenticado ? <Navigate to="/dashboard" replace /> : <Login login={login} />}
                    />
                    <Route
                        path="/forgot-password"
                        element={autenticado ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
                    />
                    <Route
                        path="/reset-password/:token"
                        element={autenticado ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
                    />
                </Route>

                {/* ── Admin (requiere sesión) ───────────────────────── */}
                <Route
                    element={
                        autenticado
                            ? <AdminLayout
                                isDark={isDark}
                                setIsDark={setIsDark}
                                usuario={usuario}
                                logout={logout}
                                tienePermiso={tienePermiso}
                                menus={menus}
                              />
                            : <Navigate to="/login" replace />
                    }
                >
                    <Route path="/dashboard"                              element={<Dashboard usuario={usuario} />} />
                    <Route path="/configuracion/menus"                    element={<Menus />} />
                    <Route path="/configuracion/menus/:menuId/submenus"  element={<Submenus />} />
                    <Route path="/configuracion/submenus"                 element={<Submenus />} />
                    <Route path="/configuracion/roles"                    element={<Roles />} />
                    <Route path="/configuracion/usuario"                  element={<Usuarios />} />
                    <Route path="/"                                       element={<Navigate to="/dashboard" replace />} />
                </Route>

                <Route path="*" element={<Navigate to={autenticado ? '/dashboard' : '/login'} replace />} />
            </Routes>
        </Suspense>
    );
}
