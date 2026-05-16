import { Hono } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import { type Env } from '@/types'

const app = new Hono<{ Bindings: Env }>()

function uuid(): string {
  return crypto.randomUUID()
}

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function signToken(env: Env, userId: string): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret)
}

// POST /api/auth/register
app.post('/register', async c => {
  const body = await c.req.json<{ name: string; email: string; password: string; phone?: string }>()

  if (!body.name || !body.email || !body.password) {
    return c.json({ error: 'Nombre, email y contraseña son requeridos' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email)
    .first()

  if (existing) return c.json({ error: 'El email ya está registrado' }, 409)

  const id = uuid()
  const hash = await hashPassword(body.password)

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, body.email, body.name, body.phone ?? null, hash)
    .run()

  const token = await signToken(c.env, id)
  return c.json({ data: { id, email: body.email, name: body.name, phone: body.phone }, token }, 201)
})

// POST /api/auth/login
app.post('/login', async c => {
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ error: 'Email y contraseña requeridos' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, password_hash FROM users WHERE email = ?',
  )
    .bind(body.email)
    .first<{ id: string; email: string; name: string; phone: string; password_hash: string }>()

  if (!user) return c.json({ error: 'Credenciales incorrectas' }, 401)

  const hash = await hashPassword(body.password)
  if (hash !== user.password_hash) return c.json({ error: 'Credenciales incorrectas' }, 401)

  const token = await signToken(c.env, user.id)
  const { password_hash: _, ...safeUser } = user
  return c.json({ data: safeUser, token })
})

// POST /api/auth/logout (el cliente descarta el token)
app.post('/logout', c => c.json({ message: 'Sesión cerrada' }))

export default app
