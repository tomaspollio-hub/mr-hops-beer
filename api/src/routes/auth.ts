import { Hono } from 'hono'
import { SignJWT } from 'jose'
import { type Env } from '@/types'
import { sendEmail, welcomeEmailHtml, passwordResetEmailHtml } from '@/services/email'

const app = new Hono<{ Bindings: Env }>()

// ─── Password hashing (PBKDF2) ────────────────────────────────────────────────

async function hashLegacySHA256(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMaterial, 256,
  )
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `pbkdf2:100000:${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2:')) {
    // legacy SHA-256 — single-round, no salt
    const legacy = await hashLegacySHA256(password)
    return legacy === stored
  }
  const parts = stored.split(':')
  if (parts.length !== 4) return false
  const [, iterStr, saltHex, expectedHex] = parts
  const iterations = parseInt(iterStr, 10)
  const salt = new Uint8Array((saltHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial, 256,
  )
  const actualHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return actualHex === expectedHex
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

async function signToken(env: Env, userId: string, role = 'customer', email = ''): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  return new SignJWT({ sub: userId, role, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret)
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const result = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM login_attempts WHERE ip = ? AND created_at > ?`,
  ).bind(ip, windowStart).first<{ count: number }>()
  return (result?.count ?? 0) >= 5
}

async function recordAttempt(env: Env, ip: string, email: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO login_attempts (id, ip, email) VALUES (?, ?, ?)`,
  ).bind(crypto.randomUUID(), ip, email).run()
}

function getClientIP(c: { req: { header: (k: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

app.post('/register', async c => {
  const body = await c.req.json<{ name: string; email: string; password: string; phone?: string }>()

  if (!body.name || !body.email || !body.password) {
    return c.json({ error: 'Nombre, email y contraseña son requeridos' }, 400)
  }
  if (body.password.length < 6) {
    return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(body.email.toLowerCase().trim()).first()
  if (existing) return c.json({ error: 'El email ya está registrado' }, 409)

  const id = crypto.randomUUID()
  const hash = await hashPassword(body.password)

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
  ).bind(id, body.email.toLowerCase().trim(), body.name.trim(), body.phone ?? null, hash).run()

  const token = await signToken(c.env, id, 'customer', body.email)
  sendEmail(c.env, {
    to: body.email,
    subject: '¡Bienvenido a Mr. Hops Beer!',
    html: welcomeEmailHtml(body.name),
  }).catch(() => {})
  return c.json({ data: { id, email: body.email, name: body.name, phone: body.phone }, token }, 201)
})

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

app.post('/login', async c => {
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ error: 'Email y contraseña requeridos' }, 400)
  }

  const ip = getClientIP(c)
  const limited = await checkRateLimit(c.env, ip)
  if (limited) {
    return c.json({ error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' }, 429)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, phone, role, blocked, password_hash FROM users WHERE email = ?',
  ).bind(body.email.toLowerCase().trim())
    .first<{ id: string; email: string; name: string; phone: string; role: string; blocked: number; password_hash: string }>()

  if (!user) {
    await recordAttempt(c.env, ip, body.email)
    return c.json({ error: 'Credenciales incorrectas' }, 401)
  }
  if (user.blocked) return c.json({ error: 'Tu cuenta está suspendida. Contactá con nosotros.' }, 403)

  const valid = await verifyPassword(body.password, user.password_hash)
  if (!valid) {
    await recordAttempt(c.env, ip, body.email)
    return c.json({ error: 'Credenciales incorrectas' }, 401)
  }

  // Auto-upgrade legacy SHA-256 to PBKDF2
  if (!user.password_hash.startsWith('pbkdf2:')) {
    const newHash = await hashPassword(body.password)
    await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(newHash, user.id).run()
  }

  const token = await signToken(c.env, user.id, user.role, user.email)
  const { password_hash: _, ...safeUser } = user
  return c.json({ data: safeUser, token })
})

// ─── POST /api/auth/google ────────────────────────────────────────────────────

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
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    ).bind(id, payload.email, payload.name, '').run()
    user = { id, email: payload.email, name: payload.name, role: 'customer', blocked: 0 }
  }

  const token = await signToken(c.env, user.id, user.role, user.email)
  return c.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role }, token })
})

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

app.post('/forgot-password', async c => {
  const body = await c.req.json<{ email: string }>()
  if (!body.email) return c.json({ message: 'Si el email existe, recibirás un enlace de recuperación.' })

  const user = await c.env.DB.prepare('SELECT id, name FROM users WHERE email = ?')
    .bind(body.email.toLowerCase().trim())
    .first<{ id: string; name: string }>()

  // Always return success to avoid email enumeration
  if (!user) return c.json({ message: 'Si el email existe, recibirás un enlace de recuperación.' })

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

  await c.env.DB.prepare(
    `INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`,
  ).bind(token, user.id, expiresAt).run()

  const resetLink = `${c.env.FRONTEND_URL}/restablecer-contrasena?token=${token}`
  sendEmail(c.env, {
    to: body.email,
    subject: 'Recuperar contraseña — Mr. Hops Beer',
    html: passwordResetEmailHtml(user.name, resetLink),
  }).catch(() => {})

  return c.json({ message: 'Si el email existe, recibirás un enlace de recuperación.' })
})

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

app.post('/reset-password', async c => {
  const body = await c.req.json<{ token: string; password: string }>()

  if (!body.token || !body.password) {
    return c.json({ error: 'Token y contraseña requeridos' }, 400)
  }
  if (body.password.length < 6) {
    return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)
  }

  const record = await c.env.DB.prepare(
    `SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?`,
  ).bind(body.token).first<{ user_id: string; expires_at: string; used: number }>()

  if (!record) return c.json({ error: 'Token inválido o expirado' }, 400)
  if (record.used) return c.json({ error: 'Este enlace ya fue utilizado' }, 400)
  if (new Date(record.expires_at) < new Date()) return c.json({ error: 'El enlace expiró' }, 400)

  const newHash = await hashPassword(body.password)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, record.user_id),
    c.env.DB.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').bind(body.token),
  ])

  return c.json({ message: 'Contraseña actualizada correctamente' })
})

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

app.post('/logout', c => c.json({ message: 'Sesión cerrada' }))

export default app
