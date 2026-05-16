import { Outlet, NavLink, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/stock', label: 'Stock' },
  { to: '/admin/clientes', label: 'Clientes' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-hops-black">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-hops-dark border-r border-hops-border p-4">
        <Link to="/" className="font-display text-lg text-hops-green uppercase tracking-wider mb-8">
          Mr. Hops
        </Link>
        <p className="text-xs text-hops-muted uppercase tracking-widest mb-3">Admin</p>
        <nav className="flex flex-col gap-1">
          {adminLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn('px-3 py-2 rounded-sm text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-hops-green/10 text-hops-green'
                    : 'text-hops-muted hover:text-hops-white hover:bg-hops-border')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <Link to="/" className="text-xs text-hops-muted hover:text-hops-white transition-colors">
            ← Ver tienda
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden bg-hops-dark border-b border-hops-border px-4 h-14 flex items-center">
          <span className="font-display text-hops-green uppercase tracking-wider">Admin — Mr. Hops</span>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
