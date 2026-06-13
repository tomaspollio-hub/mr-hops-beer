import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import Spinner from '@/components/ui/Spinner'
import { useProducts } from '@/hooks/useProducts'
import { useReveal } from '@/hooks/useReveal'

const CATEGORIES = [
  { slug: 'lata',      label: 'Latas',       num: '01', desc: '473 cm³ · Todos los estilos' },
  { slug: 'pet',       label: 'PET 1L',      num: '02', desc: 'Para llevar más por menos' },
  { slug: 'pack',      label: 'Packs',       num: '03', desc: 'Variedad en una caja' },
  { slug: 'accesorio', label: 'Accesorios',  num: '04', desc: 'Para la experiencia completa' },
]

export default function Home() {
  const { products, loading } = useProducts()
  const featured = products.filter(p => p.category !== 'barril').slice(0, 4)

  const cats     = useReveal()
  const featured_ = useReveal()
  const barrel   = useReveal(0.08)
  const phil     = useReveal()

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-end pb-20 px-6 md:px-16"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)' }}
      >
        {/* Fondo */}
        <div className="absolute inset-0 bg-hops-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#7EC82522,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,#FFD60010,transparent)]" />

        {/* Tagline top */}
        <div className="absolute top-8 right-6 md:right-16 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-hops-muted">
            Brewed in Patagonia Argentina
          </p>
        </div>

        {/* Logo flotante */}
        <div className="absolute top-1/2 right-0 md:right-8 -translate-y-1/2 pointer-events-none hidden md:block">
          <div className="absolute inset-0 rounded-full bg-hops-green/25 blur-3xl scale-125" />
          <img
            src="/logo.png"
            alt=""
            className="relative w-[420px] h-[420px] object-contain opacity-60"
            style={{ maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 45%, transparent 80%)' }}
          />
        </div>

        {/* Texto principal */}
        <div className="relative z-10 max-w-5xl slide-up">
          <p className="font-display text-hops-green text-2xl md:text-3xl tracking-[0.15em] mb-2">
            Original · Brewing Co.
          </p>
          <h1 className="font-display text-[clamp(5rem,18vw,14rem)] leading-[0.88] text-hops-white uppercase">
            Mr.<br />
            <span className="text-hops-green">Hops</span>
          </h1>
          <p className="font-display text-hops-yellow text-3xl md:text-5xl tracking-widest mt-2 mb-10">
            Craft Beer
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/productos" className="btn-primary inline-flex items-center gap-3 text-base">
              Ver productos <ArrowRight size={18} />
            </Link>
            <Link to="/barriles" className="btn-secondary inline-flex items-center gap-3 text-base">
              Alquilar barril
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-12 bg-hops-green animate-pulse" />
        </div>
      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────────────────── */}
      <section
        ref={cats.ref as React.RefObject<HTMLElement>}
        className={`max-w-6xl mx-auto px-6 md:px-16 pt-28 pb-20 transition-opacity duration-700 ${cats.visible ? 'reveal-up' : 'opacity-0'}`}
      >
        <div className="flex items-end justify-between mb-12">
          <h2 className="section-title">Lo que<br />tenemos</h2>
          <Link to="/productos" className="text-xs font-bold uppercase tracking-[0.2em] text-hops-muted hover:text-hops-green transition-colors hidden md:flex items-center gap-2">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hops-border">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/productos?category=${cat.slug}`}
              className="bg-hops-black p-8 group flex items-center justify-between hover:bg-hops-card transition-colors duration-200"
            >
              <div>
                <p className="font-display text-hops-green text-sm tracking-widest mb-1">{cat.num}</p>
                <p className="font-display text-4xl md:text-5xl text-hops-white group-hover:text-hops-green transition-colors leading-none">
                  {cat.label}
                </p>
                <p className="text-hops-muted text-sm mt-2">{cat.desc}</p>
              </div>
              <ArrowRight size={24} className="text-hops-border group-hover:text-hops-green transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── DESTACADOS ───────────────────────────────────────────────────── */}
      <section
        ref={featured_.ref as React.RefObject<HTMLElement>}
        className={`max-w-6xl mx-auto px-6 md:px-16 pb-20 transition-opacity duration-700 ${featured_.visible ? 'reveal-up' : 'opacity-0'}`}
      >
        <div className="flex items-end justify-between mb-10">
          <h2 className="section-title">Destacados</h2>
          <Link to="/productos" className="text-xs font-bold uppercase tracking-[0.2em] text-hops-muted hover:text-hops-green transition-colors flex items-center gap-2">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-10 h-10" /></div>
        ) : featured.length === 0 ? (
          <p className="text-hops-muted text-center py-12 text-lg">Productos próximamente</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── BARRILES ─────────────────────────────────────────────────────── */}
      <section
        ref={barrel.ref as React.RefObject<HTMLElement>}
        className={`relative py-28 px-6 md:px-16 overflow-hidden transition-opacity duration-700 ${barrel.visible ? 'reveal-up' : 'opacity-0'}`}
        style={{ clipPath: 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)' }}
      >
        <div className="absolute inset-0 bg-hops-green" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_50%,#FFD60030,transparent)]" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
          <div>
            <p className="font-display text-hops-black/60 text-lg tracking-widest mb-2 uppercase">Para tus eventos</p>
            <h2 className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-none text-hops-black uppercase">
              Alquilá<br />tu barril
            </h2>
            <p className="text-hops-black/70 mt-4 max-w-md text-lg">
              10, 20 y 30 litros. Con o sin chopera. Reservá online y retirá en fábrica.
            </p>
          </div>
          <Link
            to="/barriles"
            className="shrink-0 bg-hops-black text-hops-green font-bold uppercase tracking-widest px-8 py-4 text-lg hover:bg-hops-yellow hover:text-hops-black transition-colors duration-200 flex items-center gap-3"
          >
            Ver disponibilidad <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FILOSOFÍA ────────────────────────────────────────────────────── */}
      <section
        ref={phil.ref as React.RefObject<HTMLElement>}
        className={`max-w-6xl mx-auto px-6 md:px-16 py-28 transition-opacity duration-700 ${phil.visible ? 'reveal-up' : 'opacity-0'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hops-border">
          {[
            { num: '—', title: 'Artesanal', body: 'Producción propia en Patagonia Argentina. Ingredientes seleccionados, sin atajos.' },
            { num: '—', title: 'Delivery\ny retiro', body: 'Te lo llevamos o pasás a buscar. Siempre fresco, siempre a tiempo.' },
            { num: '—', title: 'Barriles\npara eventos', body: 'Alquiler con chopera incluida. Ideal para fiestas, cumpleaños y eventos.' },
          ].map((f, i) => (
            <div key={i} className="bg-hops-black p-8 md:p-10">
              <p className="font-display text-hops-green text-2xl mb-4">{f.num}</p>
              <h3 className="font-display text-3xl md:text-4xl text-hops-white uppercase leading-none mb-4 whitespace-pre-line">{f.title}</h3>
              <p className="text-hops-muted text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
