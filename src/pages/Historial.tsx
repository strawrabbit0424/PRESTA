import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useHistorial } from '../hooks/useHistorial'
import { useTiposArticulo } from '../hooks/useTiposArticulo'
import { verIdentificacion } from '../lib/verIdentificacion'

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
    const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())

    const nombreTipo = (id: string | null) => tipos.find((t) => t.id === id)?.nombre ?? ''

    function alternarSeleccion(fecha: string) {
        setSeleccionados((actuales) => {
            const nuevo = new Set(actuales)
            if (nuevo.has(fecha)) {
                nuevo.delete(fecha)
            } else {
                nuevo.add(fecha)
            }
            return nuevo
        })
    }

    function seleccionarTodos() {
        setSeleccionados(new Set(grupos.map((g) => g.fecha)))
    }

    function limpiarSeleccion() {
        setSeleccionados(new Set())
    }

    function exportarExcel() {
        const gruposAExportar = grupos.filter((g) => seleccionados.has(g.fecha))
        const libro = XLSX.utils.book_new()

        gruposAExportar.forEach((grupo) => {
            const [, month, day] = grupo.fecha.split('-')
            const fechaCorta = `${day}-${month}`

            const filas = grupo.prestamos.map((p) => ({
                Nombre: p.nombre_completo,
                'Artículo(s)': [nombreTipo(p.tipo_articulo_id), nombreTipo(p.tipo_articulo_2_id)]
                    .filter(Boolean)
                    .join(' + '),
                Identificación: p.tipo_identificacion,
                Teléfono: p.numero_telefono,
                'Hora inicio': new Date(p.hora_inicio).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                'Hora fin': new Date(p.hora_fin).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }))

            const hoja = XLSX.utils.json_to_sheet(filas)
            hoja['!cols'] = [
                { wch: 24 }, // Nombre
                { wch: 16 }, // Artículo(s)
                { wch: 16 }, // Identificación
                { wch: 14 }, // Teléfono
                { wch: 12 }, // Hora inicio
                { wch: 12 }, // Hora fin
            ]

            XLSX.utils.book_append_sheet(libro, hoja, fechaCorta)
        })

        const nombreArchivo = `presta-historial-${new Date().toISOString().slice(0, 10)}.xlsx`
        XLSX.writeFile(libro, nombreArchivo)
    }

    return (
        <div className="min-h-screen">
            <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-lg font-medium text-ink">Presta</h1>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-muted text-sm hover:text-ink">
                        Volver
                    </Link>
                </div>
            </header>

            <div className="p-6 max-w-3xl mx-auto space-y-3">
                {!cargando && grupos.length > 0 && (
                    <div className="flex items-center justify-between flex-wrap gap-3 bg-surface rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                            <button onClick={seleccionarTodos} className="text-sm text-accent hover:text-accent-hover">
                                Seleccionar todos
                            </button>
                            <button onClick={limpiarSeleccion} className="text-sm text-muted hover:text-ink">
                                Limpiar
                            </button>
                            <span className="text-sm text-muted">{seleccionados.size} seleccionados</span>
                        </div>
                        <button
                            onClick={exportarExcel}
                            disabled={seleccionados.size === 0}
                            className="rounded-md bg-accent px-4 py-2 text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-40"
                        >
                            Exportar a Excel
                        </button>
                    </div>
                )}

                {cargando && <p className="text-muted text-sm">Cargando...</p>}

                {!cargando && grupos.length === 0 && (
                    <p className="text-muted text-sm">Todavía no hay préstamos finalizados.</p>
                )}

                {grupos.map((grupo) => (
                    <div key={grupo.fecha} className="bg-surface rounded-lg border border-border overflow-hidden">
                        <div className="w-full flex items-center gap-3 px-4 py-3.5">
                            <input
                                type="checkbox"
                                checked={seleccionados.has(grupo.fecha)}
                                onChange={() => alternarSeleccion(grupo.fecha)}
                                className="w-4 h-4 shrink-0"
                            />
                            <button
                                onClick={() => setAbierto(abierto === grupo.fecha ? null : grupo.fecha)}
                                className="flex-1 flex items-center justify-between hover:text-accent text-left"
                            >
                                <span className="font-medium text-ink">{formatearFecha(grupo.fecha)}</span>
                                <span className="text-sm text-muted">{grupo.prestamos.length} personas</span>
                            </button>
                        </div>

                        {abierto === grupo.fecha && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-t border-border min-w-[640px]">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left px-4 py-2 font-medium text-muted">Nombre</th>
                                            <th className="text-left px-4 py-2 font-medium text-muted">Artículo(s)</th>
                                            <th className="text-left px-4 py-2 font-medium text-muted">Identificación</th>
                                            <th className="text-left px-4 py-2 font-medium text-muted">Teléfono</th>
                                            <th className="text-left px-4 py-2 font-medium text-muted">Horario</th>
                                            <th className="text-left px-4 py-2 font-medium text-muted">ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grupo.prestamos.map((p) => {
                                            const articulos = [nombreTipo(p.tipo_articulo_id), nombreTipo(p.tipo_articulo_2_id)]
                                                .filter(Boolean)
                                                .join(' + ')
                                            return (
                                                <tr key={p.id} className="border-b border-border last:border-0">
                                                    <td className="px-4 py-2 text-ink">{p.nombre_completo}</td>
                                                    <td className="px-4 py-2 text-ink">{articulos}</td>
                                                    <td className="px-4 py-2 text-ink">{p.tipo_identificacion}</td>
                                                    <td className="px-4 py-2 text-ink">{p.numero_telefono}</td>
                                                    <td className="px-4 py-2 text-muted">
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
                                                    <td className="px-4 py-2">
                                                        {p.foto_identificacion_path && (
                                                            <button
                                                                onClick={() => verIdentificacion(p.foto_identificacion_path)}
                                                                className="text-xs text-accent hover:text-accent-hover underline"
                                                            >
                                                                Ver
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Historial
