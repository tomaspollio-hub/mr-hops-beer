import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { type Product } from '@/types'
import { formatARS } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem)

  return (
    <div className="card group flex flex-col hover:border-hops-green/40 transition-colors duration-200">
      {/* Imagen */}
      <Link to={`/productos/${product.id}`} className="block overflow-hidden rounded-sm mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-hops-border flex items-center justify-center">
            <span className="text-5xl">🍺</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <Link to={`/productos/${product.id}`}>
          <h3 className="font-bold text-hops-white hover:text-hops-green transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-hops-muted mt-1 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <span className="font-display text-xl text-hops-gold">{formatARS(product.price)}</span>

          {product.stock > 0 ? (
            <button
              onClick={() => addItem(product)}
              className="flex items-center gap-2 btn-primary py-2 px-4 text-sm"
            >
              <ShoppingCart size={16} />
              Agregar
            </button>
          ) : (
            <span className="text-sm text-hops-muted font-medium uppercase tracking-wider">Sin stock</span>
          )}
        </div>
      </div>
    </div>
  )
}
