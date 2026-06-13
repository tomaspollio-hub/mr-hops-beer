import { Link } from 'react-router-dom'

const LEGAL_LINKS = [
  { to: '/envios',       label: 'Política de envíos' },
  { to: '/devoluciones', label: 'Devoluciones' },
  { to: '/terminos',     label: 'Términos y condiciones' },
  { to: '/privacidad',   label: 'Privacidad' },
]

const WHATSAPP = '5492994730001'
const INSTAGRAM = 'https://www.instagram.com/mr.hopsbeer/'
const FACEBOOK  = 'https://www.facebook.com/profile.php?id=100027472251755'
const THREADS   = 'https://www.threads.com/@mr.hopsbeer'
const MAPS      = 'https://maps.app.goo.gl/nCqUHMnQNxrHJG7J6'

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  )
}

function IconThreads() {
  return (
    <svg width="18" height="18" viewBox="0 0 192 192" fill="currentColor" aria-hidden="true">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.05l13.24 9.08c5.742-8.711 14.765-10.565 21.88-10.565h.23c8.45.054 14.82 2.51 18.94 7.3 3.005 3.55 5.024 8.46 6.016 14.645-7.515-1.282-15.644-1.676-24.32-1.174-24.437 1.408-40.154 15.7-39.186 35.54.486 10.04 5.32 18.667 13.618 24.334 6.985 4.823 15.975 7.17 25.34 6.63 12.35-.697 22.032-5.4 28.772-13.98 5.144-6.5 8.4-14.93 9.867-25.52 5.92 3.573 10.3 8.273 12.76 13.86 4.166 9.46 4.412 25.016-8.618 38.032-11.406 11.39-25.126 16.31-45.87 16.46-23.002-.168-40.402-7.555-51.72-21.955C33.847 152.69 28.17 138.08 27.936 120H14c.238 21.758 7.02 39.05 20.17 51.38C47.834 183.887 66.906 190.96 90.288 191c24.412-.04 42.34-7.25 56.08-21.01 18.708-18.698 18.116-41.173 11.726-55.19-4.602-10.453-13.32-18.915-16.557-25.812z"/>
      <path d="M96.47 139.08c-10.73 0-19.59-4.79-20.12-12.35-.36-5.13 2.8-10.54 13.84-11.19 12.1-.697 17.9 1.463 23.68 5.724-2.74 10.68-10.03 17.815-17.4 17.815z"/>
    </svg>
  )
}

const socialLinks = [
  { href: `https://wa.me/${WHATSAPP}`, label: 'WhatsApp',      icon: IconWhatsApp },
  { href: INSTAGRAM,                   label: '@mr.hopsbeer',  icon: IconInstagram },
  { href: FACEBOOK,                    label: 'Facebook',      icon: IconFacebook },
  { href: THREADS,                     label: 'Threads',       icon: IconThreads },
  { href: MAPS,                        label: 'Cómo llegar',   icon: IconMapPin },
]

export default function Footer() {
  return (
    <footer className="bg-hops-dark border-t border-hops-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="Mr. Hops" className="w-11 h-11 rounded-full object-cover border-2 border-hops-green/30" />
              <p className="font-display text-xl text-hops-green uppercase tracking-wider">Mr. Hops Beer</p>
            </div>
            <p className="text-sm text-hops-muted mb-3 leading-relaxed">
              Cervecería artesanal patagónica. Latas, PETs, packs y alquiler de barriles.
            </p>
            <p className="text-xs text-hops-subtle leading-relaxed">
              Julián Marcelo Pesci · CUIT 20-36257061-2<br />
              Neuquén (Q8302), Argentina
            </p>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-hops-white mb-4">Navegación</p>
            <div className="flex flex-col gap-2.5">
              <Link to="/productos"  className="text-sm text-hops-muted hover:text-hops-green transition-colors">Productos</Link>
              <Link to="/barriles"   className="text-sm text-hops-muted hover:text-hops-green transition-colors">Alquiler de barriles</Link>
              <Link to="/carrito"    className="text-sm text-hops-muted hover:text-hops-green transition-colors">Carrito</Link>
            </div>
          </div>

          {/* Contacto y redes */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-hops-white mb-4">Contacto</p>
            <div className="flex flex-col gap-2.5">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-hops-muted hover:text-hops-green transition-colors group"
                >
                  <span className="text-hops-subtle group-hover:text-hops-green transition-colors">
                    <Icon />
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div className="border-t border-hops-border pt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          {LEGAL_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs text-hops-subtle hover:text-hops-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="text-center">
          <p className="text-xs text-hops-muted font-bold uppercase tracking-widest mb-2">
            Beber con moderación. Prohibida la venta a menores de 18 años.
          </p>
          <p className="text-xs text-hops-subtle">
            © {new Date().getFullYear()} Mr. Hops Beer — Julián Marcelo Pesci · CUIT 20-36257061-2
          </p>
        </div>
      </div>
    </footer>
  )
}
