import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSesion } from '../hooks/useSesion'
import { usePrestamosActivos, type Prestamo } from '../hooks/usePrestamosActivos'
import { reproducirBeep } from '../lib/beep'

type Aviso = {
    id: string
    nombre: string
    telefono: string
    umbral: 20 | 30
}

function Notificador() {
    const { session } = useSesion()
    const { prestamos } = usePrestamosActivos()
    const procesando = useRef<Set<string>>(new Set())
    const [avisos, setAvisos] = useState<Aviso[]>([])

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
        setAvisos((actuales) => [
            ...actuales,
            { id: p.id + '-' + umbral, nombre: p.nombre_completo, telefono: p.numero_telefono, umbral },
        ])
        const campo = umbral === 20 ? 'avisado_20' : 'avisado_30'
        await supabase.from('prestamos').update({ [campo]: true }).eq('id', p.id)
    }

    function cerrar(id: string) {
        setAvisos((actuales) => actuales.filter((a) => a.id !== id))
    }

    if (!session || avisos.length === 0) return null

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 space-y-2 z-50 print:hidden">
            {avisos.map((a) => (
                <div key={a.id} className="bg-surface border border-accent rounded-lg shadow-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-medium text-ink">
                                {a.nombre} lleva {a.umbral} min
                            </p>
                            <p className="text-sm text-muted mt-0.5">{a.telefono}</p>
                        </div>
                        <button onClick={() => cerrar(a.id)} className="text-muted hover:text-ink text-lg leading-none">
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Notificador