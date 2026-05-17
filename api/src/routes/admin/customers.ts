import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// GET /api/admin/customers
app.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, email, name, phone, role, blocked, created_at FROM users
     WHERE role = 'customer' ORDER BY created_at DESC`,
  ).all()
  return c.json({ data: results })
})

// GET /api/admin/customers/:id
app.get('/:id', async c => {
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, blocked, created_at FROM users WHERE id = ?',
  ).bind(c.req.param('id')).first()
  if (!user) return c.json({ error: 'Cliente no encontrado' }, 404)

  const [orders, reservations] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, order_number, status, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    ).bind(c.req.param('id')).all(),
    c.env.DB.prepare(
      `SELECT id, reservation_number, status, total, start_date, end_date FROM barrel_reservations WHERE user_id = ? ORDER BY created_at DESC`,
    ).bind(c.req.param('id')).all(),
  ])

  return c.json({ data: { ...user, orders: orders.results, reservations: reservations.results } })
})

// PATCH /api/admin/customers/:id/block
app.patch('/:id/block', async c => {
  const user = await c.env.DB.prepare('SELECT blocked FROM users WHERE id = ?')
    .bind(c.req.param('id')).first<{ blocked: number }>()
  if (!user) return c.json({ error: 'Cliente no encontrado' }, 404)

  const newBlocked = user.blocked ? 0 : 1
  await c.env.DB.prepare('UPDATE users SET blocked = ? WHERE id = ?')
    .bind(newBlocked, c.req.param('id')).run()

  return c.json({ message: newBlocked ? 'Usuario bloqueado' : 'Usuario desbloqueado', blocked: !!newBlocked })
})

// PATCH /api/admin/customers/:id/reset-password
app.patch('/:id/reset-password', async c => {
  const { password } = await c.req.json<{ password: string }>()
  if (!password || password.length < 6) return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)

  const hash = await hashPassword(password)
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(hash, c.req.param('id')).run()

  return c.json({ message: 'Contraseña actualizada' })
})

// DELETE /api/admin/customers/:id
app.delete('/:id', async c => {
  await c.env.DB.prepare('DELETE FROM users WHERE id = ? AND role = ?')
    .bind(c.req.param('id'), 'customer').run()
  return c.json({ message: 'Cliente eliminado' })
})

export default app
