import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl uppercase tracking-wider text-hops-white text-center mb-8">
          Ingresar
        </h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required className="input-field" placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required className="input-field" placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-hops-muted mt-4">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-hops-green hover:text-hops-green-light transition-colors">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
