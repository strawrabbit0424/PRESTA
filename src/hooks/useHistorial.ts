import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type PrestamoFinalizado = {
    id: string
    tipo_articulo_id: string
    nombre_completo: string
    tipo_identificacion: string
    numero_telefono: string
    hora_inicio: string
    hora_fin: string
}

export type GrupoDia = {
    fecha: string
    prestamos: PrestamoFinalizado[]
}

export function useHistorial() {
    const [grupos, setGrupos] = useState<GrupoDia[]>([])
    const [cargando, setCargando] = useState(true)

    const cargar = useCallback(async () => {
        setCargando(true)
        const { data, error } = await supabase
            .from('prestamos')
            .select('*')
            .eq('estado', 'finalizado')
            .order('hora_inicio', { ascending: false })

        if (!error && data) {
            const porFecha = new Map<string, PrestamoFinalizado[]>()

            data.forEach((p) => {
                const fecha = new Date(p.hora_inicio).toLocaleDateString('en-CA')
                if (!porFecha.has(fecha)) porFecha.set(fecha, [])
                porFecha.get(fecha)!.push(p)
            })

            const listaGrupos: GrupoDia[] = Array.from(porFecha.entries())
                .map(([fecha, prestamos]) => ({ fecha, prestamos }))
                .sort((a, b) => b.fecha.localeCompare(a.fecha))

            setGrupos(listaGrupos)
        }
        setCargando(false)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    return { grupos, cargando }
}