import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistorial } from '../hooks/useHistorial'
import { useTiposArticulo } from '../hooks/useTiposArticulo'

function formatearFecha(fecha: string) {
    const [year, month, day] = fecha.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    const texto = d.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function Historial() {
    const { grupos, cargando } = useHistorial()
    const { tipos } = useTiposArticulo()
    const [abierto, setAbierto] = useState<string | null>(null)

    const nombreTipo = (id: string) => tipos.find((t) => t.id === id)?.nombre ?? 'Artículo'

    return (
        <div className="min-h-screen">
            <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between print:hidden">
                <h1 className="text-lg font-medium text-ink">Presta</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.print()}
                        className="rounded-md bg-accent px-4 py-2 text-white text-sm font-medium hover:bg-accent-hover"
                    >
                        Imprimir
                    </button>
                    <Link to="/dashboard" className="text-muted text-sm hover:text-ink">
                        Volver
                    </Link>
                </div>
            </header>

            <div className="p-6 max-w-3xl mx-auto space-y-3 print:p-0 print:space-y-6">
                <h2 className="hidden print:block text-xl font-medium text-ink mb-2">
                    Presta — Historial de préstamos
                </h2>

                {cargando && <p className="text-muted text-sm print:hidden">Cargando...</p>}

                {!cargando && grupos.length === 0 && (
                    <p className="text-muted text-sm">Todavía no hay préstamos finalizados.</p>
                )}

                {grupos.map((grupo) => (
                    <div
                        key={grupo.fecha}
                        className="bg-surface rounded-lg border border-border overflow-hidden print:border-0 print:rounded-none print:break-inside-avoid"
                    >
                        <button
                            onClick={() => setAbierto(abierto === grupo.fecha ? null : grupo.fecha)}
                            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg print:px-0 print:py-1 print:pointer-events-none"
                        >
                            <span className="font-medium text-ink print:text-base">{formatearFecha(grupo.fecha)}</span>
                            <span className="text-sm text-muted">{grupo.prestamos.length} personas</span>
                        </button>

                        <div className="overflow-x-auto">
                            <table
                                className={`w-full text-sm border-t border-border print:border-t-0 print:table min-w-[600px] ${abierto === grupo.fecha ? 'table' : 'hidden'
                                    }`}
                            >
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left px-4 py-2 font-medium text-muted print:px-0">Nombre</th>
                                        <th className="text-left px-4 py-2 font-medium text-muted print:px-2">Artículo</th>
                                        <th className="text-left px-4 py-2 font-medium text-muted print:px-2">Identificación</th>
                                        <th className="text-left px-4 py-2 font-medium text-muted print:px-2">Teléfono</th>
                                        <th className="text-left px-4 py-2 font-medium text-muted print:px-2">Horario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupo.prestamos.map((p) => (
                                        <tr key={p.id} className="border-b border-border last:border-0">
                                            <td className="px-4 py-2 text-ink print:px-0">{p.nombre_completo}</td>
                                            <td className="px-4 py-2 text-ink print:px-2">{nombreTipo(p.tipo_articulo_id)}</td>
                                            <td className="px-4 py-2 text-ink print:px-2">{p.tipo_identificacion}</td>
                                            <td className="px-4 py-2 text-ink print:px-2">{p.numero_telefono}</td>
                                            <td className="px-4 py-2 text-muted print:px-2">
                                                {new Date(p.hora_inicio).toLocaleTimeString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {' – '}
                                                {new Date(p.hora_fin).toLocaleTimeString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Historial
