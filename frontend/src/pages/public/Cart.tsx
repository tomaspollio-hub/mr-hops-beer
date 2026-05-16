import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatARS } from '@/lib/utils'

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={56} className="mx-auto text-hops-border mb-6" />
        <h1 className="section-title mb-4">Tu carrito está vacío</h1>
        <p className="text-hops-muted mb-8">Todavía no agregaste ningún producto.</p>
        <Link to="/productos" className="btn-primary inline-flex items-center gap-2">
          Ver productos <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex items-center gap-4">
              {/* Imagen */}
              <div className="w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-hops-border">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍺</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-hops-white truncate">{product.name}</p>
                <p className="text-hops-gold font-bold">{formatARS(product.price)}</p>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 border border-hops-border rounded-sm flex items-center justify-center text-hops-white hover:border-hops-green transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center font-bold text-hops-white text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 border border-hops-border rounded-sm flex items-center justify-center text-hops-white hover:border-hops-green transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0 hidden sm:block">
                <p className="font-bold text-hops-white">{formatARS(product.price * quantity)}</p>
              </div>

              {/* Eliminar */}
              <button
                onClick={() => removeItem(product.id)}
                className="p-1.5 text-hops-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4">Resumen</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <span className="text-hops-muted truncate mr-2">{product.name} ×{quantity}</span>
                  <span className="text-hops-white shrink-0">{formatARS(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-hops-border pt-3 mb-6 flex justify-between items-center">
              <span className="font-bold text-hops-white uppercase tracking-wider">Total</span>
              <span className="font-display text-2xl text-hops-gold">{formatARS(total())}</span>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Confirmar pedido <ArrowRight size={18} />
            </Link>

            <Link to="/productos" className="block text-center text-sm text-hops-muted hover:text-hops-white transition-colors mt-3">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
