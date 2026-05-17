import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { type User } from '@/types'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true })
  }, [user, navigate])

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
          <span className="font-display text-2xl text-hops-green uppercase tracking-widest">Mr. Hops</span>
          <p className="text-hops-muted text-sm mt-1">Panel de administración</p>
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
