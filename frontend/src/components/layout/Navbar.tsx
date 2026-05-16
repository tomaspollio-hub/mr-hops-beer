import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/productos', label: 'Productos' },
  { to: '/barriles', label: 'Barriles' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCartStore(s => s.itemCount())
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 bg-hops-dark border-b border-hops-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl uppercase tracking-wider text-hops-green">
          <span className="text-2xl">🍺</span>
          Mr. Hops
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn('text-sm font-bold uppercase tracking-wider transition-colors',
                  isActive ? 'text-hops-green' : 'text-hops-muted hover:text-hops-white')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/carrito" className="relative p-2 text-hops-white hover:text-hops-green transition-colors">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-hops-green text-hops-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/mis-pedidos" className="text-sm text-hops-muted hover:text-hops-white transition-colors">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="text-sm text-hops-muted hover:text-red-400 transition-colors">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1 text-sm text-hops-muted hover:text-hops-white transition-colors">
              <User size={18} />
              Ingresar
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-hops-white"
            aria-label="Menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-hops-border bg-hops-dark px-4 py-4 flex flex-col gap-4">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn('text-sm font-bold uppercase tracking-wider',
                  isActive ? 'text-hops-green' : 'text-hops-muted')
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/mis-pedidos" onClick={() => setOpen(false)} className="text-sm text-hops-muted">Mis pedidos</Link>
              <button onClick={() => { logout(); setOpen(false) }} className="text-sm text-red-400 text-left">Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-hops-muted">Ingresar / Registrarse</Link>
          )}
        </div>
      )}
    </header>
  )
}
