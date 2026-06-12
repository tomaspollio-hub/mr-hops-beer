import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const navigate = useNavigate()
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get<{ data: { name: string; phone?: string } }>('/my/profile').then(r => {
      setName(r.data.name)
      setPhone(r.data.phone ?? '')
    })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await api.put('/my/profile', { name: name || undefined, phone: phone || undefined })
      if (user && token) setAuth({ ...user, name }, token)
      setMsg({ type: 'success', text: 'Perfil actualizado correctamente' })
    } catch {
      setMsg({ type: 'error', text: 'Error al actualizar el perfil' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Mi perfil</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="input-field"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Teléfono / WhatsApp</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="input-field"
            placeholder="+54 9 11 1234-5678"
          />
        </div>
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="input-field opacity-40 cursor-not-allowed"
          />
          <p className="text-xs text-hops-subtle mt-1">El email no se puede cambiar</p>
        </div>

        {msg && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 border ${
            msg.type === 'success'
              ? 'text-hops-success bg-hops-success/8 border-hops-success/20'
              : 'text-hops-error bg-hops-error/10 border-hops-error/20'
          }`}>
            {msg.type === 'success'
              ? <CheckCircle2 size={14} className="shrink-0 text-hops-success" />
              : <AlertCircle  size={14} className="shrink-0 text-hops-error" />
            }
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
