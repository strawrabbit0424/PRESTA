import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setCargando(true)

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        setCargando(false)

        if (loginError) {
            setError('Correo o contraseña incorrectos.')
            return
        }

        navigate('/dashboard')
    }

    const inputClase =
        'w-full rounded-md border border-border bg-white px-3.5 py-2.5 focus:outline-none focus:border-accent'

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-xs bg-surface rounded-lg border border-border p-7">
                <p className="text-sm font-medium text-accent mb-1">Presta</p>
                <h1 className="text-xl font-medium text-ink mb-6">Acceso administrador</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1.5">Correo</label>
                        <input
                            type="email"
                            className={inputClase}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1.5">Contraseña</label>
                        <input
                            type="password"
                            className={inputClase}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                {error && <p className="text-danger text-sm mt-4">{error}</p>}

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full mt-6 rounded-md bg-accent py-2.5 text-white font-medium hover:bg-accent-hover disabled:opacity-50"
                >
                    {cargando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}

export default Login