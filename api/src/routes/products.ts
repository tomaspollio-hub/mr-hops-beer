import { Hono } from 'hono'
import { type Env } from '@/types'

const app = new Hono<{ Bindings: Env }>()

// GET /api/products?category=lata&active=1
app.get('/', async c => {
  const category = c.req.query('category')
  const barrelsOnly = c.req.path.includes('/barrels')

  let query = 'SELECT * FROM products WHERE active = 1'
  const params: unknown[] = []

  if (barrelsOnly) {
    query += ' AND category = ?'
    params.push('barril')
  } else if (category) {
    query += ' AND category = ?'
    params.push(category)
  }

  query += ' ORDER BY name ASC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all()

  // Si es barriles, adjuntar variantes
  if (barrelsOnly) {
    const productIds = results.map((p: Record<string, unknown>) => p.id as string)
    const variants =
      productIds.length > 0
        ? await c.env.DB.prepare(
            `SELECT * FROM barrel_variants WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
          )
            .bind(...productIds)
            .all()
        : { results: [] }

    const variantsByProduct: Record<string, unknown[]> = {}
    for (const v of variants.results as Record<string, unknown>[]) {
      const pid = v.product_id as string
      if (!variantsByProduct[pid]) variantsByProduct[pid] = []
      variantsByProduct[pid].push(v)
    }

    return c.json({
      data: results.map((p: Record<string, unknown>) => ({
        ...p,
        active: p.active === 1,
        variants: variantsByProduct[p.id as string] ?? [],
      })),
    })
  }

  return c.json({
    data: results.map((p: Record<string, unknown>) => ({ ...p, active: p.active === 1 })),
  })
})

// GET /api/products/:id
app.get('/:id', async c => {
  const product = await c.env.DB.prepare(
    'SELECT * FROM products WHERE id = ? AND active = 1',
  )
    .bind(c.req.param('id'))
    .first<Record<string, unknown>>()

  if (!product) return c.json({ error: 'Producto no encontrado' }, 404)

  let variants: unknown[] = []
  if (product.category === 'barril') {
    const res = await c.env.DB.prepare(
      'SELECT * FROM barrel_variants WHERE product_id = ?',
    )
      .bind(product.id)
      .all()
    variants = res.results
  }

  return c.json({ data: { ...product, active: product.active === 1, variants } })
})

// GET /api/barrels/:id/availability?start=2024-12-20&end=2024-12-23
app.get('/:id/availability', async c => {
  const variantId = c.req.param('id')
  const start = c.req.query('start')
  const end = c.req.query('end')

  if (!start || !end) return c.json({ error: 'Parámetros start y end requeridos' }, 400)

  const conflicts = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM barrel_reservations
    WHERE barrel_variant_id = ?
      AND status NOT IN ('cancelled', 'barrel_returned')
      AND start_date <= ? AND end_date >= ?
  `)
    .bind(variantId, end, start)
    .first<{ count: number }>()

  return c.json({ data: { available: (conflicts?.count ?? 0) === 0 } })
})

export default app
