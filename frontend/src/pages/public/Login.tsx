import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const { login, loading, error } = useAuth()
  const { loginWithGoogle } = useGoogleAuth()
  const navigate = useNavigate()
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setGoogleError('')
    const result = await loginWithGoogle()
    setGoogleLoading(false)
    if (result.ok) {
      navigate('/')
    } else {
      setGoogleError('No se pudo iniciar sesión con Google')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <h1 className="font-display text-3xl uppercase tracking-wider text-hops-white text-center mb-2">
          Ingresar
        </h1>
        <p className="text-center text-hops-muted text-sm mb-8">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-hops-green hover:text-hops-green-light transition-colors font-medium">
            Registrate
          </Link>
        </p>

        <div className="card space-y-5">

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-hops-raised border border-hops-border text-hops-white font-medium px-4 py-3 rounded-lg hover:border-hops-green/40 hover:bg-hops-raised/80 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.49-1.63.84-2.7.84-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.51 10.6A4.8 4.8 0 0 1 4.26 9c0-.56.1-1.1.25-1.6V5.33H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.52.85 3.62l2.68-2.02z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.83 2.02A4.77 4.77 0 0 1 8.98 3.58z"/>
            </svg>
            {googleLoading ? 'Ingresando...' : 'Continuar con Google'}
          </button>

          {googleError && (
            <div className="flex items-center gap-2 text-hops-error text-sm bg-hops-error/10 border border-hops-error/20 rounded-lg px-3 py-2.5 menu-enter">
              <AlertCircle size={14} className="shrink-0" />
              {googleError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-hops-border" />
            <span className="text-xs text-hops-subtle uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-hops-border" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                Email
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
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-hops-error text-sm bg-hops-error/10 border border-hops-error/20 rounded-lg px-3 py-2.5 menu-enter">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <p className="text-center text-xs text-hops-muted">
              <Link to="/recuperar-contrasena" className="hover:text-hops-white transition-colors">
                Olvidé mi contraseña
              </Link>
            </p>
          </form>

        </div>

      </div>
    </div>
  )
}
