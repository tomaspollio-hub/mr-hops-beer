import { Hono } from 'hono'
import { type Env, type OrderStatus, ORDER_TRANSITIONS } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'
import { sendEmail, orderStatusEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// GET /api/admin/orders?status=pending_confirmation&page=1
app.get('/', async c => {
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = 'SELECT * FROM orders'
  const params: unknown[] = []

  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const [rows, total] = await Promise.all([
    c.env.DB.prepare(query).bind(...params).all(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM orders${status ? ' WHERE status = ?' : ''}`)
      .bind(...(status ? [status] : []))
      .first<{ count: number }>(),
  ])

  return c.json({ data: rows.results, total: total?.count ?? 0, page, limit })
})

// GET /api/admin/orders/:id
app.get('/:id', async c => {
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?')
    .bind(c.req.param('id'))
    .first()
  if (!order) return c.json({ error: 'Pedido no encontrado' }, 404)

  const [items, history] = await Promise.all([
    c.env.DB.prepare(`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).bind(c.req.param('id')).all(),
    c.env.DB.prepare(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
    ).bind(c.req.param('id')).all(),
  ])

  return c.json({ data: { ...order, items: items.results, history: history.results } })
})

// PATCH /api/admin/orders/:id/status
app.patch('/:id/status', async c => {
  const body = await c.req.json<{ status: OrderStatus; note?: string }>()
  const order = await c.env.DB.prepare('SELECT status FROM orders WHERE id = ?')
    .bind(c.req.param('id'))
    .first<{ status: OrderStatus }>()

  if (!order) return c.json({ error: 'Pedido no encontrado' }, 404)

  const allowed = ORDER_TRANSITIONS[order.status]
  if (!allowed.includes(body.status)) {
    return c.json({ error: `Transición inválida: ${order.status} → ${body.status}` }, 400)
  }

  const fullOrder = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE id = ?'
  ).bind(c.req.param('id')).first<{
    order_number: string; user_id: string | null; guest_name: string; guest_email: string;
    total: number; delivery_type: string; delivery_address: string
  }>()

  await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(body.status, c.req.param('id')),
    c.env.DB.prepare(
      `INSERT INTO order_status_history (id, order_id, status, note) VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), c.req.param('id'), body.status, body.note ?? null),
  ])

  if (fullOrder) {
    // Resolve recipient email: guest_email or registered user's email
    let recipientEmail: string | undefined = fullOrder.guest_email || undefined
    let recipientName: string | undefined = fullOrder.guest_name || undefined
    if (!recipientEmail && fullOrder.user_id) {
      const user = await c.env.DB.prepare('SELECT email, name FROM users WHERE id = ?')
        .bind(fullOrder.user_id).first<{ email: string; name: string }>()
      recipientEmail = user?.email
      recipientName = user?.name ?? recipientName
    }
    if (recipientEmail) {
      const html = orderStatusEmailHtml({ ...fullOrder, guest_name: recipientName, status: body.status })
      if (html) {
        await sendEmail(c.env, {
          to: recipientEmail,
          subject: `Mr. Hops — Pedido ${fullOrder.order_number}`,
          html,
        })
      }
    }
  }

  return c.json({ message: 'Estado actualizado' })
})

export default app
