import { useParams, Link } from 'react-router-dom'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, reservationWhatsAppMessage } from '@/lib/utils'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5491100000000'

export default function ReservationConfirmation() {
  const { id } = useParams<{ id: string }>()
  const reservationNumber = `MH-R-${id?.slice(0, 4).toUpperCase() ?? '0001'}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-hops-green" />
      </div>

      <h1 className="font-display text-4xl uppercase tracking-wider text-hops-white mb-2">
        ¡Reserva enviada!
      </h1>
      <p className="text-hops-muted mb-2">Tu solicitud de reserva de barril fue recibida.</p>

      <div className="card my-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-hops-muted text-sm">Número de reserva</span>
          <span className="font-bold text-hops-green">{reservationNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-hops-muted text-sm">Estado</span>
          <span className="badge bg-hops-gold/20 text-hops-gold">Pendiente de confirmación</span>
        </div>
      </div>

      <p className="text-hops-muted mb-8">
        Nos comunicaremos por WhatsApp para confirmar la disponibilidad, coordinar la entrega y el pago del depósito.
      </p>

      <a
        href={buildWhatsAppUrl(WA_NUMBER, reservationWhatsAppMessage(reservationNumber))}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold inline-flex items-center justify-center gap-2 mb-4"
      >
        <MessageCircle size={20} />
        Contactar por WhatsApp
      </a>

      <div className="block">
        <Link to="/" className="text-sm text-hops-muted hover:text-hops-white transition-colors">
          Volver al inicio →
        </Link>
      </div>

      <p className="text-xs text-hops-muted uppercase tracking-widest mt-10">
        BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.
      </p>
    </div>
  )
}
