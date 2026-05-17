import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Calendar, AlertTriangle, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { formatARS, ORDER_STATUS_LABEL } from '@/lib/utils'
import { SkeletonStatCard } from '@/components/ui/Skeleton'

interface DashboardData {
  orders_today: { status: string; count: number }[]
  pending_orders: number
  active_reservations: number
  pending_reservations: number
  revenue_today: number
  revenue_month: number
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

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-hops-muted mb-1">Panel de control</p>
        <h1 className="font-display text-5xl text-hops-white uppercase">Dashboard</h1>
      </div>

      {/* Alertas */}
      {!loading && (data?.pending_orders ?? 0) > 0 && (
        <Link to="/admin/pedidos" className="group mb-3 flex items-center justify-between p-4 border border-hops-gold/40 bg-hops-gold/5 hover:bg-hops-gold/10 transition-colors fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-hops-gold shrink-0" />
            <p className="text-hops-gold font-bold text-sm">
              {data!.pending_orders} pedido{data!.pending_orders !== 1 ? 's' : ''} pendiente{data!.pending_orders !== 1 ? 's' : ''} de confirmación
            </p>
          </div>
          <span className="text-xs text-hops-gold group-hover:underline">Ver →</span>
        </Link>
      )}
      {!loading && (data?.pending_reservations ?? 0) > 0 && (
        <Link to="/admin/reservas" className="group mb-6 flex items-center justify-between p-4 border border-hops-gold/40 bg-hops-gold/5 hover:bg-hops-gold/10 transition-colors fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-hops-gold shrink-0" />
            <p className="text-hops-gold font-bold text-sm">
              {data!.pending_reservations} reserva{data!.pending_reservations !== 1 ? 's' : ''} pendiente{data!.pending_reservations !== 1 ? 's' : ''} de confirmación
            </p>
          </div>
          <span className="text-xs text-hops-gold group-hover:underline">Ver →</span>
        </Link>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 fade-in">
          <StatCard icon={<ShoppingBag size={18} />} label="Pedidos hoy" value={String(totalToday)} color="green" />
          <StatCard icon={<AlertTriangle size={18} />} label="Sin confirmar" value={String(data?.pending_orders ?? 0)} color={(data?.pending_orders ?? 0) > 0 ? 'gold' : 'muted'} />
          <StatCard icon={<Calendar size={18} />} label="Reservas activas" value={String(data?.active_reservations ?? 0)} color="green" />
          <StatCard icon={<TrendingUp size={18} />} label="Facturado hoy" value={formatARS(data?.revenue_today ?? 0)} color="gold" small />
        </div>
      )}

      {/* Revenue mes */}
      {!loading && data && (
        <div className="border border-hops-border bg-hops-card p-5 mb-6 flex items-center justify-between fade-in">
          <div>
            <p className="text-xs text-hops-muted uppercase tracking-widest mb-1">Facturado este mes</p>
            <p className="font-display text-4xl text-hops-gold">{formatARS(data.revenue_month)}</p>
          </div>
          <p className="text-xs text-hops-border text-right">pedidos<br />no cancelados</p>
        </div>
      )}

      {/* Pedidos de hoy */}
      {!loading && data && data.orders_today.length > 0 && (
        <div className="border border-hops-border bg-hops-card p-5 mb-6 fade-in">
          <h2 className="text-xs font-bold uppercase tracking-widest text-hops-muted mb-4">Pedidos de hoy por estado</h2>
          <div className="space-y-2">
            {data.orders_today.map(o => (
              <div key={o.status} className="flex items-center justify-between">
                <span className="text-sm text-hops-muted">{ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL] ?? o.status}</span>
                <span className="font-display text-xl text-hops-white">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-hops-muted mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { to: '/admin/pedidos',       label: 'Ver pedidos' },
          { to: '/admin/reservas',      label: 'Ver reservas' },
          { to: '/admin/productos/nuevo', label: 'Nuevo producto' },
          { to: '/admin/stock',         label: 'Actualizar stock' },
        ].map(l => (
          <Link
            key={l.to}
            to={l.to}
            className="border border-hops-border bg-hops-card text-center py-4 text-xs font-bold uppercase tracking-widest text-hops-muted hover:text-hops-green hover:border-hops-green/40 hover:bg-hops-green/5 transition-all duration-150"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, small }: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'green' | 'gold' | 'muted'
  small?: boolean
}) {
  const textColor = color === 'green' ? 'text-hops-green' : color === 'gold' ? 'text-hops-gold' : 'text-hops-muted'
  const borderColor = color === 'green' ? 'border-t-hops-green/40' : color === 'gold' ? 'border-t-hops-gold/40' : 'border-t-hops-border'
  return (
    <div className={`bg-hops-card border border-hops-border border-t-2 ${borderColor} p-4 text-center`}>
      <div className={`flex justify-center mb-2 ${textColor} opacity-60`}>{icon}</div>
      <p className={`font-display leading-none mb-1 ${textColor} ${small ? 'text-xl' : 'text-4xl'}`}>{value}</p>
      <p className="text-[10px] text-hops-muted uppercase tracking-widest">{label}</p>
    </div>
  )
}
