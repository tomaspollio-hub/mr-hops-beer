import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2, Lock } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isAfter, isSameDay, startOfDay, isToday } from 'date-fns'
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

const STEP_LABELS = ['Fechas', 'Barril', 'Tus datos']

function Stepper({ steps, done }: { steps: string[]; done: boolean[] }) {
  const currentStep = done.findIndex(d => !d)
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const isCompleted = done[i]
        const isCurrent   = i === currentStep
        return (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                isCompleted
                  ? 'bg-hops-green text-hops-black'
                  : isCurrent
                    ? 'border-2 border-hops-green text-hops-green bg-transparent'
                    : 'border-2 border-hops-border text-hops-subtle bg-transparent'
              }`}>
                {isCompleted ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                isCompleted ? 'text-hops-green' : isCurrent ? 'text-hops-white' : 'text-hops-subtle'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px transition-colors ${isCompleted ? 'bg-hops-green/40' : 'bg-hops-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepHeader({ num, label, done, locked }: { num: number; label: string; done: boolean; locked: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
        done    ? 'bg-hops-green text-hops-black' :
        locked  ? 'border-2 border-hops-border text-hops-subtle' :
                  'border-2 border-hops-green text-hops-green'
      }`}>
        {done ? <Check size={11} /> : locked ? <Lock size={9} /> : num}
      </div>
      <h2 className={`text-sm font-bold uppercase tracking-wider transition-colors ${
        locked ? 'text-hops-subtle' : 'text-hops-white'
      }`}>{label}</h2>
    </div>
  )
}

export default function Barrels() {
  const navigate = useNavigate()
  const [barrels,     setBarrels]     = useState<BarrelProduct[]>([])
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)

  const [startDate,      setStartDate]      = useState<Date | null>(null)
  const [endDate,        setEndDate]        = useState<Date | null>(null)
  const [calendarMonth,  setCalendarMonth]  = useState(new Date())
  const [selectedVariant, setSelectedVariant] = useState<BarrelVariant | null>(null)
  const [deliveryType,   setDeliveryType]   = useState<'delivery' | 'pickup'>('pickup')
  const [address,        setAddress]        = useState('')
  const [guestName,      setGuestName]      = useState('')
  const [guestEmail,     setGuestEmail]     = useState('')
  const [guestPhone,     setGuestPhone]     = useState('')
  const [notes,          setNotes]          = useState('')
  const [error,          setError]          = useState<string | null>(null)

  const barrelRef = useRef<HTMLDivElement>(null)
  const dataRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      api.get<{ data: BarrelProduct[] }>('/barrels'),
      api.get<{ data: Product[] }>('/products?category=accesorio'),
    ]).then(([b, a]) => {
      setBarrels(b.data)
      setAccessories(a.data.map(p => ({ ...p, selected: false, qty: 1 })))
    }).finally(() => setLoading(false))
  }, [])

  const days  = eachDayOfInterval({ start: startOfMonth(calendarMonth), end: endOfMonth(calendarMonth) })
  const today = startOfDay(new Date())

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return
    if (!startDate || (startDate && endDate)) {
      setStartDate(day); setEndDate(null)
    } else {
      if (isBefore(day, startDate)) { setStartDate(day) } else { setEndDate(day) }
    }
  }

  // When both dates set, scroll to barrel section
  useEffect(() => {
    if (startDate && endDate) {
      setTimeout(() => barrelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }, [startDate, endDate])

  // When barrel selected, scroll to data section
  useEffect(() => {
    if (selectedVariant) {
      setTimeout(() => dataRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }, [selectedVariant])

  const dayClass = (day: Date) => {
    const isPast    = isBefore(day, today)
    const isStart   = startDate && isSameDay(day, startDate)
    const isEnd     = endDate   && isSameDay(day, endDate)
    const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate)
    const todayFlag = isToday(day)

    if (isPast)            return 'text-hops-subtle opacity-40 cursor-not-allowed'
    if (isStart || isEnd)  return 'bg-hops-green text-hops-black font-bold cursor-pointer rounded-lg'
    if (isInRange)         return 'bg-hops-green/15 text-hops-white cursor-pointer'
    return `${todayFlag ? 'text-hops-green font-semibold' : 'text-hops-white'} hover:bg-hops-raised cursor-pointer rounded-lg transition-colors`
  }

  const days_count     = startDate && endDate ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000)) : 0
  const barrelSubtotal = selectedVariant && days_count > 0 ? days_count * selectedVariant.price_per_day : 0
  const accessoryTotal = accessories.filter(a => a.selected).reduce((s, a) => s + a.price * a.qty, 0)
  const totalAmount    = barrelSubtotal + accessoryTotal + (selectedVariant?.deposit ?? 0)

  const toggleAccessory = (id: string) =>
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a))

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
        end_date:   format(endDate,   'yyyy-MM-dd'),
        delivery_type:    deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : undefined,
        notes: notes || undefined,
        guest_name:  guestName,
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

  const step1Done = startDate !== null && endDate !== null
  const step2Done = selectedVariant !== null
  const step3Done = guestName.trim() !== '' && guestEmail.trim() !== ''
  const stepsDone = [step1Done, step2Done, step3Done]

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2">Alquiler de barriles</h1>
      <p className="text-hops-muted mb-6 text-sm">Elegí las fechas, el barril y te lo llevamos o retirás en el local.</p>

      <Stepper steps={STEP_LABELS} done={stepsDone} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resumen */}
        <div className="order-first lg:col-start-3 lg:row-start-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4 text-sm">Resumen</h2>

            {selectedVariant && startDate && endDate ? (
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-hops-muted">Barril {selectedVariant.liters}L</span>
                  <span className="text-hops-white">{days_count} día{days_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hops-muted">Subtotal</span>
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
                  <span className="text-hops-white text-sm uppercase tracking-wider">Total</span>
                  <span className="text-hops-gold text-lg font-display">{formatARS(totalAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-hops-muted text-sm mb-4">
                {!step1Done
                  ? 'Seleccioná las fechas para ver el resumen.'
                  : 'Seleccioná un barril para ver el resumen.'
                }
              </p>
            )}

            {error && (
              <div className="flex items-center gap-2 text-hops-error text-sm bg-hops-error/10 border border-hops-error/20 rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!step1Done || !step2Done || submitting}
              className="btn-gold w-full"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Enviando...</>
                : 'Reservar'
              }
            </button>

            <p className="text-xs text-hops-subtle mt-3 text-center">
              El pago se coordina por WhatsApp tras confirmar.
            </p>
          </div>
        </div>

        {/* Pasos */}
        <div className="order-last lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-4">

          {/* ── PASO 1: Fechas ── */}
          <div className="card">
            <StepHeader num={1} label="Fechas de alquiler" done={step1Done} locked={false} />

            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setCalendarMonth(m => subMonths(m, 1))}
                className="p-2 text-hops-muted hover:text-hops-white hover:bg-hops-raised rounded-lg transition-colors" aria-label="Mes anterior">
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold uppercase tracking-wider text-hops-white capitalize text-sm">
                {format(calendarMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button type="button" onClick={() => setCalendarMonth(m => addMonths(m, 1))}
                className="p-2 text-hops-muted hover:text-hops-white hover:bg-hops-raised rounded-lg transition-colors" aria-label="Mes siguiente">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                <div key={d} className="text-center text-[11px] text-hops-subtle font-bold uppercase py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={isBefore(day, today)}
                  className={`flex items-center justify-center min-h-[36px] sm:min-h-[44px] text-sm font-medium transition-all duration-100 ${dayClass(day)}`}
                  aria-label={format(day, 'd MMMM', { locale: es })}
                >
                  {day.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-4 px-3 py-2.5 bg-hops-raised rounded-lg text-sm text-hops-muted min-h-[42px] flex items-center">
              {startDate && endDate ? (
                <span>
                  <span className="text-hops-green font-medium">{format(startDate, 'dd/MM/yyyy')}</span>
                  {' → '}
                  <span className="text-hops-green font-medium">{format(endDate, 'dd/MM/yyyy')}</span>
                  {' · '}
                  <span className="text-hops-white">{days_count} día{days_count !== 1 ? 's' : ''}</span>
                </span>
              ) : startDate ? (
                <span>Desde <span className="text-hops-green font-medium">{format(startDate, 'dd/MM/yyyy')}</span> — elegí la fecha de devolución</span>
              ) : (
                <span className="text-hops-subtle">Seleccioná la fecha de inicio</span>
              )}
            </div>
          </div>

          {/* ── PASO 2: Barril ── */}
          <div
            ref={barrelRef}
            className={`card transition-opacity duration-300 ${!step1Done ? 'opacity-40 pointer-events-none select-none' : ''}`}
          >
            <StepHeader num={2} label="Elegí el barril" done={step2Done} locked={!step1Done} />

            {!step1Done ? (
              <p className="text-xs text-hops-subtle text-center py-4">Seleccioná las fechas para ver los barriles disponibles</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {barrels.flatMap(b => b.variants.map(v => ({ ...v, barrelName: b.name }))).map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-4 border rounded-xl text-left transition-all duration-150 active:scale-[0.98] ${
                      selectedVariant?.id === v.id
                        ? 'border-hops-green bg-hops-green/10'
                        : 'border-hops-border hover:border-hops-green/40 hover:bg-hops-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-hops-white text-xl font-display tracking-wide">{v.liters}L</span>
                      {selectedVariant?.id === v.id && (
                        <span className="w-5 h-5 rounded-full bg-hops-green flex items-center justify-center">
                          <Check size={11} className="text-hops-black" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-hops-muted">{formatARS(v.price_per_day)}<span className="text-hops-subtle">/día</span></p>
                    {v.deposit > 0 && (
                      <p className="text-xs text-hops-subtle mt-0.5">+ {formatARS(v.deposit)} depósito</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Accesorios (opcional) ── */}
          {accessories.length > 0 && (
            <div className={`card transition-opacity duration-300 ${!step2Done ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border-2 ${step2Done ? 'border-hops-border text-hops-muted' : 'border-hops-border text-hops-subtle'}`}>+</div>
                <h2 className={`text-sm font-bold uppercase tracking-wider ${step2Done ? 'text-hops-white' : 'text-hops-subtle'}`}>
                  Accesorios <span className="text-hops-subtle font-normal normal-case tracking-normal">(opcional)</span>
                </h2>
              </div>
              {!step2Done ? (
                <p className="text-xs text-hops-subtle text-center py-2">Seleccioná un barril para ver los accesorios</p>
              ) : (
                <div className="space-y-3">
                  {accessories.map(acc => (
                    <label key={acc.id} className="flex items-center gap-3 cursor-pointer group py-1">
                      <div
                        onClick={() => toggleAccessory(acc.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                          acc.selected ? 'bg-hops-green border-hops-green' : 'border-hops-border hover:border-hops-green/50'
                        }`}
                      >
                        {acc.selected && <Check size={11} className="text-hops-black" />}
                      </div>
                      <span onClick={() => toggleAccessory(acc.id)} className="flex-1 text-sm text-hops-white group-hover:text-hops-green transition-colors cursor-pointer">
                        {acc.name}
                      </span>
                      <span className="text-hops-gold font-bold text-sm">{formatARS(acc.price)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: Tus datos ── */}
          <div
            ref={dataRef}
            className={`card transition-opacity duration-300 ${!step2Done ? 'opacity-40 pointer-events-none select-none' : ''}`}
          >
            <StepHeader num={3} label="Tus datos" done={step3Done} locked={!step2Done} />

            {!step2Done ? (
              <p className="text-xs text-hops-subtle text-center py-4">Seleccioná un barril para continuar</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Nombre <span className="text-hops-error">*</span></label>
                    <input value={guestName} onChange={e => setGuestName(e.target.value)} required className="input-field" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Email <span className="text-hops-error">*</span></label>
                    <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required className="input-field" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">WhatsApp</label>
                    <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="input-field" placeholder="11 1234-5678" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-hops-muted uppercase tracking-widest mb-2">Entrega</label>
                  <div className="flex gap-3">
                    {(['pickup', 'delivery'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setDeliveryType(t)}
                        className={`flex-1 py-3 border rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                          deliveryType === t
                            ? 'border-hops-green bg-hops-green/10 text-hops-green'
                            : 'border-hops-border text-hops-muted hover:border-hops-green/30 hover:bg-hops-raised'
                        }`}>
                        {t === 'pickup' ? 'Retiro en local' : 'Delivery'}
                      </button>
                    ))}
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="mb-4">
                    <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">Dirección <span className="text-hops-error">*</span></label>
                    <input value={address} onChange={e => setAddress(e.target.value)} className="input-field" placeholder="Calle 123, Localidad" />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                    Notas <span className="text-hops-subtle font-normal normal-case tracking-normal">(opcional)</span>
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-field resize-none" placeholder="Notas adicionales..." />
                </div>
              </>
            )}
          </div>

        </div>
      </form>
    </div>
  )
}
