import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import { type Env } from '@/types'

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = createMiddleware(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Acceso denegado' }, 403)
    }

    const token = authHeader.slice(7)
    try {
      const secret = new TextEncoder().encode(c.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      if (payload.role !== 'admin') {
        return c.json({ error: 'Acceso denegado' }, 403)
      }
      c.set('adminEmail', payload.email as string)
      return next()
    } catch {
      return c.json({ error: 'Token inválido o expirado' }, 401)
    }
  },
)
