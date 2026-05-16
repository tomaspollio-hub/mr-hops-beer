import { type MiddlewareHandler } from 'hono'

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('Origin') ?? ''
  const allowed = [
    c.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:4173',
  ]

  if (allowed.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }

  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  c.header('Access-Control-Max-Age', '86400')

  if (c.req.method === 'OPTIONS') return c.body(null, 204)

  await next()
}
