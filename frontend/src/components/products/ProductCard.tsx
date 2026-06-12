import { Link } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
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
    <div
      className={`
        bg-hops-card border border-hops-border rounded-xl overflow-hidden
        border-t-2 ${accent}
        flex flex-col
        transition-all duration-200
        hover:border-hops-green/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60
        group
      `}
    >
      {/* Imagen */}
      <Link to={`/productos/${product.id}`} className="block overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-56 bg-hops-raised flex items-center justify-center">
            <Package size={48} className="text-hops-subtle opacity-60" />
          </div>
        )}

        {product.compare_price && product.compare_price > product.price && (
          <span className="absolute top-3 left-3 text-[10px] font-bold bg-hops-error text-white px-2 py-0.5 rounded uppercase tracking-wider">
            Oferta
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <Link to={`/productos/${product.id}`} className="flex-1">
          <h3 className="font-display text-xl text-hops-white group-hover:text-hops-green transition-colors leading-tight uppercase tracking-wide line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-hops-muted mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-hops-subtle line-through block leading-none mb-0.5">
                {formatARS(product.compare_price)}
              </span>
            )}
            <span className="font-display text-2xl text-hops-gold tracking-wide">
              {formatARS(product.price)}
            </span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-2 bg-hops-green text-hops-black font-bold uppercase tracking-wider py-2.5 px-4 text-xs rounded hover:bg-hops-green-light active:scale-[0.97] transition-all duration-150 min-h-[44px]"
            >
              <ShoppingCart size={14} />
              Agregar
            </button>
          ) : (
            <span className="text-xs text-hops-subtle font-bold uppercase tracking-widest border border-hops-border px-3 py-2.5 rounded min-h-[44px] flex items-center">
              Sin stock
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
