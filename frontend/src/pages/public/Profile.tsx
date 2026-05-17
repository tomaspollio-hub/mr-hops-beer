import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

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
    setMsg('')
    try {
      await api.put('/my/profile', { name: name || undefined, phone: phone || undefined })
      if (user && token) setAuth({ ...user, name }, token)
      setMsg('Perfil actualizado correctamente')
    } catch {
      setMsg('Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Mi perfil</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nombre</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            required className="input-field" placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Teléfono / WhatsApp</label>
          <input
            type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            className="input-field" placeholder="+54 9 11 1234-5678"
          />
        </div>
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email</label>
          <input type="email" value={user?.email ?? ''} disabled className="input-field opacity-50 cursor-not-allowed" />
        </div>

        {msg && <p className="text-xs text-hops-green bg-hops-green/10 px-3 py-2 rounded-sm">{msg}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
