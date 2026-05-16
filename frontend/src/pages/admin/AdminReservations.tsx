import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatARS, formatDate, RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR, RESERVATION_TRANSITIONS } from '@/lib/utils'
import { type ReservationStatus } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

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
  { label: 'Todas', value: '' },
  { label: 'Sin confirmar', value: 'pending_confirmation' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Barril entregado', value: 'barrel_delivered' },
  { label: 'Devuelto', value: 'barrel_returned' },
  { label: 'Canceladas', value: 'cancelled' },
]

export default function AdminReservations() {
  const [params, setParams] = useSearchParams()
  const statusFilter = params.get('status') ?? ''
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

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

      {loading && <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>}

      {!loading && reservations.length === 0 && (
        <p className="text-hops-muted text-center py-16">No hay reservas{statusFilter ? ' con este estado' : ''}.</p>
      )}

      {!loading && reservations.length > 0 && (
        <div className="space-y-4">
          {reservations.map(r => {
            const allowedNext = RESERVATION_TRANSITIONS[r.status] ?? []
            return (
              <div key={r.id} className="card">
                <div className="flex flex-wrap items-start gap-4 justify-between mb-3">
                  <div>
                    <p className="font-bold text-hops-green">{r.reservation_number}</p>
                    <p className="text-sm text-hops-white mt-0.5">{r.barrel_name} — {r.liters}L</p>
                    <p className="text-xs text-hops-muted mt-1">
                      {formatDate(r.start_date)} → {formatDate(r.end_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={RESERVATION_STATUS_COLOR[r.status]}>
                      {RESERVATION_STATUS_LABEL[r.status]}
                    </Badge>
                    <p className="text-hops-gold font-bold mt-1">{formatARS(r.total)}</p>
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
                        target="_blank" rel="noopener noreferrer"
                        className="ml-3 text-xs text-hops-green hover:underline"
                      >
                        WhatsApp →
                      </a>
                    )}
                  </div>

                  {/* Acciones */}
                  {allowedNext.length > 0 && (
                    <div className="flex gap-2">
                      {allowedNext.map(next => (
                        <button
                          key={next}
                          disabled={updating === r.id}
                          onClick={() => changeStatus(r.id, r.status, next)}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-sm transition-colors disabled:opacity-50
                            ${next === 'cancelled' ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-hops-green text-hops-green hover:bg-hops-green/10'}`}
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
