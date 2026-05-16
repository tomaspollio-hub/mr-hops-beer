import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { api } from '@/lib/api'
import { formatARS } from '@/lib/utils'
import { type BarrelVariant, type Product } from '@/types'
import Spinner from '@/components/ui/Spinner'

interface BarrelProduct extends Product {
  variants: BarrelVariant[]
}

interface AccessoryProduct extends Product {
  selected: boolean
  qty: number
}

export default function Barrels() {
  const navigate = useNavigate()
  const [barrels, setBarrels] = useState<BarrelProduct[]>([])
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedVariant, setSelectedVariant] = useState<BarrelVariant | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [address, setAddress] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<{ data: BarrelProduct[] }>('/barrels'),
      api.get<{ data: Product[] }>('/products?category=accesorio'),
    ]).then(([b, a]) => {
      setBarrels(b.data)
      setAccessories(a.data.map(p => ({ ...p, selected: false, qty: 1 })))
    }).finally(() => setLoading(false))
  }, [])

  // Consultar disponibilidad cuando cambia el mes o la variante
  useEffect(() => {
    if (!selectedVariant) return
    const start = format(startOfMonth(calendarMonth), 'yyyy-MM-dd')
    const end = format(endOfMonth(calendarMonth), 'yyyy-MM-dd')
    api.get<{ data: { available: boolean } }>(
      `/barrels/${selectedVariant.id}/availability?start=${start}&end=${end}`,
    ).then(res => {
      // Marca todo el mes como disponible o no (simplificado)
      // En producción se consultaría día a día o con un endpoint de rango
      setAvailability({ [`${start}/${end}`]: res.data.available })
    }).catch(() => {})
  }, [selectedVariant, calendarMonth])

  const days = eachDayOfInterval({ start: startOfMonth(calendarMonth), end: endOfMonth(calendarMonth) })
  const today = startOfDay(new Date())

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return
    if (!startDate || (startDate && endDate)) {
      setStartDate(day)
      setEndDate(null)
    } else {
      if (isBefore(day, startDate)) {
        setStartDate(day)
      } else {
        setEndDate(day)
      }
    }
  }

  const dayClass = (day: Date) => {
    const isPast = isBefore(day, today)
    const isStart = startDate && isSameDay(day, startDate)
    const isEnd = endDate && isSameDay(day, endDate)
    const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate)

    if (isPast) return 'text-hops-border cursor-not-allowed'
    if (isStart || isEnd) return 'bg-hops-green text-hops-black font-bold cursor-pointer rounded-sm'
    if (isInRange) return 'bg-hops-green/20 text-hops-white cursor-pointer'
    return 'text-hops-white hover:bg-hops-border cursor-pointer rounded-sm'
  }

  const days_count = startDate && endDate
    ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000))
    : 0

  const barrelSubtotal = selectedVariant && days_count > 0 ? days_count * selectedVariant.price_per_day : 0
  const accessoryTotal = accessories.filter(a => a.selected).reduce((s, a) => s + a.price * a.qty, 0)
  const total = barrelSubtotal + accessoryTotal + (selectedVariant?.deposit ?? 0)

  const toggleAccessory = (id: string) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariant || !startDate || !endDate) return setError('Seleccioná barril y fechas')
    if (!guestName || !guestEmail) return setError('Nombre y email son requeridos')
    if (deliveryType === 'delivery' && !address) return setError('Ingresá la dirección de entrega')

    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post<{ data: { id: string; reservation_number: string } }>('/reservations', {
        barrel_variant_id: selectedVariant.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : undefined,
        notes: notes || undefined,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || undefined,
        accessories: accessories.filter(a => a.selected).map(a => ({ product_id: a.id, quantity: a.qty })),
      })
      navigate(`/reserva/${res.data.id}/confirmacion`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-12 h-12" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">Alquiler de barriles</h1>
      <p className="text-hops-muted mb-10">Elegí el barril, las fechas y te lo llevamos o retirás en el local.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Selección de barril */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">1. Elegí el barril</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {barrels.flatMap(b => b.variants.map(v => ({ ...v, barrelName: b.name }))).map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`p-4 border rounded-sm text-left transition-all ${selectedVariant?.id === v.id ? 'border-hops-green bg-hops-green/10' : 'border-hops-border hover:border-hops-green/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-hops-white text-lg">{v.liters}L</span>
                    {selectedVariant?.id === v.id && <Check size={16} className="text-hops-green" />}
                  </div>
                  <p className="text-sm text-hops-muted mt-1">{formatARS(v.price_per_day)}/día</p>
                  {v.deposit > 0 && <p className="text-xs text-hops-muted">+ {formatARS(v.deposit)} depósito</p>}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Calendario */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">2. Seleccioná las fechas</h2>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setCalendarMonth(m => subMonths(m, 1))} className="p-1 text-hops-muted hover:text-hops-white">
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold uppercase tracking-wider text-hops-white capitalize">
                {format(calendarMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button type="button" onClick={() => setCalendarMonth(m => addMonths(m, 1))} className="p-1 text-hops-muted hover:text-hops-white">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                <div key={d} className="text-xs text-hops-muted font-bold uppercase py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Días vacíos al inicio del mes */}
              {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`py-2 text-sm transition-colors ${dayClass(day)}`}
                >
                  {day.getDate()}
                </button>
              ))}
            </div>

            {startDate && (
              <p className="text-sm text-hops-muted mt-4">
                {endDate
                  ? `${format(startDate, 'dd/MM/yyyy')} → ${format(endDate, 'dd/MM/yyyy')} (${days_count} día${days_count !== 1 ? 's' : ''})`
                  : `Desde ${format(startDate, 'dd/MM/yyyy')} — elegí la fecha de devolución`}
              </p>
            )}
          </div>

          {/* 3. Accesorios */}
          {accessories.length > 0 && (
            <div className="card">
              <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">3. Accesorios (opcional)</h2>
              <div className="space-y-3">
                {accessories.map(acc => (
                  <label key={acc.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acc.selected}
                      onChange={() => toggleAccessory(acc.id)}
                      className="w-4 h-4 accent-hops-green"
                    />
                    <span className="flex-1 text-hops-white group-hover:text-hops-green transition-colors">{acc.name}</span>
                    <span className="text-hops-gold font-bold">{formatARS(acc.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Datos de contacto */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">4. Tus datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nombre *</label>
                <input value={guestName} onChange={e => setGuestName(e.target.value)} required className="input-field" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email *</label>
                <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required className="input-field" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">WhatsApp</label>
                <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="input-field" placeholder="11 1234-5678" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-hops-muted uppercase tracking-wider mb-2">Entrega</label>
              <div className="flex gap-3">
                {(['pickup', 'delivery'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setDeliveryType(t)}
                    className={`px-4 py-2 border rounded-sm text-sm font-bold uppercase tracking-wider transition-colors ${deliveryType === t ? 'border-hops-green bg-hops-green/10 text-hops-green' : 'border-hops-border text-hops-muted hover:border-hops-green/50'}`}>
                    {t === 'pickup' ? 'Retiro en local' : 'Delivery'}
                  </button>
                ))}
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div className="mt-4">
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Dirección *</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="input-field" placeholder="Calle 123, Localidad" />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Notas</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-field resize-none" placeholder="Notas adicionales..." />
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Resumen</h2>

            {selectedVariant ? (
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-hops-muted">Barril {selectedVariant.liters}L</span>
                  <span className="text-hops-white">{days_count} día{days_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hops-muted">Subtotal barril</span>
                  <span className="text-hops-white">{formatARS(barrelSubtotal)}</span>
                </div>
                {accessories.filter(a => a.selected).map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="text-hops-muted">{a.name}</span>
                    <span className="text-hops-white">{formatARS(a.price)}</span>
                  </div>
                ))}
                {selectedVariant.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-hops-muted">Depósito</span>
                    <span className="text-hops-white">{formatARS(selectedVariant.deposit)}</span>
                  </div>
                )}
                <div className="border-t border-hops-border pt-2 flex justify-between font-bold">
                  <span className="text-hops-white">Total</span>
                  <span className="text-hops-gold text-lg">{formatARS(total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-hops-muted text-sm mb-4">Seleccioná un barril y las fechas</p>
            )}

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              type="submit"
              disabled={!selectedVariant || !startDate || !endDate || submitting}
              className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Reservar'}
            </button>

            <p className="text-xs text-hops-muted mt-3 text-center">
              El pago se coordina por WhatsApp tras confirmar.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
