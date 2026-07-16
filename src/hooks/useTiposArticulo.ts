import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type TipoArticulo = {
    id: string
    nombre: string
    total: number
}

export function useTiposArticulo() {
    const [tipos, setTipos] = useState<TipoArticulo[]>([])

    const cargar = useCallback(async () => {
        const { data, error } = await supabase.from('tipos_articulo').select('*').order('nombre')
        if (!error && data) setTipos(data)
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    return { tipos }
}