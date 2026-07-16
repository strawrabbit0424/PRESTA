import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export type Prestamo = {
    id: string
    tipo_articulo_id: string
    tipo_articulo_2_id: string | null
    nombre_completo: string
    tipo_identificacion: string
    numero_telefono: string
    hora_inicio: string
    estado: string
    avisado_20: boolean
    avisado_30: boolean
}

export function usePrestamosActivos() {
    const [prestamos, setPrestamos] = useState<Prestamo[]>([])
    const [cargando, setCargando] = useState(true)
    const idCanal = useRef(`prestamos-activos-${Math.random().toString(36).slice(2)}`)

    const cargar = useCallback(async () => {
        const { data, error } = await supabase
            .from('prestamos')
            .select('*')
            .eq('estado', 'activo')
            .order('hora_inicio', { ascending: true })

        if (!error && data) setPrestamos(data)
        setCargando(false)
    }, [])

    useEffect(() => {
        cargar()

        const canal = supabase
            .channel(idCanal.current)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'prestamos' }, () => {
                cargar()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(canal)
        }
    }, [cargar])

    return { prestamos, cargando, recargar: cargar }
}