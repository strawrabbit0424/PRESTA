import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

function RutaProtegida({ children }: { children: ReactNode }) {
    const { session, cargando } = useSesion()

    if (cargando) return <p style={{ padding: '2rem' }}>Cargando...</p>
    if (!session) return <Navigate to="/login" replace />

    return <>{children}</>
}

export default RutaProtegida