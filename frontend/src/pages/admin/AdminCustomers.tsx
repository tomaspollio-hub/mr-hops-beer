import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatDate, formatARS, ORDER_STATUS_LABEL, RESERVATION_STATUS_LABEL } from '@/lib/utils'
import { type Order, type BarrelReservation } from '@/types'
import Spinner from '@/components/ui/Spinner'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  blocked: number
  created_at: string
}

interface CustomerDetail extends Customer {
  orders: Pick<Order, 'id' | 'order_number' | 'status' | 'total' | 'created_at'>[]
  reservations: Pick<BarrelReservation, 'id' | 'reservation_number' | 'status' | 'total' | 'start_date' | 'end_date'>[]
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api.get<{ data: Customer[] }>('/admin/customers')
      .then(r => setCustomers(r.data))
      .finally(() => setLoading(false))
  }, [])

  const loadDetail = (id: string) => {
    setLoadingDetail(true)
    setShowReset(false)
    setActionMsg('')
    api.get<{ data: CustomerDetail }>(`/admin/customers/${id}`)
      .then(r => setSelected(r.data))
      .finally(() => setLoadingDetail(false))
  }

  const handleBlock = async () => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await api.patch<{ message: string; blocked: boolean }>(`/admin/customers/${selected.id}/block`, {})
      const blocked = res.blocked ? 1 : 0
      setSelected(s => s ? { ...s, blocked } : s)
      setCustomers(cs => cs.map(c => c.id === selected.id ? { ...c, blocked } : c))
      setActionMsg(res.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selected || !newPassword) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/customers/${selected.id}/reset-password`, { password: newPassword })
      setActionMsg('Contraseña actualizada correctamente')
      setNewPassword('')
      setShowReset(false)
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'Error al actualizar contraseña')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected || !confirm(`¿Eliminar a ${selected.name}? Esta acción no se puede deshacer.`)) return
    setActionLoading(true)
    try {
      await api.delete(`/admin/customers/${selected.id}`)
      setCustomers(cs => cs.filter(c => c.id !== selected.id))
      setSelected(null)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista */}
      <div>
        <h1 className="section-title mb-6">Clientes</h1>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="input-field flex-1"
          />
          <span className="text-hops-muted text-sm whitespace-nowrap">{customers.length} registrados</span>
        </div>

        {customers.length === 0 && (
          <p className="text-hops-muted text-center py-12">No hay clientes registrados todavía.</p>
        )}

        <div className="space-y-2">
          {customers.filter(c =>
            !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
          ).map(c => (
            <button
              key={c.id}
              onClick={() => loadDetail(c.id)}
              className={`w-full card text-left transition-all duration-150 hover:border-hops-green/40 hover:translate-x-0.5 ${
                selected?.id === c.id ? 'border-hops-green/50 bg-hops-green/5' : ''
              } ${c.blocked ? 'opacity-50 border-red-500/30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-hops-white text-sm">{c.name}</p>
                {!!c.blocked && (
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Bloqueado</span>
                )}
              </div>
              <p className="text-xs text-hops-muted mt-0.5">{c.email}</p>
              {c.phone && <p className="text-xs text-hops-muted">{c.phone}</p>}
              <p className="text-xs text-hops-border mt-1">Desde {formatDate(c.created_at.slice(0, 10))}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detalle */}
      <div>
        {loadingDetail && <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>}

        {!loadingDetail && !selected && customers.length > 0 && (
          <div className="card inline-flex items-center gap-2 px-4 py-2 text-hops-muted text-xs border-dashed">
            <span className="text-base">←</span>
            <span>Seleccioná un cliente</span>
          </div>
        )}

        {!loadingDetail && selected && (
          <div className="space-y-4 fade-in">
            {/* Info + acciones */}
            <div className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-hops-white">{selected.name}</h2>
                  <p className="text-sm text-hops-muted">{selected.email}</p>
                  {selected.phone && (
                    <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-hops-green hover:underline">
                      {selected.phone} → WhatsApp
                    </a>
                  )}
                </div>
                {!!selected.blocked && (
                  <span className="badge bg-red-500/20 text-red-400">Bloqueado</span>
                )}
              </div>

              {actionMsg && (
                <p className="text-xs text-hops-green bg-hops-green/10 px-3 py-2 rounded-sm">{actionMsg}</p>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleBlock}
                  disabled={actionLoading}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                    selected.blocked
                      ? 'border-hops-green text-hops-green hover:bg-hops-green hover:text-hops-black'
                      : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                  } disabled:opacity-50`}
                >
                  {selected.blocked ? 'Desbloquear' : 'Bloquear'}
                </button>

                <button
                  onClick={() => { setShowReset(r => !r); setActionMsg('') }}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm border border-hops-border text-hops-muted hover:text-hops-white hover:border-hops-white transition-colors duration-150"
                >
                  Reset contraseña
                </button>

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors duration-150 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>

              {showReset && (
                <div className="flex gap-2 fade-in">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleResetPassword}
                    disabled={actionLoading || newPassword.length < 6}
                    className="btn-primary py-2 px-4 text-xs disabled:opacity-50"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {/* Pedidos */}
            <div className="card">
              <h3 className="text-xs text-hops-muted uppercase tracking-wider mb-3">
                Pedidos ({selected.orders.length})
              </h3>
              {selected.orders.length === 0 ? (
                <p className="text-sm text-hops-muted">Sin pedidos</p>
              ) : (
                <div className="space-y-2">
                  {selected.orders.map(o => (
                    <div key={o.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-hops-green font-bold">{o.order_number}</span>
                        <span className="text-hops-muted ml-2 text-xs">{ORDER_STATUS_LABEL[o.status]}</span>
                      </div>
                      <span className="text-hops-gold">{formatARS(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reservas */}
            <div className="card">
              <h3 className="text-xs text-hops-muted uppercase tracking-wider mb-3">
                Reservas ({selected.reservations.length})
              </h3>
              {selected.reservations.length === 0 ? (
                <p className="text-sm text-hops-muted">Sin reservas</p>
              ) : (
                <div className="space-y-2">
                  {selected.reservations.map(r => (
                    <div key={r.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-hops-green font-bold">{r.reservation_number}</span>
                        <span className="text-hops-muted ml-2 text-xs">
                          {formatDate(r.start_date)} → {formatDate(r.end_date)}
                        </span>
                      </div>
                      <span className="text-hops-gold">{formatARS(r.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
