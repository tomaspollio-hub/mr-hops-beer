import { Outlet, NavLink, Link, Navigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/stock', label: 'Stock' },
  { to: '/admin/clientes', label: 'Clientes' },
]

export default function AdminLayout() {
  const { user } = useAuthStore()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen flex bg-hops-black">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-hops-dark border-r border-hops-border p-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-hops-green uppercase tracking-wider mb-8">
          <img src="/logo.jpg" alt="Mr. Hops" className="w-8 h-8 rounded-full object-cover border border-hops-green/30" />
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
        <div className="mt-auto flex flex-col gap-2">
          <Link to="/" className="text-xs text-hops-muted hover:text-hops-white transition-colors">
            ← Ver tienda
          </Link>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="text-xs text-hops-muted hover:text-red-400 transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden bg-hops-dark border-b border-hops-border px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Mr. Hops" className="w-7 h-7 rounded-full object-cover border border-hops-green/30" />
            <span className="font-display text-hops-green uppercase tracking-wider">Admin — Mr. Hops</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
