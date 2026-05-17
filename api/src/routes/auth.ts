import { Hono } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import { type Env } from '@/types'
import { sendEmail, welcomeEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env }>()

function uuid(): string {
  return crypto.randomUUID()
}

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function signToken(env: Env, userId: string, role = 'customer', email = ''): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  return new SignJWT({ sub: userId, role, email })
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

  const token = await signToken(c.env, id, 'customer', body.email)
  sendEmail(c.env, {
    to: body.email,
    subject: '¡Bienvenido a Mr. Hops Beer!',
    html: welcomeEmailHtml(body.name),
  }).catch(() => {})
  return c.json({ data: { id, email: body.email, name: body.name, phone: body.phone }, token }, 201)
})

// POST /api/auth/login
app.post('/login', async c => {
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ error: 'Email y contraseña requeridos' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, blocked, password_hash FROM users WHERE email = ?',
  )
    .bind(body.email)
    .first<{ id: string; email: string; name: string; phone: string; role: string; blocked: number; password_hash: string }>()

  if (!user) return c.json({ error: 'Credenciales incorrectas' }, 401)
  if (user.blocked) return c.json({ error: 'Tu cuenta está suspendida. Contactá con nosotros.' }, 403)

  const hash = await hashPassword(body.password)
  if (hash !== user.password_hash) return c.json({ error: 'Credenciales incorrectas' }, 401)

  const token = await signToken(c.env, user.id, user.role, user.email)
  const { password_hash: _, ...safeUser } = user
  return c.json({ data: safeUser, token })
})

// POST /api/auth/google
app.post('/google', async c => {
  const { credential } = await c.req.json<{ credential: string }>()
  if (!credential) return c.json({ error: 'Token requerido' }, 400)

  const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
  if (!verifyRes.ok) return c.json({ error: 'Token de Google inválido' }, 401)

  const payload = await verifyRes.json<{ sub: string; email: string; name: string; aud: string; email_verified: string }>()

  if (payload.aud !== c.env.GOOGLE_CLIENT_ID) return c.json({ error: 'Token inválido' }, 401)
  if (payload.email_verified !== 'true') return c.json({ error: 'Email no verificado' }, 401)

  let user = await c.env.DB.prepare(
    'SELECT id, email, name, role, blocked FROM users WHERE email = ?',
  ).bind(payload.email).first<{ id: string; email: string; name: string; role: string; blocked: number }>()

  if (user?.blocked) return c.json({ error: 'Tu cuenta está suspendida. Contactá con nosotros.' }, 403)

  if (!user) {
    const id = uuid()
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    ).bind(id, payload.email, payload.name, '').run()
    user = { id, email: payload.email, name: payload.name, role: 'customer', blocked: 0 }
  }

  const token = await signToken(c.env, user.id, user.role, user.email)
  return c.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role }, token })
})

// POST /api/auth/logout (el cliente descarta el token)
app.post('/logout', c => c.json({ message: 'Sesión cerrada' }))

export default app
