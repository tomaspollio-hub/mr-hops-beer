import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatARS, formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'
import { type Order } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

export default function MyOrders() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return }
    api.get<{ data: Order[] }>('/my/orders')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-hops-raised flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={36} className="text-hops-subtle" />
          </div>
          <p className="text-hops-muted mb-2 text-lg font-medium">Todavía no realizaste pedidos</p>
          <p className="text-hops-subtle text-sm mb-8">Cuando hagas tu primer pedido, lo vas a ver acá.</p>
          <Link to="/productos" className="btn-primary gap-2">
            Ver productos <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div
              key={o.id}
              className="card hover:border-hops-green/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-hops-green font-display tracking-wide text-lg">{o.order_number}</p>
                  <p className="text-xs text-hops-muted mt-0.5">{formatDate(o.created_at.slice(0, 10))}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={ORDER_STATUS_COLOR[o.status]}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </Badge>
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
