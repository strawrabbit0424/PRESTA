import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSesion } from '../hooks/useSesion'
import { usePrestamosActivos, type Prestamo } from '../hooks/usePrestamosActivos'
import { reproducirBeep, activarAudio } from '../lib/beep'

function Notificador() {
    const { session } = useSesion()
    const { prestamos } = usePrestamosActivos()
    const procesando = useRef<Set<string>>(new Set())
    const [permiso, setPermiso] = useState<NotificationPermission>(
        'Notification' in window ? Notification.permission : 'denied'
    )

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

    function activar() {
        activarAudio()
        if ('Notification' in window) {
            Notification.requestPermission().then(setPermiso)
        }
    }

    if (!session || permiso === 'granted') return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 flex items-center justify-between gap-3 z-50 print:hidden">
            <p className="text-sm text-muted">Activa los avisos para ver y escuchar la alerta de los 20/30 min.</p>
            <button
                onClick={activar}
                className="rounded-md bg-accent px-3.5 py-2 text-white text-sm font-medium hover:bg-accent-hover whitespace-nowrap"
            >
                Activar avisos
            </button>
        </div>
    )
}

export default Notificador