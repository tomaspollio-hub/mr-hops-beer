import { Hono } from 'hono'
import { type Env } from '@/types'
import { authMiddleware } from '@/middleware/auth'

const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

app.use('*', authMiddleware)

// GET /api/my/orders
app.get('/orders', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
  )
    .bind(c.get('userId'))
    .all()
  return c.json({ data: results })
})

// GET /api/my/reservations
app.get('/reservations', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM barrel_reservations WHERE user_id = ? ORDER BY created_at DESC`,
  )
    .bind(c.get('userId'))
    .all()
  return c.json({ data: results })
})

// GET /api/my/profile
app.get('/profile', async c => {
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, created_at FROM users WHERE id = ?',
  )
    .bind(c.get('userId'))
    .first()
  if (!user) return c.json({ error: 'Usuario no encontrado' }, 404)
  return c.json({ data: user })
})

// PUT /api/my/profile
app.put('/profile', async c => {
  const body = await c.req.json<{ name?: string; phone?: string }>()
  await c.env.DB.prepare(
    `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?`,
  )
    .bind(body.name ?? null, body.phone ?? null, c.get('userId'))
    .run()
  return c.json({ message: 'Perfil actualizado' })
})

export default app
