import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'

function QR() {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}`

    return (
        <div className="min-h-screen">
            <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between print:hidden">
                <Link to="/dashboard" className="text-muted text-sm hover:text-ink">
                    Volver
                </Link>
                <button
                    onClick={() => window.print()}
                    className="rounded-md bg-accent px-4 py-2 text-white text-sm font-medium hover:bg-accent-hover"
                >
                    Imprimir
                </button>
            </header>

            <div className="flex flex-col items-center justify-center py-16 px-4">
                <p className="text-lg font-medium text-ink mb-1">Presta</p>
                <p className="text-sm text-muted mb-8">Escanea para registrar tu préstamo</p>

                <div className="bg-white p-6 rounded-lg border border-border">
                    <QRCodeSVG value={url} size={280} />
                </div>

                <p className="text-xs text-muted mt-4 break-all max-w-xs text-center">{url}</p>

                <Link
                    to="/"
                    className="mt-4 text-sm text-accent hover:text-accent-hover underline print:hidden"
                >
                    Abrir formulario manual
                </Link>
            </div>
        </div>
    )
}

export default QR