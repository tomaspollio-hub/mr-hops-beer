import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="section-title mb-2">Recuperar contraseña</h1>
      <p className="text-hops-muted text-sm mb-8">
        Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
      </p>

      {sent ? (
        <div className="card text-center space-y-4">
          <p className="text-hops-green font-bold text-lg">Email enviado</p>
          <p className="text-hops-muted text-sm">
            Si el email está registrado, recibirás un enlace en los próximos minutos.
            Revisá también la carpeta de spam.
          </p>
          <Link to="/login" className="btn-primary inline-block px-6 py-2 text-sm">
            Volver al login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="tu@email.com"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>

          <p className="text-center text-sm text-hops-muted">
            <Link to="/login" className="text-hops-green hover:underline">← Volver al login</Link>
          </p>
        </form>
      )}
    </div>
  )
}
