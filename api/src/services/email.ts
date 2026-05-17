import { type Env } from '@/types'

const FROM = 'Mr. Hops Beer <onboarding@resend.dev>'

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
    body: JSON.stringify({ from: FROM, to: payload.to, subject: payload.subject, html: payload.html }),
  })

  if (!res.ok) {
    console.error('[EMAIL ERROR]', await res.text())
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function baseHtml(title: string, body: string): string {
  return `
    <!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a0a0a;color:#f5f5f5;margin:0;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:32px">
      <h1 style="color:#7EC825;font-size:20px;margin-top:0">🍺 Mr. Hops Beer</h1>
      <h2 style="font-size:16px;margin-bottom:24px">${title}</h2>
      ${body}
      <hr style="border-color:#2a2a2a;margin:24px 0"/>
      <p style="color:#888;font-size:12px;margin:0">Mr. Hops Beer — Cervecería artesanal</p>
    </div></body></html>
  `
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  confirmed: '✅ Tu pedido fue confirmado',
  ready:     '📦 Tu pedido está listo',
  cancelled: '❌ Tu pedido fue cancelado',
}

const RESERVATION_STATUS_LABELS: Record<string, string> = {
  confirmed: '✅ Tu reserva de barril fue confirmada',
  cancelled: '❌ Tu reserva fue cancelada',
}

export function orderStatusEmailHtml(order: {
  order_number: string
  status: string
  guest_name?: string
  total: number
  delivery_type: string
  delivery_address?: string
}): string | null {
  const title = ORDER_STATUS_LABELS[order.status]
  if (!title) return null

  const deliveryLine = order.delivery_type === 'delivery'
    ? `Delivery a: ${order.delivery_address}`
    : 'Retiro en local'

  return baseHtml(title, `
    <p>Hola <strong>${order.guest_name ?? 'cliente'}</strong>,</p>
    <p>${title} — <strong>${order.order_number}</strong></p>
    <p style="color:#aaa">${deliveryLine}</p>
    <p>Total: <strong style="color:#F5C518">$${order.total.toLocaleString('es-AR')}</strong></p>
    ${order.status === 'cancelled'
      ? '<p>Si tenés alguna duda, escribinos por WhatsApp.</p>'
      : '<p>Cualquier consulta escribinos por WhatsApp o Instagram <strong>@mr.hopsbeer</strong></p>'
    }
  `)
}

export function reservationStatusEmailHtml(res: {
  reservation_number: string
  status: string
  guest_name?: string
  liters: number
  start_date: string
  end_date: string
  total: number
}): string | null {
  const title = RESERVATION_STATUS_LABELS[res.status]
  if (!title) return null

  return baseHtml(title, `
    <p>Hola <strong>${res.guest_name ?? 'cliente'}</strong>,</p>
    <p>${title} — <strong>${res.reservation_number}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="color:#888;padding:4px 0">Barril</td><td><strong>${res.liters}L</strong></td></tr>
      <tr><td style="color:#888;padding:4px 0">Desde</td><td>${res.start_date}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Hasta</td><td>${res.end_date}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Total</td><td><strong style="color:#F5C518">$${res.total.toLocaleString('es-AR')}</strong></td></tr>
    </table>
    <p>Cualquier consulta escribinos por WhatsApp o Instagram <strong>@mr.hopsbeer</strong></p>
  `)
}

export function passwordResetEmailHtml(name: string, resetLink: string): string {
  return baseHtml('Recuperar contraseña', `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Recibiste este email porque solicitaste restablecer tu contraseña en Mr. Hops Beer.</p>
    <p style="margin:24px 0">
      <a href="${resetLink}"
         style="display:inline-block;background:#7EC825;color:#0a0a0a;font-weight:bold;padding:12px 24px;text-decoration:none;font-size:14px;letter-spacing:0.05em">
        RESTABLECER CONTRASEÑA
      </a>
    </p>
    <p style="color:#888;font-size:12px">Este enlace expira en 1 hora. Si no solicitaste este cambio, podés ignorar este email.</p>
  `)
}

export function welcomeEmailHtml(name: string): string {
  return baseHtml('¡Bienvenido a Mr. Hops Beer!', `
    <p>Hola <strong>${name}</strong>, gracias por registrarte.</p>
    <p>Ya podés explorar nuestra selección de cervezas artesanales y hacer tu primer pedido.</p>
    <p>Seguinos en Instagram <strong>@mr.hopsbeer</strong> para novedades y lanzamientos.</p>
    <p>¡Salud! 🍺</p>
  `)
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

  const itemsRows = order.items
    ?.map(i => `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px">${i.quantity}</td><td style="padding:4px 8px">$${i.unit_price}</td></tr>`)
    .join('') ?? ''

  return baseHtml(`Nuevo pedido ${order.order_number}`, `
    <p><strong>Cliente:</strong> ${order.guest_name ?? 'Usuario registrado'}</p>
    <p><strong>Email:</strong> ${order.guest_email ?? '-'}</p>
    <p><strong>WhatsApp:</strong> ${order.guest_phone ?? '-'}</p>
    <p><strong>Entrega:</strong> ${deliveryLine}</p>
    ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
    <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p><strong>Total: $${order.total}</strong></p>
  `)
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
  return baseHtml(`Nueva reserva ${res.reservation_number}`, `
    <p><strong>Cliente:</strong> ${res.guest_name ?? 'Usuario registrado'}</p>
    <p><strong>WhatsApp:</strong> ${res.guest_phone ?? '-'}</p>
    <p><strong>Barril:</strong> ${res.liters}L</p>
    <p><strong>Desde:</strong> ${res.start_date} — <strong>Hasta:</strong> ${res.end_date}</p>
    <p><strong>Total:</strong> $${res.total}</p>
    <p><strong>Depósito:</strong> $${res.deposit_amount}</p>
  `)
}
