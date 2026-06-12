import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/productos', label: 'Productos' },
  { to: '/barriles',  label: 'Barriles' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const [badgeAnim, setBadgeAnim] = useState(false)
  const itemCount = useCartStore(s => s.itemCount())
  const { user, logout } = useAuthStore()
  const menuRef = useRef<HTMLDivElement>(null)

  // Animate cart badge on count change
  useEffect(() => {
    if (itemCount !== prevCount && itemCount > 0) {
      setBadgeAnim(true)
      const t = setTimeout(() => setBadgeAnim(false), 300)
      setPrevCount(itemCount)
      return () => clearTimeout(t)
    }
    setPrevCount(itemCount)
  }, [itemCount])

  // Close menu on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-40 bg-hops-dark/90 backdrop-blur-md border-b border-hops-border"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-xl uppercase tracking-wider text-hops-green hover:text-hops-green-light transition-colors"
        >
          <img
            src="/logo.jpg"
            alt="Mr. Hops"
            className="w-9 h-9 rounded-full object-cover border-2 border-hops-green/30"
          />
          Mr. Hops
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-bold uppercase tracking-wider transition-colors border-b-2 pb-0.5',
                  isActive
                    ? 'text-hops-green border-hops-green'
                    : 'text-hops-muted border-transparent hover:text-hops-white hover:border-hops-white/20',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Cart */}
          <Link
            to="/carrito"
            className="relative p-2 text-hops-muted hover:text-hops-white transition-colors rounded-lg hover:bg-hops-raised"
          >
            <ShoppingCart size={21} />
            {itemCount > 0 && (
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 bg-hops-green text-hops-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none',
                  badgeAnim && 'badge-pop',
                )}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* Desktop user area */}
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-xs font-bold uppercase tracking-wider text-hops-green border border-hops-green/40 px-2.5 py-1.5 rounded hover:bg-hops-green hover:text-hops-black transition-all duration-150"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/perfil"
                className="text-sm text-hops-muted hover:text-hops-white transition-colors px-3 py-1.5 rounded hover:bg-hops-raised"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-hops-subtle hover:text-hops-error transition-colors px-3 py-1.5 rounded hover:bg-hops-raised"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 text-sm text-hops-muted hover:text-hops-white transition-colors px-3 py-1.5 rounded hover:bg-hops-raised"
            >
              <User size={16} />
              Ingresar
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-hops-muted hover:text-hops-white transition-colors rounded-lg hover:bg-hops-raised"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-hops-border bg-hops-dark/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1 menu-enter">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'flex items-center text-sm font-bold uppercase tracking-wider px-3 py-3 rounded-lg transition-colors border-l-2',
                  isActive
                    ? 'text-hops-green border-hops-green bg-hops-green/8'
                    : 'text-hops-muted border-transparent hover:text-hops-white hover:bg-hops-raised',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="h-px bg-hops-border my-1" />

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={close}
                  className="flex items-center text-sm font-bold text-hops-green px-3 py-3 rounded-lg hover:bg-hops-green/10 transition-colors"
                >
                  Panel admin
                </Link>
              )}
              <Link
                to="/perfil"
                onClick={close}
                className="text-sm text-hops-muted px-3 py-3 rounded-lg hover:text-hops-white hover:bg-hops-raised transition-colors"
              >
                Mi perfil
              </Link>
              <Link
                to="/mis-pedidos"
                onClick={close}
                className="text-sm text-hops-muted px-3 py-3 rounded-lg hover:text-hops-white hover:bg-hops-raised transition-colors"
              >
                Mis pedidos
              </Link>
              <button
                onClick={() => { logout(); close() }}
                className="text-sm text-hops-subtle hover:text-hops-error text-left px-3 py-3 rounded-lg hover:bg-hops-raised transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="text-sm text-hops-muted px-3 py-3 rounded-lg hover:text-hops-white hover:bg-hops-raised transition-colors"
            >
              Ingresar / Registrarse
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
