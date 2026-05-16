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
  created_at: string
}

interface CustomerDetail extends Customer {
  orders: Pick<Order, 'id' | 'order_number' | 'status' | 'total' | 'created_at'>[]
  reservations: Pick<BarrelReservation, 'id' | 'reservation_number' | 'status' | 'total' | 'start_date' | 'end_date'>[]
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    api.get<{ data: Customer[] }>('/admin/customers')
      .then(r => setCustomers(r.data))
      .finally(() => setLoading(false))
  }, [])

  const loadDetail = (id: string) => {
    setLoadingDetail(true)
    api.get<{ data: CustomerDetail }>(`/admin/customers/${id}`)
      .then(r => setSelected(r.data))
      .finally(() => setLoadingDetail(false))
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lista */}
      <div>
        <h1 className="section-title mb-6">Clientes</h1>
        <p className="text-hops-muted text-sm mb-4">{customers.length} registrados</p>

        {customers.length === 0 && (
          <p className="text-hops-muted text-center py-12">No hay clientes registrados todavía.</p>
        )}

        <div className="space-y-2">
          {customers.map(c => (
            <button
              key={c.id}
              onClick={() => loadDetail(c.id)}
              className={`w-full card text-left hover:border-hops-green/40 transition-colors ${selected?.id === c.id ? 'border-hops-green/50 bg-hops-green/5' : ''}`}
            >
              <p className="font-bold text-hops-white text-sm">{c.name}</p>
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

        {!loadingDetail && !selected && (
          <div className="card text-center py-12 text-hops-muted text-sm">
            Seleccioná un cliente para ver su historial
          </div>
        )}

        {!loadingDetail && selected && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-hops-white mb-1">{selected.name}</h2>
              <p className="text-sm text-hops-muted">{selected.email}</p>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-hops-green hover:underline">
                  {selected.phone} → WhatsApp
                </a>
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
                        <span className="text-hops-muted ml-2 text-xs">
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
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
