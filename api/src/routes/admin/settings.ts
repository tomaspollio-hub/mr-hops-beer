import { Hono } from 'hono'
import { type Env } from '@/types'
import { adminAuthMiddleware } from '@/middleware/adminAuth'

// Keys cuyo valor no se devuelve al frontend — sólo se indica si están seteadas
const SENSITIVE = new Set([
  'afip_cert',
  'afip_private_key',
  'mp_access_token',
  'mp_client_secret',
  'mp_webhook_secret',
  'galicia_api_key',
  'galicia_secret_key',
])

const SENTINEL = '***SET***'   // El frontend envía esto si el campo no cambió

const app = new Hono<{ Bindings: Env }>()
app.use('*', adminAuthMiddleware)

// GET /api/admin/settings
app.get('/', async c => {
  const rows = await c.env.DB.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>()
  const data: Record<string, string> = {}
  for (const { key, value } of rows.results) {
    data[key] = SENSITIVE.has(key) && value ? SENTINEL : (value ?? '')
  }
  return c.json({ data })
})

// PUT /api/admin/settings  — actualización batch
app.put('/', async c => {
  const body = await c.req.json<Record<string, string>>()
  const stmts = []
  for (const [key, value] of Object.entries(body)) {
    if (value === SENTINEL) continue  // sin cambios en campo sensible
    stmts.push(
      c.env.DB.prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      ).bind(key, value ?? ''),
    )
  }
  if (stmts.length) await c.env.DB.batch(stmts)
  return c.json({ data: { updated: stmts.length } })
})

export default app
