import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatARS, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ORDER_TRANSITIONS } from '@/lib/utils'
import { type Order, type OrderItem, type OrderStatus } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

interface OrderDetail extends Order {
  items: (OrderItem & { name: string; image_url?: string })[]
  history: { status: string; note?: string; created_at: string }[]
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<{ data: OrderDetail }>(`/admin/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const changeStatus = async (newStatus: OrderStatus) => {
    setUpdating(true)
    setError(null)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus, note: note || undefined })
      setNote('')
      load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
  if (!order) return <p className="text-hops-muted text-center py-20">Pedido no encontrado.</p>

  const allowedNext = ORDER_TRANSITIONS[order.status] ?? []

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/pedidos" className="text-hops-muted hover:text-hops-white text-sm">← Pedidos</Link>
        <h1 className="section-title">{order.order_number}</h1>
        <Badge className={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Cliente */}
        <div className="card">
          <h2 className="text-xs text-hops-muted uppercase tracking-wider mb-3">Cliente</h2>
          <p className="text-hops-white font-bold">{order.guest_name ?? 'Usuario registrado'}</p>
          {order.guest_email && <p className="text-sm text-hops-muted">{order.guest_email}</p>}
          {order.guest_phone && (
            <a href={`https://wa.me/${order.guest_phone.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-hops-green hover:underline block mt-1">
              {order.guest_phone} → WhatsApp
            </a>
          )}
        </div>

        {/* Entrega */}
        <div className="card">
          <h2 className="text-xs text-hops-muted uppercase tracking-wider mb-3">Entrega</h2>
          <p className="text-hops-white font-bold">
            {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏠 Retiro en local'}
          </p>
          {order.delivery_address && <p className="text-sm text-hops-muted mt-1">{order.delivery_address}</p>}
          {order.notes && <p className="text-sm text-hops-muted mt-2 italic">"{order.notes}"</p>}
          <p className="text-xs text-hops-muted mt-2">{formatDate(order.created_at.slice(0, 10))}</p>
        </div>
      </div>

      {/* Items */}
      <div className="card mb-6">
        <h2 className="text-xs text-hops-muted uppercase tracking-wider mb-4">Productos</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-hops-border flex items-center justify-center shrink-0">
                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-sm" /> : <span>🍺</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm text-hops-white">{item.name}</p>
                <p className="text-xs text-hops-muted">×{item.quantity} · {formatARS(item.unit_price)} c/u</p>
              </div>
              <span className="font-bold text-hops-white text-sm">{formatARS(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-hops-border mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold text-hops-white uppercase tracking-wider text-sm">Total</span>
          <span className="font-display text-2xl text-hops-gold">{formatARS(order.total)}</span>
        </div>
      </div>

      {/* Cambiar estado */}
      {allowedNext.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xs text-hops-muted uppercase tracking-wider mb-3">Cambiar estado</h2>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Nota opcional..."
            rows={2}
            className="input-field resize-none mb-3"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex flex-wrap gap-2">
            {allowedNext.map(s => (
              <button
                key={s}
                disabled={updating}
                onClick={() => changeStatus(s)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-colors disabled:opacity-50
                  ${s === 'cancelled' ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'btn-primary py-2 px-4 text-xs'}`}
              >
                → {ORDER_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="card">
        <h2 className="text-xs text-hops-muted uppercase tracking-wider mb-4">Historial</h2>
        <div className="space-y-3">
          {order.history?.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-hops-green mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-hops-white">{ORDER_STATUS_LABEL[h.status as OrderStatus] ?? h.status}</p>
                {h.note && <p className="text-xs text-hops-muted">{h.note}</p>}
                <p className="text-xs text-hops-muted">{formatDate(h.created_at.slice(0, 10))}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
