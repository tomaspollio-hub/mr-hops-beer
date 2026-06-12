import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { buildWhatsAppUrl, orderWhatsAppMessage } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5491100000000'

interface OrderData {
  id: string
  order_number: string
  status: string
  total: number
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ data: OrderData }>(`/my/orders`)
      .catch(() => null)
      .finally(() => setLoading(false))

    // Intentamos obtener los datos del pedido. Si el usuario es guest no
    // tiene token, pero el número de pedido viene del redirect anterior.
    // Guardamos el número en sessionStorage durante el checkout.
    const stored = sessionStorage.getItem(`order_${id}`)
    if (stored) {
      setOrder(JSON.parse(stored))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [id])

  const orderNumber = order?.order_number ?? `#${id?.slice(0, 8).toUpperCase()}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6 pop-in">
        <CheckCircle size={64} className="text-hops-green" />
      </div>

      <h1 className="font-display text-4xl uppercase tracking-wider text-hops-white mb-2">
        ¡Pedido recibido!
      </h1>
      <p className="text-hops-muted mb-2">Tu pedido fue enviado correctamente.</p>

      {loading ? (
        <Spinner className="mx-auto my-4" />
      ) : (
        <div className="card my-8 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-hops-muted text-sm">Número de pedido</span>
            <span className="font-bold text-hops-green">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hops-muted text-sm">Estado</span>
            <span className="badge bg-hops-gold/20 text-hops-gold">Pendiente de confirmación</span>
          </div>
        </div>
      )}

      <p className="text-hops-muted mb-8">
        Te vamos a contactar por WhatsApp para confirmar el pedido y coordinar el pago y la entrega.
      </p>

      <a
        href={buildWhatsAppUrl(WA_NUMBER, orderWhatsAppMessage(orderNumber))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center justify-center gap-2 mb-4"
      >
        <MessageCircle size={20} />
        Contactar por WhatsApp
      </a>

      <div className="block">
        <Link to="/productos" className="text-sm text-hops-muted hover:text-hops-white transition-colors">
          Seguir comprando →
        </Link>
      </div>

      <p className="text-xs text-hops-muted uppercase tracking-widest mt-10">
        BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.
      </p>
    </div>
  )
}
