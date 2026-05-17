import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatARS, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'
import { type Order, type OrderStatus } from '@/types'
import Badge from '@/components/ui/Badge'
import { SkeletonOrderCard } from '@/components/ui/Skeleton'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Sin confirmar', value: 'pending_confirmation' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'En preparación', value: 'in_preparation' },
  { label: 'Listos', value: 'ready' },
  { label: 'Entregados', value: 'delivered' },
  { label: 'Cancelados', value: 'cancelled' },
]

export default function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const statusFilter = params.get('status') ?? ''
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const path = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders'
    api.get<{ data: Order[]; total: number }>(path)
      .then(r => { setOrders(r.data); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [statusFilter])

  const WA = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5491100000000'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Pedidos</h1>
        <span className="text-sm text-hops-muted">{total} en total</span>
      </div>

      {/* Búsqueda */}
      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por número, cliente o email..."
        className="input-field mb-4"
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setParams(f.value ? { status: f.value } : {})}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-sm transition-colors ${statusFilter === f.value ? 'bg-hops-green text-hops-black border-hops-green' : 'border-hops-border text-hops-muted hover:border-hops-green/50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonOrderCard key={i} />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-hops-muted text-center py-16">No hay pedidos{statusFilter ? ' con este estado' : ''}.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.filter(o => !search ||
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            (o.guest_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (o.guest_email ?? '').toLowerCase().includes(search.toLowerCase())
          ).map(o => (
            <div key={o.id} className="card border-l-2 border-transparent hover:border-l-hops-green hover:bg-hops-card/80 transition-all duration-150 group">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                {/* Número y fecha */}
                <div>
                  <Link to={`/admin/pedidos/${o.id}`} className="font-bold text-hops-green hover:text-hops-green-light transition-colors">
                    {o.order_number}
                  </Link>
                  <p className="text-xs text-hops-muted mt-0.5">
                    {formatDate(o.created_at.slice(0, 10))} · {o.delivery_type === 'delivery' ? '🚚 Delivery' : '🏠 Retiro'}
                  </p>
                </div>

                {/* Cliente */}
                <div className="text-sm">
                  <p className="text-hops-white">{o.guest_name ?? 'Usuario registrado'}</p>
                  {o.guest_phone && (
                    <a
                      href={`https://wa.me/${o.guest_phone.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-hops-green hover:underline"
                    >
                      WhatsApp →
                    </a>
                  )}
                </div>

                {/* Estado y total */}
                <div className="flex items-center gap-3">
                  <Badge className={ORDER_STATUS_COLOR[o.status as OrderStatus]}>
                    {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                  </Badge>
                  <span className="font-bold text-hops-gold">{formatARS(o.total)}</span>
                  <Link to={`/admin/pedidos/${o.id}`} className="text-xs text-hops-muted hover:text-hops-white transition-colors">
                    Ver →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
