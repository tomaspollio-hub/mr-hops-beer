import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// GET /api/admin/products
app.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM products ORDER BY category, name',
  ).all()
  return c.json({
    data: results.map((p: Record<string, unknown>) => ({ ...p, active: p.active === 1 })),
  })
})

// POST /api/admin/products
app.post('/', async c => {
  const body = await c.req.json<{
    name: string; description?: string; category: string
    price: number; image_url?: string; stock?: number
  }>()

  if (!body.name || !body.category || body.price === undefined) {
    return c.json({ error: 'Nombre, categoría y precio son requeridos' }, 400)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(`
    INSERT INTO products (id, name, description, category, price, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.name, body.description ?? null, body.category, body.price, body.image_url ?? null, body.stock ?? 0).run()

  return c.json({ data: { id } }, 201)
})

// PUT /api/admin/products/:id
app.put('/:id', async c => {
  const body = await c.req.json<{
    name?: string; description?: string; category?: string
    price?: number; image_url?: string; active?: boolean
  }>()

  await c.env.DB.prepare(`
    UPDATE products
    SET name        = COALESCE(?, name),
        description = COALESCE(?, description),
        category    = COALESCE(?, category),
        price       = COALESCE(?, price),
        image_url   = COALESCE(?, image_url),
        active      = COALESCE(?, active),
        updated_at  = datetime('now')
    WHERE id = ?
  `).bind(
    body.name ?? null, body.description ?? null, body.category ?? null,
    body.price ?? null, body.image_url ?? null,
    body.active !== undefined ? (body.active ? 1 : 0) : null,
    c.req.param('id'),
  ).run()

  return c.json({ message: 'Producto actualizado' })
})

// DELETE /api/admin/products/:id — soft delete
app.delete('/:id', async c => {
  await c.env.DB.prepare(`UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?`)
    .bind(c.req.param('id'))
    .run()
  return c.json({ message: 'Producto desactivado' })
})

export default app
