import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatARS, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'
import { type Order } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

export default function MyOrders() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return }
    api.get<{ data: Order[] }>('/my/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-hops-muted mb-4">Todavía no realizaste ningún pedido.</p>
          <Link to="/productos" className="btn-primary">Ver productos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-hops-green">{o.order_number}</p>
                  <p className="text-xs text-hops-muted mt-0.5">{formatDate(o.created_at.slice(0, 10))}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  <span className="font-bold text-hops-gold">{formatARS(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
