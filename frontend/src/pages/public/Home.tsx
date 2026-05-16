import { Link } from 'react-router-dom'
import { ArrowRight, Beer, Package, Drumstick } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import Spinner from '@/components/ui/Spinner'
import { useProducts } from '@/hooks/useProducts'

const CATEGORY_LABELS: Record<string, string> = {
  lata: 'Latas',
  pet: 'PET 1L',
  pack: 'Packs',
  accesorio: 'Accesorios',
}

export default function Home() {
  const { products, loading } = useProducts()
  const featured = products.filter(p => p.category !== 'barril').slice(0, 4)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-hops-black">
        <div className="absolute inset-0 bg-gradient-to-br from-hops-green/5 via-transparent to-hops-gold/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-hops-green/10 via-transparent to-transparent" />

        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 bg-hops-green/10 border-2 border-hops-green/30 rounded-full flex items-center justify-center">
            <span className="text-7xl">🍺</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-wider text-hops-white leading-none mb-2">
            Mr. <span className="text-hops-green">Hops</span>
          </h1>
          <p className="font-display text-2xl md:text-3xl uppercase tracking-widest text-hops-gold mb-6">
            Craft Beer
          </p>
          <p className="text-hops-muted text-lg max-w-xl mx-auto mb-10">
            Cerveza artesanal en lata, PET y packs. Alquiler de barriles para tus eventos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/productos" className="btn-primary flex items-center justify-center gap-2">
              Ver productos <ArrowRight size={18} />
            </Link>
            <Link to="/barriles" className="btn-secondary flex items-center justify-center gap-2">
              Alquilar barril
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hops-green/40 to-transparent" />
      </section>

      {/* ── Categorías ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="section-title text-center mb-10">Lo que tenemos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
            <Link
              key={slug}
              to={`/productos?category=${slug}`}
              className="card flex flex-col items-center gap-3 py-6 hover:border-hops-green/50 hover:bg-hops-green/5 transition-all duration-200 text-center group"
            >
              <span className="text-4xl">
                {slug === 'lata' ? '🥫' : slug === 'pet' ? '🍶' : slug === 'pack' ? '📦' : '🍻'}
              </span>
              <span className="font-bold uppercase tracking-wider text-sm text-hops-white group-hover:text-hops-green transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Productos destacados ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Destacados</h2>
          <Link to="/productos" className="text-sm text-hops-green hover:text-hops-green-light transition-colors flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-10 h-10" /></div>
        ) : featured.length === 0 ? (
          <p className="text-hops-muted text-center py-12">Productos próximamente</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Banner Barriles ──────────────────────────────────────────── */}
      <section className="bg-hops-green/10 border-y border-hops-green/20 py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="text-7xl shrink-0">🛢️</div>
          <div className="flex-1">
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-hops-white mb-3">
              Alquilá tu barril
            </h2>
            <p className="text-hops-muted mb-6">
              Tenemos barriles de 10, 20 y 30 litros disponibles para fiestas y eventos.
              Consultá disponibilidad y reservá online.
            </p>
            <Link to="/barriles" className="btn-gold inline-flex items-center gap-2">
              Ver disponibilidad <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Beer size={32} className="text-hops-green" />, title: 'Cerveza artesanal', desc: 'Producción propia, ingredientes seleccionados.' },
            { icon: <Package size={32} className="text-hops-green" />, title: 'Delivery y retiro', desc: 'Te lo llevamos o retirás en nuestro local.' },
            { icon: <Drumstick size={32} className="text-hops-green" />, title: 'Barriles para eventos', desc: 'Alquiler de barriles con o sin chopera.' },
          ].map((f, i) => (
            <div key={i} className="card text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="font-bold uppercase tracking-wider text-hops-white mb-2">{f.title}</h3>
              <p className="text-sm text-hops-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
