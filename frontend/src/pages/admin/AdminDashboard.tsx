import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatARS, ORDER_STATUS_LABEL } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'

interface DashboardData {
  orders_today: { status: string; count: number }[]
  pending_orders: number
  active_reservations: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const totalToday = data?.orders_today.reduce((s, o) => s + o.count, 0) ?? 0

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>

  return (
    <div>
      <h1 className="section-title mb-8">Dashboard</h1>

      {/* Alertas */}
      {(data?.pending_orders ?? 0) > 0 && (
        <div className="mb-6 p-4 border border-hops-gold/40 bg-hops-gold/10 rounded-sm flex items-center justify-between">
          <p className="text-hops-gold font-bold text-sm">
            ⚠️ {data!.pending_orders} pedido{data!.pending_orders !== 1 ? 's' : ''} pendiente{data!.pending_orders !== 1 ? 's' : ''} de confirmación
          </p>
          <Link to="/admin/pedidos?status=pending_confirmation" className="text-xs text-hops-gold underline">
            Ver pedidos →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pedidos hoy" value={String(totalToday)} />
        <StatCard label="Sin confirmar" value={String(data?.pending_orders ?? 0)} highlight />
        <StatCard label="Reservas activas" value={String(data?.active_reservations ?? 0)} />
      </div>

      {/* Pedidos de hoy por estado */}
      {data && data.orders_today.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4 text-sm">Pedidos de hoy por estado</h2>
          <div className="space-y-2">
            {data.orders_today.map(o => (
              <div key={o.status} className="flex items-center justify-between">
                <span className="text-sm text-hops-muted">{ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL] ?? o.status}</span>
                <span className="font-bold text-hops-white">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <h2 className="font-bold uppercase tracking-wider text-hops-muted text-xs mb-3">Accesos rápidos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/admin/pedidos', label: 'Ver pedidos' },
          { to: '/admin/reservas', label: 'Ver reservas' },
          { to: '/admin/productos/nuevo', label: 'Nuevo producto' },
          { to: '/admin/stock', label: 'Actualizar stock' },
        ].map(l => (
          <Link key={l.to} to={l.to} className="card text-center py-4 text-sm font-bold uppercase tracking-wider text-hops-muted hover:text-hops-green hover:border-hops-green/40 transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card text-center ${highlight && Number(value) > 0 ? 'border-hops-gold/40' : ''}`}>
      <p className={`font-display text-4xl mb-1 ${highlight && Number(value) > 0 ? 'text-hops-gold' : 'text-hops-green'}`}>{value}</p>
      <p className="text-xs text-hops-muted uppercase tracking-wider">{label}</p>
    </div>
  )
}
