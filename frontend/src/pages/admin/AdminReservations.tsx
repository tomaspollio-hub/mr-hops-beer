import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InboxIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { formatARS, formatDate, RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR, RESERVATION_TRANSITIONS } from '@/lib/utils'
import { type ReservationStatus } from '@/types'
import Badge from '@/components/ui/Badge'
import { SkeletonOrderCard } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface Reservation {
  id: string
  reservation_number: string
  guest_name?: string
  guest_phone?: string
  status: ReservationStatus
  start_date: string
  end_date: string
  liters: number
  barrel_name: string
  total: number
  deposit_amount: number
}

const STATUS_FILTERS = [
  { label: 'Todas',           value: '' },
  { label: 'Sin confirmar',   value: 'pending_confirmation' },
  { label: 'Confirmadas',     value: 'confirmed' },
  { label: 'Barril entregado', value: 'barrel_delivered' },
  { label: 'Devuelto',        value: 'barrel_returned' },
  { label: 'Canceladas',      value: 'cancelled' },
]

export default function AdminReservations() {
  const [params, setParams]       = useSearchParams()
  const statusFilter              = params.get('status') ?? ''
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const path = statusFilter ? `/admin/reservations?status=${statusFilter}` : '/admin/reservations'
    api.get<{ data: Reservation[] }>(path)
      .then(r => setReservations(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [statusFilter])

  const changeStatus = async (id: string, current: ReservationStatus, next: ReservationStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/admin/reservations/${id}/status`, { status: next })
      load()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <h1 className="section-title mb-6">Reservas de barriles</h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setParams(f.value ? { status: f.value } : {})}
            className={cn('filter-tab shrink-0', statusFilter === f.value ? 'filter-tab-active' : 'filter-tab-inactive')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonOrderCard key={i} />)}
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-hops-raised flex items-center justify-center mx-auto mb-4">
            <InboxIcon size={28} className="text-hops-subtle" />
          </div>
          <p className="text-hops-muted">No hay reservas{statusFilter ? ' con este estado' : ''}.</p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="space-y-4">
          {reservations.map(r => {
            const allowedNext = RESERVATION_TRANSITIONS[r.status] ?? []
            return (
              <div
                key={r.id}
                className="card border-l-2 border-transparent hover:border-l-hops-green hover:bg-hops-raised/30 transition-all duration-150"
              >
                <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
                  <div>
                    <p className="font-bold text-hops-green font-display tracking-wide">{r.reservation_number}</p>
                    <p className="text-sm text-hops-white mt-0.5">{r.barrel_name} — {r.liters}L</p>
                    <p className="text-xs text-hops-muted mt-1">
                      {formatDate(r.start_date)} → {formatDate(r.end_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={RESERVATION_STATUS_COLOR[r.status]}>
                      {RESERVATION_STATUS_LABEL[r.status]}
                    </Badge>
                    <p className="text-hops-gold font-bold mt-1.5">{formatARS(r.total)}</p>
                    {r.deposit_amount > 0 && (
                      <p className="text-xs text-hops-muted">Depósito: {formatARS(r.deposit_amount)}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Cliente */}
                  <div className="text-sm">
                    <span className="text-hops-white">{r.guest_name ?? 'Usuario registrado'}</span>
                    {r.guest_phone && (
                      <a
                        href={`https://wa.me/${r.guest_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-xs text-hops-green hover:text-hops-green-light transition-colors"
                      >
                        WhatsApp →
                      </a>
                    )}
                  </div>

                  {/* Acciones */}
                  {allowedNext.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {allowedNext.map(next => (
                        <button
                          key={next}
                          disabled={updating === r.id}
                          onClick={() => changeStatus(r.id, r.status, next)}
                          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-150 disabled:opacity-40 active:scale-[0.97] ${
                            next === 'cancelled'
                              ? 'border-hops-error/40 text-hops-error hover:bg-hops-error/10'
                              : 'border-hops-green text-hops-green hover:bg-hops-green/10'
                          }`}
                        >
                          → {RESERVATION_STATUS_LABEL[next]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
