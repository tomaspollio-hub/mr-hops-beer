import { Hono } from 'hono'
import { type Env } from './types'
import { corsMiddleware } from './middleware/cors'
import productsRoute from './routes/products'
import authRoute from './routes/auth'
import ordersRoute from './routes/orders'
import reservationsRoute from './routes/reservations'
import usersRoute from './routes/users'
import uploadsRoute from './routes/uploads'
import adminProductsRoute from './routes/admin/products'
import adminOrdersRoute from './routes/admin/orders'
import adminReservationsRoute from './routes/admin/reservations'
import adminStockRoute from './routes/admin/stock'
import adminCustomersRoute from './routes/admin/customers'
import adminSettingsRoute from './routes/admin/settings'
import paymentsRoute from './routes/payments'

const app = new Hono<{ Bindings: Env }>()

app.use('*', corsMiddleware)

// Health check
app.get('/api/health', c => c.json({ status: 'ok', env: c.env.ENVIRONMENT }))

// Rutas públicas
app.route('/api/products', productsRoute)
app.route('/api/barrels', productsRoute) // alias filtrado por categoría barril
app.route('/api/auth', authRoute)
app.route('/api/orders', ordersRoute)
app.route('/api/reservations', reservationsRoute)

// Pagos MercadoPago
app.route('/api/payments', paymentsRoute)

// Rutas autenticadas (usuario)
app.route('/api/my', usersRoute)

// Rutas admin
app.route('/api/admin/uploads', uploadsRoute)
app.route('/api/admin/products', adminProductsRoute)
app.route('/api/admin/orders', adminOrdersRoute)
app.route('/api/admin/reservations', adminReservationsRoute)
app.route('/api/admin/stock', adminStockRoute)
app.route('/api/admin/customers', adminCustomersRoute)
app.route('/api/admin/settings', adminSettingsRoute)

// Dashboard admin
app.get('/api/admin/dashboard', async c => {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = today.slice(0, 7) + '-01'

  const [ordersToday, pendingOrders, activeReservations, revenueMonth, revenueToday, pendingReservations] = await Promise.all([
    c.env.DB.prepare(
      `SELECT status, COUNT(*) as count FROM orders WHERE date(created_at) = ? GROUP BY status`,
    ).bind(today).all(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM orders WHERE status = 'pending_confirmation'`,
    ).first<{ count: number }>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM barrel_reservations WHERE status IN ('confirmed','barrel_delivered')`,
    ).first<{ count: number }>(),
    c.env.DB.prepare(
      `SELECT COALESCE(SUM(total),0) as total FROM orders WHERE date(created_at) >= ? AND status != 'cancelled'`,
    ).bind(monthStart).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT COALESCE(SUM(total),0) as total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'`,
    ).bind(today).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM barrel_reservations WHERE status = 'pending_confirmation'`,
    ).first<{ count: number }>(),
  ])

  return c.json({
    orders_today: ordersToday.results,
    pending_orders: pendingOrders?.count ?? 0,
    active_reservations: activeReservations?.count ?? 0,
    pending_reservations: pendingReservations?.count ?? 0,
    revenue_today: revenueToday?.total ?? 0,
    revenue_month: revenueMonth?.total ?? 0,
  })
})

app.notFound(c => c.json({ error: 'Ruta no encontrada' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Error interno del servidor' }, 500)
})

export default app
