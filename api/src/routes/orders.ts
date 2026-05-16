import { Hono } from 'hono'
import { type Env } from '@/types'
import { optionalAuth } from '@/middleware/auth'
import { sendEmail, newOrderEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env; Variables: { userId?: string } }>()

async function nextOrderNumber(db: D1Database): Promise<string> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM orders').first<{ count: number }>()
  return `MH-${String((result?.count ?? 0) + 1).padStart(4, '0')}`
}

// POST /api/orders
app.post('/', optionalAuth, async c => {
  const body = await c.req.json<{
    items: { product_id: string; quantity: number }[]
    delivery_type: 'delivery' | 'pickup'
    delivery_address?: string
    notes?: string
    guest_name?: string
    guest_email?: string
    guest_phone?: string
  }>()

  const userId = c.get('userId')

  if (!body.items?.length) return c.json({ error: 'El pedido debe tener al menos un producto' }, 400)
  if (body.delivery_type === 'delivery' && !body.delivery_address) {
    return c.json({ error: 'Dirección requerida para delivery' }, 400)
  }
  if (!userId && (!body.guest_name || !body.guest_email)) {
    return c.json({ error: 'Nombre y email son requeridos' }, 400)
  }

  // Validar productos y calcular totales
  const productIds = body.items.map(i => i.product_id)
  const { results: products } = await c.env.DB.prepare(
    `SELECT id, name, price, stock, active FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`,
  )
    .bind(...productIds)
    .all<{ id: string; name: string; price: number; stock: number; active: number }>()

  const productMap = new Map(products.map(p => [p.id, p]))

  for (const item of body.items) {
    const p = productMap.get(item.product_id)
    if (!p || !p.active) return c.json({ error: `Producto no disponible: ${item.product_id}` }, 400)
    if (p.stock < item.quantity) return c.json({ error: `Stock insuficiente: ${p.name}` }, 400)
  }

  const orderId = crypto.randomUUID()
  const orderNumber = await nextOrderNumber(c.env.DB)
  const subtotal = body.items.reduce((sum, item) => {
    const p = productMap.get(item.product_id)!
    return sum + p.price * item.quantity
  }, 0)

  // Transacción: crear order + items + descontar stock
  const stmts = [
    c.env.DB.prepare(
      `INSERT INTO orders (id, order_number, user_id, guest_name, guest_email, guest_phone,
        delivery_type, delivery_address, notes, subtotal, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      orderId, orderNumber, userId ?? null,
      body.guest_name ?? null, body.guest_email ?? null, body.guest_phone ?? null,
      body.delivery_type, body.delivery_address ?? null, body.notes ?? null,
      subtotal, subtotal,
    ),
    c.env.DB.prepare(
      `INSERT INTO order_status_history (id, order_id, status)
       VALUES (?, ?, 'pending_confirmation')`,
    ).bind(crypto.randomUUID(), orderId),
    ...body.items.map(item => {
      const p = productMap.get(item.product_id)!
      return c.env.DB.prepare(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(
        crypto.randomUUID(), orderId, item.product_id,
        item.quantity, p.price, p.price * item.quantity,
      )
    }),
    ...body.items.map(item =>
      c.env.DB.prepare(`UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(item.quantity, item.product_id),
    ),
  ]

  await c.env.DB.batch(stmts)

  // Notificación al admin (no bloquea la respuesta)
  c.executionCtx.waitUntil(
    sendEmail(c.env, {
      to: c.env.ADMIN_EMAIL,
      subject: `Nuevo pedido ${orderNumber}`,
      html: newOrderEmailHtml({
        order_number: orderNumber,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone,
        delivery_type: body.delivery_type,
        delivery_address: body.delivery_address,
        notes: body.notes,
        total: subtotal,
        items: body.items.map(item => ({
          name: productMap.get(item.product_id)!.name,
          quantity: item.quantity,
          unit_price: productMap.get(item.product_id)!.price,
        })),
      }),
    }),
  )

  return c.json({ data: { id: orderId, order_number: orderNumber, total: subtotal } }, 201)
})

export default app
