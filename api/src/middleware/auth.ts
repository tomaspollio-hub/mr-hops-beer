import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import { type Env } from '@/types'

export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = createMiddleware(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'No autorizado' }, 401)
    }

    const token = authHeader.slice(7)
    try {
      const secret = new TextEncoder().encode(c.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      c.set('userId', payload.sub as string)
      await next()
    } catch {
      return c.json({ error: 'Token inválido o expirado' }, 401)
    }
  },
)

// Middleware opcional: enriquece contexto si hay token pero no rechaza si no hay
export const optionalAuth: MiddlewareHandler<{ Bindings: Env }> = createMiddleware(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const secret = new TextEncoder().encode(c.env.JWT_SECRET)
        const { payload } = await jwtVerify(authHeader.slice(7), secret)
        c.set('userId', payload.sub as string)
      } catch {
        // Token inválido, continúa sin usuario
      }
    }
    await next()
  },
)
