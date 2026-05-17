import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { type Product } from '@/types'
import { formatARS } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

const CATEGORY_ACCENT: Record<string, string> = {
  lata:      'border-hops-green',
  pet:       'border-hops-gold',
  pack:      'border-hops-yellow',
  accesorio: 'border-hops-muted',
  barril:    'border-orange-500',
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const accent = CATEGORY_ACCENT[product.category] ?? 'border-hops-border'

  return (
    <div className={`bg-hops-card border border-hops-border border-t-2 ${accent} group flex flex-col hover:border-hops-green/50 transition-colors duration-200`}>
      {/* Imagen */}
      <Link to={`/productos/${product.id}`} className="block overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-52 bg-hops-border flex items-center justify-center">
            <span className="text-6xl opacity-30">🍺</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4">
        <Link to={`/productos/${product.id}`}>
          <h3 className="font-display text-xl text-hops-white group-hover:text-hops-green transition-colors leading-tight uppercase tracking-wide line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-hops-muted mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <span className="font-display text-2xl text-hops-gold tracking-wide">{formatARS(product.price)}</span>

          {product.stock > 0 ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-2 bg-hops-green text-hops-black font-bold uppercase tracking-wider py-2 px-4 text-xs hover:bg-hops-green-light transition-colors"
            >
              <ShoppingCart size={14} />
              Agregar
            </button>
          ) : (
            <span className="text-xs text-hops-muted font-bold uppercase tracking-widest border border-hops-border px-3 py-2">
              Sin stock
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
