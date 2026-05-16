import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await register(name, email, password, phone || undefined)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl uppercase tracking-wider text-hops-white text-center mb-8">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="input-field" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="11 1234-5678" />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Contraseña *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="Mínimo 6 caracteres" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-hops-muted mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-hops-green hover:text-hops-green-light transition-colors">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
