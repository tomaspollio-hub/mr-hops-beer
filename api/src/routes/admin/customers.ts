import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// GET /api/admin/customers
app.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, email, name, phone, created_at FROM users ORDER BY created_at DESC`,
  ).all()
  return c.json({ data: results })
})

// GET /api/admin/customers/:id
app.get('/:id', async c => {
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, created_at FROM users WHERE id = ?',
  )
    .bind(c.req.param('id'))
    .first()
  if (!user) return c.json({ error: 'Cliente no encontrado' }, 404)

  const [orders, reservations] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, order_number, status, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    ).bind(c.req.param('id')).all(),
    c.env.DB.prepare(
      `SELECT id, reservation_number, status, total, start_date, end_date FROM barrel_reservations WHERE user_id = ? ORDER BY created_at DESC`,
    ).bind(c.req.param('id')).all(),
  ])

  return c.json({
    data: { ...user, orders: orders.results, reservations: reservations.results },
  })
})

export default app
