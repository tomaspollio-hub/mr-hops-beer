import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { type Env } from '@/types'

// En producción, Cloudflare Access inyecta CF-Access-Authenticated-User-Email
// antes de que el request llegue al Worker.
// En desarrollo local, se bypasea completamente (ENVIRONMENT=development en .dev.vars).
export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = createMiddleware(
  async (c, next) => {
    if (c.env.ENVIRONMENT === 'development') {
      c.set('adminEmail', c.env.ADMIN_EMAIL)
      return next()
    }

    const cfEmail = c.req.header('CF-Access-Authenticated-User-Email')
    if (cfEmail === c.env.ADMIN_EMAIL) {
      c.set('adminEmail', cfEmail)
      return next()
    }

    return c.json({ error: 'Acceso denegado' }, 403)
  },
)
