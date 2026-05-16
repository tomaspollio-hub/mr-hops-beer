import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { formatARS } from '@/lib/utils'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <h1 className="section-title mb-8">Confirmar pedido</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Datos personales */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Tus datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nombre *</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="input-field" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="tu@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">WhatsApp</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="11 1234-5678" />
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Entrega</h2>
            <div className="flex gap-3 mb-4">
              {(['pickup', 'delivery'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeliveryType(t)}
                  className={`flex-1 py-3 border rounded-sm text-sm font-bold uppercase tracking-wider transition-colors ${deliveryType === t ? 'border-hops-green bg-hops-green/10 text-hops-green' : 'border-hops-border text-hops-muted hover:border-hops-green/50'}`}
                >
                  {t === 'pickup' ? 'Retiro en local' : 'Delivery a domicilio'}
                </button>
              ))}
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Dirección *</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="input-field" placeholder="Calle 123, Localidad" />
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="card">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Notas (opcional)</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input-field resize-none" placeholder="Indicaciones especiales..." />
          </div>

          {/* Legal */}
          <p className="text-xs text-hops-muted px-1">
            Al confirmar el pedido declarás tener 18 años o más. El pago y la coordinación de entrega se realizan por WhatsApp.
            <strong className="block mt-1 uppercase tracking-wider">BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.</strong>
          </p>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Tu pedido</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <span className="text-hops-muted truncate mr-2">{product.name} ×{quantity}</span>
                  <span className="text-hops-white shrink-0">{formatARS(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-hops-border pt-3 mb-6 flex justify-between items-center">
              <span className="font-bold text-hops-white uppercase tracking-wider">Total</span>
              <span className="font-display text-2xl text-hops-gold">{formatARS(total())}</span>
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
