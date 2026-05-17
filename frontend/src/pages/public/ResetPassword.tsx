import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      navigate('/login?reset=ok')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-red-400 mb-4">Enlace inválido o expirado.</p>
        <Link to="/recuperar-contrasena" className="text-hops-green hover:underline text-sm">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="section-title mb-2">Nueva contraseña</h1>
      <p className="text-hops-muted text-sm mb-8">Ingresá tu nueva contraseña.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Confirmar contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            className="input-field"
            placeholder="Repetí la contraseña"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  )
}
