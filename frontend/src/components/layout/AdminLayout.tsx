import { Outlet, NavLink, Link, Navigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Calendar, Package, BarChart2, Users, Store, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import ToastContainer from '@/components/ui/Toast'

const adminLinks = [
  { to: '/admin',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos',   label: 'Pedidos',    icon: ShoppingBag },
  { to: '/admin/reservas',  label: 'Reservas',   icon: Calendar },
  { to: '/admin/productos', label: 'Productos',  icon: Package },
  { to: '/admin/stock',     label: 'Stock',      icon: BarChart2 },
  { to: '/admin/clientes',  label: 'Clientes',   icon: Users },
]

// Mobile nav: 5 items máximo — Stock removido (accesible desde desktop sidebar)
const mobileLinks = adminLinks.filter(l => l.to !== '/admin/stock')

export default function AdminLayout() {
  const { user, logout } = useAuthStore()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen flex bg-hops-black">
      <ToastContainer />

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-hops-dark border-r border-hops-border shrink-0">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-4 py-5 border-b border-hops-border hover:bg-hops-raised transition-colors"
        >
          <img src="/logo.jpg" alt="Mr. Hops" className="w-7 h-7 rounded-full object-cover border border-hops-green/30" />
          <span className="font-display text-base text-hops-green uppercase tracking-wider">Mr. Hops</span>
        </Link>

        <p className="text-[10px] text-hops-subtle uppercase tracking-[0.2em] px-4 pt-5 pb-2">
          Panel admin
        </p>

        {/* Nav */}
        <nav className="flex flex-col flex-1 gap-0.5 px-2">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 rounded-lg border-l-2',
                  isActive
                    ? 'border-hops-green bg-hops-green/10 text-hops-green'
                    : 'border-transparent text-hops-muted hover:text-hops-white hover:bg-hops-raised',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-hops-green' : 'text-hops-subtle'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-hops-border p-3 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-hops-muted hover:text-hops-white hover:bg-hops-raised transition-colors py-2 px-3 rounded-lg"
          >
            <Store size={13} /> Ver tienda
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-hops-muted hover:text-hops-error hover:bg-hops-raised transition-colors py-2 px-3 rounded-lg w-full text-left"
          >
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden bg-hops-dark border-b border-hops-border px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Mr. Hops" className="w-7 h-7 rounded-full object-cover border border-hops-green/30" />
            <span className="font-display text-hops-green uppercase tracking-wider text-sm">Admin</span>
          </div>
          <button
            onClick={logout}
            className="text-hops-muted hover:text-hops-error transition-colors p-2 rounded-lg hover:bg-hops-raised"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto page-enter pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav — 5 items */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-hops-dark border-t border-hops-border flex z-40">
          {mobileLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors',
                  isActive ? 'text-hops-green' : 'text-hops-subtle hover:text-hops-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} className={isActive ? 'text-hops-green' : 'text-hops-subtle'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
