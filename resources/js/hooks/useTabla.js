import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export function useTabla(url, filtrosIniciales = {}) {
    const [datos, setDatos]               = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [total, setTotal]               = useState(0);
    const [ultimaPagina, setUltimaPagina] = useState(1);
    const [buscar, setBuscarInt]          = useState('');
    const [pagina, setPaginaInt]          = useState(1);
    const [porPagina, setPorPaginaInt]    = useState(10);
    const [ordenar, setOrdenar]           = useState('');
    const [direccion, setDireccion]       = useState('asc');

    const filtrosRef = useRef(filtrosIniciales);

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const { data } = await axios.get(url, {
                params: {
                    buscar,
                    page: pagina,
                    por_pagina: porPagina,
                    ordenar,
                    direccion,
                    ...filtrosRef.current,
                },
            });
            setDatos(data.data);
            setTotal(data.total);
            setUltimaPagina(data.last_page);
        } catch {
            setDatos([]);
        } finally {
            setCargando(false);
        }
    }, [url, buscar, pagina, porPagina, ordenar, direccion]);

    useEffect(() => { cargar(); }, [cargar]);

    const setBuscar    = (v) => { setBuscarInt(v);       setPaginaInt(1); };
    const setPagina    = (p) => setPaginaInt(p);
    const setPorPagina = (v) => { setPorPaginaInt(Number(v)); setPaginaInt(1); };

    const toggleOrden = (col) => {
        if (ordenar === col) {
            setDireccion(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenar(col);
            setDireccion('asc');
        }
        setPaginaInt(1);
    };

    return {
        datos, cargando, total, ultimaPagina,
        buscar, setBuscar,
        pagina, setPagina,
        porPagina, setPorPagina,
        ordenar, direccion, toggleOrden,
        cargar,
    };
}
