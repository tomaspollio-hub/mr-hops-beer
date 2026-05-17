import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { type User } from '@/types'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { setAuth, user } = useAuthStore()
  const { loginWithGoogle } = useGoogleAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true })
  }, [user, navigate])

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const result = await loginWithGoogle()
    setGoogleLoading(false)
    if (result.ok && result.role === 'admin') {
      navigate('/admin', { replace: true })
    } else if (result.ok) {
      setError('Esa cuenta de Google no tiene permisos de administrador')
    } else {
      setError('No se pudo iniciar sesión con Google')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ data: User; token: string }>('/auth/login', { email, password })
      if (res.data.role !== 'admin') {
        setError('No tenés permisos de administrador')
        return
      }
      setAuth(res.data, res.token)
      navigate('/admin', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hops-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Mr. Hops" className="w-20 h-20 rounded-full object-cover border-2 border-hops-green/40 mx-auto mb-3" />
          <span className="font-display text-2xl text-hops-green uppercase tracking-widest">Mr. Hops</span>
          <p className="text-hops-muted text-sm mt-1">Panel de administración</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium px-4 py-2.5 rounded-sm border border-gray-300 hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.49-1.63.84-2.7.84-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.6A4.8 4.8 0 0 1 4.26 9c0-.56.1-1.1.25-1.6V5.33H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.52.85 3.62l2.68-2.02z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.83 2.02A4.77 4.77 0 0 1 8.98 3.58z"/>
          </svg>
          {googleLoading ? 'Ingresando...' : 'Continuar con Google'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-hops-border" />
          <span className="text-xs text-hops-muted uppercase tracking-wider">o</span>
          <div className="flex-1 h-px bg-hops-border" />
        </div>

        <form onSubmit={handleSubmit} className="bg-hops-dark border border-hops-border rounded-sm p-6 space-y-4">
          <h1 className="text-hops-white font-bold text-lg mb-2">Iniciar sesión</h1>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-sm">{error}</p>
          )}

          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-hops-black border border-hops-border rounded-sm px-3 py-2 text-hops-white text-sm focus:outline-none focus:border-hops-green"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-hops-black border border-hops-border rounded-sm px-3 py-2 text-hops-white text-sm focus:outline-none focus:border-hops-green"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hops-green text-hops-black font-bold py-2 rounded-sm uppercase tracking-wider text-sm hover:bg-hops-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
