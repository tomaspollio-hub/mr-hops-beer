import { Hono } from 'hono'
import { type Env } from '@/types'
import { optionalAuth } from '@/middleware/auth'
import { sendEmail, newReservationEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env; Variables: { userId?: string } }>()

async function nextReservationNumber(db: D1Database): Promise<string> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM barrel_reservations')
    .first<{ count: number }>()
  return `MH-R-${String((result?.count ?? 0) + 1).padStart(4, '0')}`
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000))
}

// POST /api/reservations
app.post('/', optionalAuth, async c => {
  const body = await c.req.json<{
    barrel_variant_id: string
    start_date: string
    end_date: string
    delivery_type: 'delivery' | 'pickup'
    delivery_address?: string
    notes?: string
    accessories?: { product_id: string; quantity: number }[]
    guest_name?: string
    guest_email?: string
    guest_phone?: string
  }>()

  const userId = c.get('userId')

  if (!body.barrel_variant_id || !body.start_date || !body.end_date) {
    return c.json({ error: 'Barril y fechas requeridos' }, 400)
  }
  if (body.delivery_type === 'delivery' && !body.delivery_address) {
    return c.json({ error: 'Dirección requerida para delivery' }, 400)
  }
  if (!userId && (!body.guest_name || !body.guest_email)) {
    return c.json({ error: 'Nombre y email son requeridos' }, 400)
  }

  const variant = await c.env.DB.prepare(
    'SELECT * FROM barrel_variants WHERE id = ?',
  )
    .bind(body.barrel_variant_id)
    .first<{ id: string; product_id: string; liters: number; price_per_day: number; deposit: number; stock: number }>()

  if (!variant) return c.json({ error: 'Variante de barril no encontrada' }, 404)

  // Verificar disponibilidad (anti race-condition)
  const conflicts = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM barrel_reservations
    WHERE barrel_variant_id = ?
      AND status NOT IN ('cancelled', 'barrel_returned')
      AND start_date <= ? AND end_date >= ?
  `)
    .bind(body.barrel_variant_id, body.end_date, body.start_date)
    .first<{ count: number }>()

  if ((conflicts?.count ?? 0) > 0) {
    return c.json({ error: 'El barril no está disponible en esas fechas' }, 409)
  }

  const days = daysBetween(body.start_date, body.end_date)
  const barrelTotal = days * variant.price_per_day
  let accessoryTotal = 0

  // Validar accesorios
  const accessories = body.accessories ?? []
  type AccessoryRow = { product_id: string; name: string; price: number; quantity: number }
  const accessoryRows: AccessoryRow[] = []

  if (accessories.length > 0) {
    const ids = accessories.map(a => a.product_id)
    const { results: accProducts } = await c.env.DB.prepare(
      `SELECT id, name, price FROM products WHERE id IN (${ids.map(() => '?').join(',')}) AND active = 1`,
    )
      .bind(...ids)
      .all<{ id: string; name: string; price: number }>()

    const accMap = new Map(accProducts.map(p => [p.id, p]))
    for (const acc of accessories) {
      const p = accMap.get(acc.product_id)
      if (!p) return c.json({ error: `Accesorio no encontrado: ${acc.product_id}` }, 400)
      accessoryTotal += p.price * acc.quantity
      accessoryRows.push({ product_id: acc.product_id, name: p.name, price: p.price, quantity: acc.quantity })
    }
  }

  const total = barrelTotal + accessoryTotal
  const resId = crypto.randomUUID()
  const resNumber = await nextReservationNumber(c.env.DB)

  const stmts = [
    c.env.DB.prepare(`
      INSERT INTO barrel_reservations
        (id, reservation_number, user_id, guest_name, guest_email, guest_phone,
         barrel_variant_id, start_date, end_date, delivery_type, delivery_address,
         notes, total, deposit_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      resId, resNumber, userId ?? null,
      body.guest_name ?? null, body.guest_email ?? null, body.guest_phone ?? null,
      body.barrel_variant_id, body.start_date, body.end_date,
      body.delivery_type, body.delivery_address ?? null, body.notes ?? null,
      total, variant.deposit,
    ),
    c.env.DB.prepare(
      `INSERT INTO reservation_status_history (id, reservation_id, status)
       VALUES (?, ?, 'pending_confirmation')`,
    ).bind(crypto.randomUUID(), resId),
    ...accessoryRows.map(acc =>
      c.env.DB.prepare(
        `INSERT INTO reservation_accessories (id, reservation_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), resId, acc.product_id, acc.quantity, acc.price),
    ),
  ]

  await c.env.DB.batch(stmts)

  c.executionCtx.waitUntil(
    sendEmail(c.env, {
      to: c.env.ADMIN_EMAIL,
      subject: `Nueva reserva de barril ${resNumber}`,
      html: newReservationEmailHtml({
        reservation_number: resNumber,
        guest_name: body.guest_name,
        guest_phone: body.guest_phone,
        liters: variant.liters,
        start_date: body.start_date,
        end_date: body.end_date,
        total,
        deposit_amount: variant.deposit,
      }),
    }),
  )

  return c.json({ data: { id: resId, reservation_number: resNumber, total, deposit_amount: variant.deposit } }, 201)
})

export default app
