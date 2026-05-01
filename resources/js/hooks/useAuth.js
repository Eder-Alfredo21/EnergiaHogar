import { useState, useCallback } from 'react';
import axios from 'axios';

const normalizarUsuario = (data) => ({
    id:       data.id,
    name:     data.name,
    username: data.username,
    email:    data.email,
    rol:      data.rol,
    permisos: data.permisos ?? [],
});

export function useAuth() {
    const [usuario, setUsuario]         = useState(null);
    const [verificando, setVerificando] = useState(true);
    const [menus, setMenus]             = useState([]);

    const cargarMenus = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/menus');
            setMenus(data);
        } catch {
            setMenus([]);
        }
    }, []);

    // Verificar sesión activa al cargar la app
    const verificarSesion = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/me');
            setUsuario(normalizarUsuario(data));
            await cargarMenus();
        } catch {
            setUsuario(null);
        } finally {
            setVerificando(false);
        }
    }, [cargarMenus]);

    // Iniciar sesión con email o username
    const login = useCallback(async ({ login, password }) => {
        await axios.post('/login', { login, password });
        const { data } = await axios.get('/api/me');
        const u = normalizarUsuario(data);
        setUsuario(u);
        await cargarMenus();
        return u;
    }, [cargarMenus]);

    // Cerrar sesión — se limpia el estado ANTES del await para que el
    // guardián de rutas ya vea usuario=null cuando se llame navigate()
    const logout = useCallback(async () => {
        setUsuario(null);
        setMenus([]);
        try {
            await axios.post('/logout');
        } catch {
            // Aunque falle el servidor, la sesión local ya está limpia
        }
    }, []);

    // Verificar permiso (superadmin siempre tiene todo)
    const tienePermiso = useCallback((permiso) => {
        if (!usuario) return false;
        if (usuario.rol === 'superadmin') return true;
        return usuario.permisos.includes(permiso);
    }, [usuario]);

    return { usuario, verificando, verificarSesion, login, logout, tienePermiso, menus };
}
