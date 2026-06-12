import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatARS } from '@/lib/utils'

const STEPS = ['Tus datos', 'Entrega', 'Confirmar']

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [name, setName]                 = useState(user?.name ?? '')
  const [email, setEmail]               = useState(user?.email ?? '')
  const [phone, setPhone]               = useState(user?.phone ?? '')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [address, setAddress]           = useState('')
  const [notes, setNotes]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-hops-muted mb-4">Tu carrito está vacío.</p>
        <Link to="/productos" className="btn-primary">Ver productos</Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deliveryType === 'delivery' && !address) return setError('Ingresá la dirección de entrega')
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post<{ data: { id: string } }>('/orders', {
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : undefined,
        notes: notes || undefined,
        guest_name: name,
        guest_email: email,
        guest_phone: phone || undefined,
      })
      clearCart()
      navigate(`/pedido/${res.data.id}/confirmacion`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Header + stepper */}
      <div className="mb-8">
        <h1 className="section-title mb-5">Confirmar pedido</h1>
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 2 ? 'bg-hops-green text-hops-black' : 'border-2 border-hops-green text-hops-green'}`}>
                  {i < 2 ? <Check size={10} /> : i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${i < 2 ? 'text-hops-green' : 'text-hops-muted'}`}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-hops-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resumen — primero en mobile, col 3 en desktop */}
        <div className="order-first lg:col-start-3 lg:row-start-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4 text-sm">Tu pedido</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-2">
                  <span className="text-hops-muted truncate">{product.name} ×{quantity}</span>
                  <span className="text-hops-white shrink-0">{formatARS(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-hops-border pt-3 mb-5 flex justify-between items-center">
              <span className="font-bold text-hops-white uppercase tracking-wider text-sm">Total</span>
              <span className="font-display text-2xl text-hops-gold">{formatARS(total())}</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-hops-error text-sm bg-hops-error/10 border border-hops-error/20 rounded-lg px-3 py-2.5 mb-4 menu-enter">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin mr-1.5" /> Enviando...</>
                : 'Confirmar pedido'
              }
            </button>
          </div>
        </div>

        {/* Formulario — segundo en mobile, cols 1-2 en desktop */}
        <div className="order-last lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-5">

          {/* Datos personales */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-hops-white mb-4">
              1. Tus datos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                  Nombre <span className="text-hops-error">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                  Email <span className="text-hops-error">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                  WhatsApp
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="11 1234-5678"
                />
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-hops-white mb-4">
              2. Entrega
            </h2>
            <div className="flex gap-3 mb-4">
              {(['pickup', 'delivery'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeliveryType(t)}
                  className={`flex-1 py-3 border rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
                    deliveryType === t
                      ? 'border-hops-green bg-hops-green/10 text-hops-green'
                      : 'border-hops-border text-hops-muted hover:border-hops-green/30 hover:bg-hops-raised'
                  }`}
                >
                  {t === 'pickup' ? 'Retiro en local' : 'Delivery'}
                </button>
              ))}
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-widest mb-1.5">
                  Dirección <span className="text-hops-error">*</span>
                </label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="Calle 123, Localidad"
                />
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="card">
            <h2 className="text-sm font-bold uppercase tracking-wider text-hops-white mb-4">
              3. Notas <span className="text-hops-subtle font-normal normal-case tracking-normal">(opcional)</span>
            </h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Indicaciones especiales..."
            />
          </div>

          {/* Legal */}
          <p className="text-xs text-hops-subtle leading-relaxed px-1">
            Al confirmar el pedido declarás tener 18 años o más. El pago y la coordinación de entrega se realizan por WhatsApp.{' '}
            <strong className="text-hops-muted uppercase tracking-wider">
              Beber con moderación. Prohibida la venta a menores de 18 años.
            </strong>
          </p>
        </div>

      </form>
    </div>
  )
}
