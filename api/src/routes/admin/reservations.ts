import { Hono } from 'hono'
import { type Env, type ReservationStatus, RESERVATION_TRANSITIONS } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'
import { sendEmail, reservationStatusEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env }>()

app.use('*', adminAuthMiddleware)

// GET /api/admin/reservations?status=confirmed
app.get('/', async c => {
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = `
    SELECT br.*, bv.liters, bv.price_per_day, p.name as barrel_name
    FROM barrel_reservations br
    JOIN barrel_variants bv ON br.barrel_variant_id = bv.id
    JOIN products p ON bv.product_id = p.id
  `
  const params: unknown[] = []
  if (status) { query += ' WHERE br.status = ?'; params.push(status) }
  query += ' ORDER BY br.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ data: results })
})

// GET /api/admin/reservations/calendar — datos para vista calendario
app.get('/calendar', async c => {
  const { results } = await c.env.DB.prepare(`
    SELECT br.id, br.reservation_number, br.start_date, br.end_date,
           br.status, br.guest_name, bv.liters
    FROM barrel_reservations br
    JOIN barrel_variants bv ON br.barrel_variant_id = bv.id
    WHERE br.status NOT IN ('cancelled', 'barrel_returned')
    ORDER BY br.start_date ASC
  `).all()
  return c.json({ data: results })
})

// PATCH /api/admin/reservations/:id/status
app.patch('/:id/status', async c => {
  const body = await c.req.json<{ status: ReservationStatus; note?: string }>()
  const res = await c.env.DB.prepare('SELECT status FROM barrel_reservations WHERE id = ?')
    .bind(c.req.param('id'))
    .first<{ status: ReservationStatus }>()

  if (!res) return c.json({ error: 'Reserva no encontrada' }, 404)

  const allowed = RESERVATION_TRANSITIONS[res.status]
  if (!allowed.includes(body.status)) {
    return c.json({ error: `Transición inválida: ${res.status} → ${body.status}` }, 400)
  }

  const fullRes = await c.env.DB.prepare(`
    SELECT br.*, bv.liters, bv.price_per_day
    FROM barrel_reservations br
    JOIN barrel_variants bv ON br.barrel_variant_id = bv.id
    WHERE br.id = ?
  `).bind(c.req.param('id')).first<{
    reservation_number: string; guest_name: string; guest_email: string;
    liters: number; start_date: string; end_date: string; total: number
  }>()

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE barrel_reservations SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    ).bind(body.status, c.req.param('id')),
    c.env.DB.prepare(
      `INSERT INTO reservation_status_history (id, reservation_id, status, note) VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), c.req.param('id'), body.status, body.note ?? null),
  ])

  if (fullRes?.guest_email) {
    const html = reservationStatusEmailHtml({ ...fullRes, status: body.status })
    if (html) {
      await sendEmail(c.env, {
        to: fullRes.guest_email,
        subject: `Mr. Hops — Reserva ${fullRes.reservation_number}`,
        html,
      })
    }
  }

  return c.json({ message: 'Estado actualizado' })
})

export default app
