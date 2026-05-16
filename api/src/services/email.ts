import { type Env } from '@/types'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(env: Env, payload: EmailPayload): Promise<void> {
  if (env.ENVIRONMENT === 'development') {
    console.log('[EMAIL DEV]', payload.subject, '->', payload.to)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mr. Hops Beer <noreply@mrhopsbeer.com.ar>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!res.ok) {
    console.error('[EMAIL ERROR]', await res.text())
  }
}

export function newOrderEmailHtml(order: {
  order_number: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  delivery_type: string
  delivery_address?: string
  notes?: string
  total: number
  items?: { name: string; quantity: number; unit_price: number }[]
}): string {
  const deliveryLine = order.delivery_type === 'delivery'
    ? `Delivery a: ${order.delivery_address}`
    : 'Retiro en local'

  const itemsHtml = order.items
    ?.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.unit_price}</td></tr>`)
    .join('') ?? ''

  return `
    <h2>Nuevo pedido ${order.order_number}</h2>
    <p><strong>Cliente:</strong> ${order.guest_name ?? 'Usuario registrado'}</p>
    <p><strong>Email:</strong> ${order.guest_email ?? '-'}</p>
    <p><strong>WhatsApp:</strong> ${order.guest_phone ?? '-'}</p>
    <p><strong>Entrega:</strong> ${deliveryLine}</p>
    ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
    <table border="1" cellpadding="8">
      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total: $${order.total}</strong></p>
  `
}

export function newReservationEmailHtml(res: {
  reservation_number: string
  guest_name?: string
  guest_phone?: string
  liters: number
  start_date: string
  end_date: string
  total: number
  deposit_amount: number
}): string {
  return `
    <h2>Nueva reserva de barril ${res.reservation_number}</h2>
    <p><strong>Cliente:</strong> ${res.guest_name ?? 'Usuario registrado'}</p>
    <p><strong>WhatsApp:</strong> ${res.guest_phone ?? '-'}</p>
    <p><strong>Barril:</strong> ${res.liters}L</p>
    <p><strong>Desde:</strong> ${res.start_date} — <strong>Hasta:</strong> ${res.end_date}</p>
    <p><strong>Total:</strong> $${res.total}</p>
    <p><strong>Depósito:</strong> $${res.deposit_amount}</p>
  `
}
