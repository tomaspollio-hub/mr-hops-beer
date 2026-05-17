import { Outlet, NavLink, Link, Navigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Calendar, Package, BarChart2, Users, Store, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import ToastContainer from '@/components/ui/Toast'

const adminLinks = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos',  label: 'Pedidos',   icon: ShoppingBag },
  { to: '/admin/reservas', label: 'Reservas',  icon: Calendar },
  { to: '/admin/productos',label: 'Productos', icon: Package },
  { to: '/admin/stock',    label: 'Stock',     icon: BarChart2 },
  { to: '/admin/clientes', label: 'Clientes',  icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen flex bg-hops-black">
      <ToastContainer />

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-hops-dark border-r border-hops-border">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-4 py-5 border-b border-hops-border hover:bg-hops-card transition-colors">
          <img src="/logo.jpg" alt="Mr. Hops" className="w-7 h-7 rounded-full object-cover border border-hops-green/30" />
          <span className="font-display text-base text-hops-green uppercase tracking-wider">Mr. Hops</span>
        </Link>

        {/* Label */}
        <p className="text-[10px] text-hops-muted uppercase tracking-[0.2em] px-4 pt-5 pb-2">Panel admin</p>

        {/* Nav */}
        <nav className="flex flex-col flex-1">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 border-l-2',
                  isActive
                    ? 'border-hops-green bg-hops-green/10 text-hops-green'
                    : 'border-transparent text-hops-muted hover:text-hops-white hover:bg-hops-card hover:border-hops-border')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-hops-green' : 'text-hops-muted'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-hops-border p-4 space-y-1">
          <Link to="/" className="flex items-center gap-2 text-xs text-hops-muted hover:text-hops-white transition-colors py-1.5">
            <Store size={13} /> Ver tienda
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-hops-muted hover:text-red-400 transition-colors py-1.5 w-full text-left"
          >
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden bg-hops-dark border-b border-hops-border px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Mr. Hops" className="w-7 h-7 rounded-full object-cover border border-hops-green/30" />
            <span className="font-display text-hops-green uppercase tracking-wider text-sm">Admin</span>
          </div>
          <button onClick={logout} className="text-hops-muted hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto page-enter pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-hops-dark border-t border-hops-border flex z-40">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors',
                  isActive ? 'text-hops-green' : 'text-hops-muted')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-hops-green' : 'text-hops-muted'} />
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
