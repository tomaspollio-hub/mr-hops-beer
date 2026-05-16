import { Link } from 'react-router-dom'

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5491100000000'

export default function Footer() {
  return (
    <footer className="bg-hops-dark border-t border-hops-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-display text-xl text-hops-green uppercase tracking-wider mb-2">Mr. Hops Beer</p>
            <p className="text-sm text-hops-muted">Cervecería artesanal. Latas, PETs, packs y alquiler de barriles.</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-hops-white mb-3">Navegación</p>
            <div className="flex flex-col gap-2">
              <Link to="/productos" className="text-sm text-hops-muted hover:text-hops-green transition-colors">Productos</Link>
              <Link to="/barriles" className="text-sm text-hops-muted hover:text-hops-green transition-colors">Alquiler de barriles</Link>
              <Link to="/carrito" className="text-sm text-hops-muted hover:text-hops-green transition-colors">Carrito</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-hops-white mb-3">Contacto</p>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-hops-muted hover:text-hops-green transition-colors"
            >
              WhatsApp
            </a>
            <p className="text-sm text-hops-muted mt-1">
              <a
                href="https://instagram.com/mr.hopsbeer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-hops-green transition-colors"
              >
                @mr.hopsbeer
              </a>
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-hops-border pt-6">
          <p className="text-xs text-hops-muted text-center font-bold uppercase tracking-widest">
            BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.
          </p>
          <p className="text-xs text-hops-muted text-center mt-2">
            © {new Date().getFullYear()} Mr. Hops Beer. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
