import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Truck, MapPin, Package, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { formatARS, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ORDER_TRANSITIONS } from '@/lib/utils'
import { type Order, type OrderItem, type OrderStatus } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { useToastStore } from '@/store/toastStore'

interface OrderDetail extends Order {
  items: (OrderItem & { name: string; image_url?: string })[]
  history: { status: string; note?: string; created_at: string }[]
}

export default function AdminOrderDetail() {
  const { id }    = useParams<{ id: string }>()
  const [order,   setOrder]    = useState<OrderDetail | null>(null)
  const [loading, setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)
  const [note,    setNote]     = useState('')
  const toast = useToastStore()

  const load = () => {
    setLoading(true)
    api.get<{ data: OrderDetail }>(`/admin/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const changeStatus = async (newStatus: OrderStatus) => {
    setUpdating(true)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus, note: note || undefined })
      setNote('')
      toast.show(`Estado actualizado: ${ORDER_STATUS_LABEL[newStatus]}`)
      load()
    } catch (err: unknown) {
      toast.show(err instanceof Error ? err.message : 'Error al cambiar estado', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
  if (!order)  return <p className="text-hops-muted text-center py-20">Pedido no encontrado.</p>

  const allowedNext = ORDER_TRANSITIONS[order.status] ?? []

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          to="/admin/pedidos"
          className="flex items-center gap-1.5 text-sm text-hops-muted hover:text-hops-white transition-colors"
        >
          <ArrowLeft size={14} /> Pedidos
        </Link>
        <span className="text-hops-border">/</span>
        <h1 className="font-display text-3xl text-hops-white uppercase tracking-wide">{order.order_number}</h1>
        <Badge className={ORDER_STATUS_COLOR[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Cliente */}
        <div className="card">
          <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-3">Cliente</h2>
          <p className="text-hops-white font-bold">{order.guest_name ?? 'Usuario registrado'}</p>
          {order.guest_email && (
            <p className="text-sm text-hops-muted mt-1">{order.guest_email}</p>
          )}
          {order.guest_phone && (
            <a
              href={`https://wa.me/${order.guest_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-hops-green hover:text-hops-green-light transition-colors block mt-1.5"
            >
              {order.guest_phone} → WhatsApp
            </a>
          )}
        </div>

        {/* Entrega */}
        <div className="card">
          <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-3">Entrega</h2>
          <div className="flex items-center gap-2 font-bold text-hops-white">
            {order.delivery_type === 'delivery'
              ? <><Truck size={16} className="text-hops-muted" /> Delivery</>
              : <><MapPin size={16} className="text-hops-muted" /> Retiro en local</>
            }
          </div>
          {order.delivery_address && (
            <p className="text-sm text-hops-muted mt-1.5">{order.delivery_address}</p>
          )}
          {order.notes && (
            <p className="text-sm text-hops-muted mt-2 italic">"{order.notes}"</p>
          )}
          <p className="text-xs text-hops-subtle mt-2">{formatDate(order.created_at.slice(0, 10))}</p>
        </div>
      </div>

      {/* Items */}
      <div className="card mb-4">
        <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-4">Productos</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-hops-raised flex items-center justify-center shrink-0 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  : <Package size={18} className="text-hops-subtle" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-hops-white font-medium truncate">{item.name}</p>
                <p className="text-xs text-hops-muted">×{item.quantity} · {formatARS(item.unit_price)} c/u</p>
              </div>
              <span className="font-bold text-hops-white text-sm shrink-0">{formatARS(item.subtotal)}</span>
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
        <div className="card mb-4">
          <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-3">Cambiar estado</h2>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Nota opcional..."
            rows={2}
            className="input-field resize-none mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {allowedNext.map(s => (
              <button
                key={s}
                disabled={updating}
                onClick={() => changeStatus(s)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-150 disabled:opacity-40 active:scale-[0.97] ${
                  s === 'cancelled'
                    ? 'border-hops-error/40 text-hops-error hover:bg-hops-error/10'
                    : 'bg-hops-green text-hops-black hover:bg-hops-green-light border-hops-green'
                }`}
              >
                → {ORDER_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="card">
        <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-4">Historial</h2>
        <div className="space-y-4">
          {order.history?.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-hops-green mt-1 shrink-0" />
                {i < (order.history?.length ?? 0) - 1 && (
                  <div className="w-px flex-1 bg-hops-border mt-1" />
                )}
              </div>
              <div className="pb-3">
                <p className="text-sm text-hops-white font-medium">
                  {ORDER_STATUS_LABEL[h.status as OrderStatus] ?? h.status}
                </p>
                {h.note && <p className="text-xs text-hops-muted mt-0.5">{h.note}</p>}
                <p className="text-xs text-hops-subtle mt-0.5">{formatDate(h.created_at.slice(0, 10))}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
