import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// GET /api/admin/stock
app.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, category, stock FROM products WHERE active = 1 ORDER BY category, name`,
  ).all()
  return c.json({ data: results })
})

// PATCH /api/admin/products/:id/stock
app.patch('/:id', async c => {
  const body = await c.req.json<{ stock: number }>()
  if (typeof body.stock !== 'number' || body.stock < 0) {
    return c.json({ error: 'Stock inválido' }, 400)
  }
  await c.env.DB.prepare(
    `UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?`,
  )
    .bind(body.stock, c.req.param('id'))
    .run()
  return c.json({ message: 'Stock actualizado' })
})

export default app
