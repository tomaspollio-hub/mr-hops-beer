import { type MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { type Env } from '@/types'

// Cloudflare Access inyecta el header CF-Access-Authenticated-User-Email
// en requests que pasaron la verificación de identidad.
// En desarrollo local se acepta el header X-Admin-Email para testing.
export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = createMiddleware(
  async (c, next) => {
    const cfEmail = c.req.header('CF-Access-Authenticated-User-Email')
    const devEmail = c.req.header('X-Admin-Email') // solo en dev

    const isDev = c.env.ENVIRONMENT === 'development'
    const adminEmail = c.env.ADMIN_EMAIL

    if (cfEmail === adminEmail || (isDev && devEmail === adminEmail)) {
      c.set('adminEmail', cfEmail ?? devEmail)
      return next()
    }

    return c.json({ error: 'Acceso denegado' }, 403)
  },
)
