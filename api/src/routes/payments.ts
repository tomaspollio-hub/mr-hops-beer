import { Hono } from 'hono'
import { type Env } from '@/types'

const app = new Hono<{ Bindings: Env }>()

const MP_API = 'https://api.mercadopago.com'

// POST /api/payments/preference — crea preferencia de pago para un pedido
app.post('/preference', async c => {
  const body = await c.req.json<{ order_id: string }>()
  if (!body.order_id) return c.json({ error: 'order_id requerido' }, 400)

  const order = await c.env.DB.prepare(`
    SELECT o.id, o.order_number, o.total, o.guest_email, o.guest_name, o.user_id,
           GROUP_CONCAT(p.name || '|' || oi.quantity || '|' || oi.unit_price) as items_raw
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.id = ? AND o.payment_status = 'unpaid'
    GROUP BY o.id
  `).bind(body.order_id).first<{
    id: string; order_number: string; total: number
    guest_email: string | null; guest_name: string | null; user_id: string | null
    items_raw: string | null
  }>()

  if (!order) return c.json({ error: 'Pedido no encontrado o ya pagado' }, 404)

  // Resolve buyer email
  let payerEmail = order.guest_email
  if (!payerEmail && order.user_id) {
    const user = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?')
      .bind(order.user_id).first<{ email: string }>()
    payerEmail = user?.email ?? null
  }

  const items = (order.items_raw ?? '').split(',').filter(Boolean).map(row => {
    const [title, quantity, unit_price] = row.split('|')
    return { title, quantity: parseInt(quantity, 10), unit_price: parseFloat(unit_price), currency_id: 'ARS' }
  })

  const preference = {
    items: items.length ? items : [{ title: `Pedido ${order.order_number}`, quantity: 1, unit_price: order.total, currency_id: 'ARS' }],
    payer: payerEmail ? { email: payerEmail } : undefined,
    external_reference: order.id,
    back_urls: {
      success: `${c.env.FRONTEND_URL}/pedido/${order.id}/confirmacion?payment=success`,
      failure: `${c.env.FRONTEND_URL}/pedido/${order.id}/confirmacion?payment=failure`,
      pending: `${c.env.FRONTEND_URL}/pedido/${order.id}/confirmacion?payment=pending`,
    },
    auto_return: 'approved',
    notification_url: `${c.env.FRONTEND_URL?.replace('pages.dev', 'workers.dev') ?? ''}/api/payments/webhook`,
    statement_descriptor: 'MR HOPS BEER',
  }

  const mpRes = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preference),
  })

  if (!mpRes.ok) {
    const err = await mpRes.text()
    console.error('[MP] preference error', err)
    return c.json({ error: 'Error al crear preferencia de pago' }, 502)
  }

  const data = await mpRes.json<{ id: string; init_point: string; sandbox_init_point: string }>()
  return c.json({ data: { preference_id: data.id, init_point: data.init_point } })
})

// POST /api/payments/webhook — notificaciones de MercadoPago
app.post('/webhook', async c => {
  const body = await c.req.json<{ type: string; data: { id: string } }>()

  // Solo procesar notificaciones de pagos
  if (body.type !== 'payment') return c.json({ ok: true })

  const paymentId = body.data?.id
  if (!paymentId) return c.json({ ok: true })

  // Consultar detalles del pago a la API de MP
  const mpRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) {
    console.error('[MP] webhook payment fetch error', await mpRes.text())
    return c.json({ ok: true }) // Always 200 to avoid MP retries
  }

  const payment = await mpRes.json<{
    status: string; external_reference: string; id: number
  }>()

  const orderId = payment.external_reference
  if (!orderId) return c.json({ ok: true })

  if (payment.status === 'approved') {
    await c.env.DB.prepare(`
      UPDATE orders SET payment_status = 'paid', payment_id = ?, updated_at = datetime('now')
      WHERE id = ? AND payment_status = 'unpaid'
    `).bind(String(payment.id), orderId).run()
  } else if (payment.status === 'refunded' || payment.status === 'cancelled') {
    await c.env.DB.prepare(`
      UPDATE orders SET payment_status = 'refunded', updated_at = datetime('now') WHERE id = ?
    `).bind(orderId).run()
  }

  return c.json({ ok: true })
})

export default app
