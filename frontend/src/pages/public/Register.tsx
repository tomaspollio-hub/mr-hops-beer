import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle } from 'lucide-react'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await register(name, email, password, phone || undefined)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <h1 className="font-display text-3xl uppercase tracking-wider text-hops-white text-center mb-2">
          Crear cuenta
        </h1>
        <p className="text-center text-hops-muted text-sm mb-8">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-hops-green hover:text-hops-green-light transition-colors font-medium">
            Ingresá
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
              Nombre <span className="text-hops-error">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="input-field"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
              Email <span className="text-hops-error">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
              WhatsApp
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-field"
              placeholder="11 1234-5678"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
              Contraseña <span className="text-hops-error">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-hops-error text-sm bg-hops-error/10 border border-hops-error/20 rounded-lg px-3 py-2.5 menu-enter">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
