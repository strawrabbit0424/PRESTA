import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { usePrestamosActivos } from '../hooks/usePrestamosActivos'
import { useTiposArticulo } from '../hooks/useTiposArticulo'

function fmt(min: number) {
    const s = Math.abs(Math.round(min * 60))
    const m = Math.floor(s / 60)
    const seg = s % 60
    const signo = min < 0 ? '-' : ''
    return signo + m + ':' + String(seg).padStart(2, '0')
}

function Dashboard() {
    const navigate = useNavigate()
    const { prestamos, recargar } = usePrestamosActivos()
    const { tipos } = useTiposArticulo()
    const [expandido, setExpandido] = useState<string | null>(null)
    const [, forzarRender] = useState(0)

    useEffect(() => {
        const intervalo = setInterval(() => forzarRender((n) => n + 1), 1000)
        return () => clearInterval(intervalo)
    }, [])

    async function marcarDevuelta(id: string) {
        await supabase
            .from('prestamos')
            .update({ estado: 'finalizado', hora_fin: new Date().toISOString() })
            .eq('id', id)
        recargar()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const prestamosOrdenados = [...prestamos].sort((a, b) => {
        const faltaA = 30 - (Date.now() - new Date(a.hora_inicio).getTime()) / 60000
        const faltaB = 30 - (Date.now() - new Date(b.hora_inicio).getTime()) / 60000
        return faltaA - faltaB
    })

    return (
        <div className="min-h-screen">
            <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-medium text-ink">Presta</h1>
                <div className="flex items-center gap-4">
                    <Link to="/historial" className="text-muted text-sm hover:text-ink">
                        Historial
                    </Link>
                    <Link to="/qr" className="text-muted text-sm hover:text-ink">
                        Ver QR
                    </Link>
                    <button onClick={handleLogout} className="text-muted text-sm hover:text-ink">
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tipos.map((t) => {
                        const enUso = prestamos.filter((p) => p.tipo_articulo_id === t.id).length
                        const disponibles = t.total - enUso
                        return (
                            <div key={t.id} className="bg-surface rounded-lg border border-border p-4">
                                <p className="text-sm text-muted mb-1">{t.nombre}</p>
                                <p className="text-2xl font-medium text-ink">
                                    {disponibles}
                                    <span className="text-sm text-muted font-normal"> / {t.total}</span>
                                </p>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-surface rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 font-medium text-muted">Nombre</th>
                                <th className="text-left px-4 py-3 font-medium text-muted">Teléfono</th>
                                <th className="text-left px-4 py-3 font-medium text-muted">Llevan</th>
                                <th className="text-left px-4 py-3 font-medium text-muted">Falta</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestamosOrdenados.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                                        No hay préstamos activos.
                                    </td>
                                </tr>
                            )}
                            {prestamosOrdenados.map((p) => {
                                const llevanMin = (Date.now() - new Date(p.hora_inicio).getTime()) / 60000
                                const faltaMin = 30 - llevanMin
                                const colorFalta = faltaMin < 0 ? 'text-danger' : llevanMin >= 20 ? 'text-accent' : 'text-ink'

                                return (
                                    <>
                                        <tr
                                            key={p.id}
                                            onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                                            className="border-b border-border last:border-0 cursor-pointer hover:bg-bg"
                                        >
                                            <td className="px-4 py-3 font-medium text-ink">{p.nombre_completo}</td>
                                            <td className="px-4 py-3 text-ink">{p.numero_telefono}</td>
                                            <td className="px-4 py-3 tabular-nums font-mono text-ink">{fmt(llevanMin)}</td>
                                            <td className={`px-4 py-3 tabular-nums font-mono ${colorFalta}`}>{fmt(faltaMin)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        marcarDevuelta(p.id)
                                                    }}
                                                    className="text-xs text-muted hover:text-ink border border-border rounded px-2.5 py-1"
                                                >
                                                    Marcar devuelta
                                                </button>
                                            </td>
                                        </tr>
                                        {expandido === p.id && (
                                            <tr className="border-b border-border bg-bg">
                                                <td colSpan={5} className="px-4 py-3 text-sm text-muted">
                                                    Identificación: {p.tipo_identificacion} · Hora de inicio:{' '}
                                                    {new Date(p.hora_inicio).toLocaleTimeString('es-MX', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard