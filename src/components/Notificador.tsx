import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSesion } from '../hooks/useSesion'
import { usePrestamosActivos, type Prestamo } from '../hooks/usePrestamosActivos'
import { reproducirBeep } from '../lib/beep'

function Notificador() {
    const { session } = useSesion()
    const { prestamos } = usePrestamosActivos()
    const procesando = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!session) return
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [session])

    useEffect(() => {
        if (!session) return

        const intervalo = setInterval(() => {
            prestamos.forEach((p) => {
                const llevanMin = (Date.now() - new Date(p.hora_inicio).getTime()) / 60000
                const key20 = p.id + '-20'
                const key30 = p.id + '-30'

                if (llevanMin >= 30 && !p.avisado_30 && !procesando.current.has(key30)) {
                    procesando.current.add(key30)
                    avisar(p, 30)
                } else if (llevanMin >= 20 && !p.avisado_20 && !procesando.current.has(key20)) {
                    procesando.current.add(key20)
                    avisar(p, 20)
                }
            })
        }, 1000)

        return () => clearInterval(intervalo)
    }, [session, prestamos])

    async function avisar(p: Prestamo, umbral: 20 | 30) {
        reproducirBeep()
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${p.nombre_completo} lleva ${umbral} min`, {
                body: `Teléfono: ${p.numero_telefono}`,
            })
        }
        const campo = umbral === 20 ? 'avisado_20' : 'avisado_30'
        await supabase.from('prestamos').update({ [campo]: true }).eq('id', p.id)
    }

    return null
}

export default Notificador