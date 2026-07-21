import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

type TipoArticulo = {
    id: string
    nombre: string
}

const OPCIONES_IDENTIFICACION = ['INE', 'Pasaporte', 'Licencia de conducir', 'Otro']

function FormularioPublico() {
    const [tiposArticulo, setTiposArticulo] = useState<TipoArticulo[]>([])
    const [nombreCompleto, setNombreCompleto] = useState('')
    const [tipoArticuloId, setTipoArticuloId] = useState('')
    const [segundoArticulo, setSegundoArticulo] = useState(false)
    const [tipoArticuloId2, setTipoArticuloId2] = useState('')
    const [tipoIdentificacion, setTipoIdentificacion] = useState('')
    const [identificacionOtro, setIdentificacionOtro] = useState('')
    const [numeroTelefono, setNumeroTelefono] = useState('')
    const [foto, setFoto] = useState<File | null>(null)
    const [previewFoto, setPreviewFoto] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        supabase
            .from('tipos_articulo')
            .select('id, nombre')
            .then(({ data, error }) => {
                if (error) {
                    setError('No se pudo cargar el formulario. Intenta recargar la página.')
                } else if (data) {
                    setTiposArticulo(data)
                }
            })
    }, [])

    const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10)
        setNumeroTelefono(soloNumeros)
    }

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] ?? null
        setFoto(archivo)
        setPreviewFoto(archivo ? URL.createObjectURL(archivo) : null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const identificacionFinal =
            tipoIdentificacion === 'Otro' ? identificacionOtro.trim() : tipoIdentificacion

        if (!nombreCompleto.trim() || !tipoArticuloId || !identificacionFinal || !numeroTelefono.trim()) {
            setError('Completa todos los campos.')
            return
        }

        if (segundoArticulo && !tipoArticuloId2) {
            setError('Selecciona el segundo artículo o desmarca la opción.')
            return
        }

        if (numeroTelefono.length !== 10) {
            setError('El teléfono debe tener 10 dígitos.')
            return
        }

        if (!foto) {
            setError('Toma o sube una foto de tu identificación.')
            return
        }

        setEnviando(true)

        const extension = foto.name.split('.').pop() || 'jpg'
        const nombreArchivo = `${crypto.randomUUID()}.${extension}`

        const { data: subida, error: errorSubida } = await supabase.storage
            .from('identificaciones')
            .upload(nombreArchivo, foto)

        if (errorSubida || !subida) {
            setEnviando(false)
            setError('No se pudo subir la foto de identificación. Intenta de nuevo.')
            return
        }

        const { error: insertError } = await supabase.from('prestamos').insert({
            nombre_completo: nombreCompleto.trim(),
            tipo_articulo_id: tipoArticuloId,
            tipo_articulo_2_id: segundoArticulo ? tipoArticuloId2 : null,
            tipo_identificacion: identificacionFinal,
            numero_telefono: numeroTelefono.trim(),
            foto_identificacion_path: subida.path,
        })

        setEnviando(false)

        if (insertError) {
            setError('Hubo un error al registrar. Intenta de nuevo.')
            return
        }

        setEnviado(true)
    }

    const inputClase =
        'w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent'
    const labelClase = 'block text-sm text-muted mb-1.5'

    if (enviado) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <p className="text-xl font-medium text-ink mb-2">Listo</p>
                    <p className="text-muted">Tu préstamo quedó registrado. Disfruta tu tiempo.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-lg border border-border p-7">
                <h1 className="text-xl font-medium text-ink mb-6">Registra tu préstamo</h1>

                <div className="space-y-4">
                    <div>
                        <label className={labelClase}>Nombre completo</label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            className={inputClase}
                            value={nombreCompleto}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                            placeholder="Nombre y apellidos"
                        />
                    </div>

                    <div>
                        <label className={labelClase}>¿Qué te llevas?</label>
                        <select
                            required
                            className={inputClase}
                            value={tipoArticuloId}
                            onChange={(e) => setTipoArticuloId(e.target.value)}
                        >
                            <option value="">Selecciona una opción</option>
                            {tiposArticulo.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                        <input
                            type="checkbox"
                            checked={segundoArticulo}
                            onChange={(e) => {
                                setSegundoArticulo(e.target.checked)
                                if (!e.target.checked) setTipoArticuloId2('')
                            }}
                            className="w-4 h-4"
                        />
                        Llevo un segundo artículo (misma identificación)
                    </label>

                    {segundoArticulo && (
                        <div>
                            <label className={labelClase}>Segundo artículo</label>
                            <select
                                required
                                className={inputClase}
                                value={tipoArticuloId2}
                                onChange={(e) => setTipoArticuloId2(e.target.value)}
                            >
                                <option value="">Selecciona una opción</option>
                                {tiposArticulo.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className={labelClase}>Identificación que dejas</label>
                        <select
                            required
                            className={inputClase}
                            value={tipoIdentificacion}
                            onChange={(e) => setTipoIdentificacion(e.target.value)}
                        >
                            <option value="">Selecciona una opción</option>
                            {OPCIONES_IDENTIFICACION.map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                    </div>

                    {tipoIdentificacion === 'Otro' && (
                        <div>
                            <label className={labelClase}>Especifica cuál</label>
                            <input
                                type="text"
                                required
                                className={inputClase}
                                value={identificacionOtro}
                                onChange={(e) => setIdentificacionOtro(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className={labelClase}>Foto de tu identificación</label>
                        <input
                            type="file"
                            required
                            accept="image/*"
                            capture="environment"
                            onChange={handleFotoChange}
                            className="w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3.5 file:py-2 file:text-white file:text-sm file:font-medium"
                        />
                        {previewFoto && (
                            <img src={previewFoto} alt="Vista previa de identificación" className="mt-2 rounded-md max-h-40 object-contain border border-border" />
                        )}
                    </div>
                </div>

                <div>
                    <label className={labelClase}>Número de teléfono</label>
                    <input
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        title="10 dígitos, solo números"
                        className={inputClase}
                        value={numeroTelefono}
                        onChange={handleTelefonoChange}
                        placeholder="9981234567"
                    />
                </div>

                {error && <p className="text-danger text-sm mt-4">{error}</p>}

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full mt-6 rounded-md bg-accent py-2.5 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
                >
                    {enviando ? 'Enviando...' : 'Registrar préstamo'}
                </button>
            </form>
        </div>
    )
}

export default FormularioPublico