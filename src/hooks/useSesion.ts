import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export function useSesion() {
    const [session, setSession] = useState<Session | null>(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setCargando(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    return { session, cargando }
}