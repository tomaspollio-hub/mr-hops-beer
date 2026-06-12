import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatARS } from '@/lib/utils'

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCartStore()
  const [removing, setRemoving] = useState<string | null>(null)

  const handleRemove = (productId: string) => {
    setRemoving(productId)
    setTimeout(() => {
      removeItem(productId)
      setRemoving(null)
    }, 220)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-hops-raised flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={36} className="text-hops-subtle" />
        </div>
        <h1 className="section-title mb-4">Tu carrito</h1>
        <p className="text-hops-muted mb-8">Todavía no agregaste ningún producto.</p>
        <Link to="/productos" className="btn-primary gap-2">
          Ver productos <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Tu carrito</h1>

      {/*
        Mobile: summary first (order-first), items below (order-last)
        Desktop: items en cols 1-2, summary en col 3 vía explicit placement
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resumen — primero en mobile, columna 3 en desktop */}
        <div className="order-first lg:col-start-3 lg:row-start-1">
          <div className="card sticky top-24">
            <h2 className="font-bold uppercase tracking-wider text-hops-white mb-4 text-sm">Resumen</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-2">
                  <span className="text-hops-muted truncate">{product.name} ×{quantity}</span>
                  <span className="text-hops-white shrink-0">{formatARS(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-hops-border pt-3 mb-5 flex justify-between items-center">
              <span className="font-bold text-hops-white uppercase tracking-wider text-sm">Total</span>
              <span className="font-display text-2xl text-hops-gold">{formatARS(total())}</span>
            </div>

            <Link to="/checkout" className="btn-primary w-full gap-2">
              Confirmar pedido <ArrowRight size={18} />
            </Link>

            <Link
              to="/productos"
              className="block text-center text-sm text-hops-muted hover:text-hops-white transition-colors mt-3 py-1"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>

        {/* Lista de items — cols 1-2 en desktop */}
        <div className="order-last lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-3">
          {items.map(({ product, quantity }) => {
            const isLeaving = removing === product.id
            return (
              <div
                key={product.id}
                className={`card flex items-center gap-4 transition-all duration-220 ${
                  isLeaving ? 'opacity-0 -translate-x-3 scale-[0.98]' : 'opacity-100 translate-x-0 scale-100'
                }`}
              >
                {/* Imagen */}
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-hops-raised">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={24} className="text-hops-subtle" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-hops-white truncate">{product.name}</p>
                  <p className="text-hops-gold font-bold text-sm">{formatARS(product.price)}</p>
                </div>

                {/* Controles cantidad */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-11 h-11 border border-hops-border rounded-lg flex items-center justify-center text-hops-white hover:border-hops-green hover:bg-hops-raised active:scale-[0.95] transition-all duration-150"
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center font-bold text-hops-white text-sm select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-11 h-11 border border-hops-border rounded-lg flex items-center justify-center text-hops-white hover:border-hops-green hover:bg-hops-raised active:scale-[0.95] transition-all duration-150"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0 hidden sm:block min-w-[80px]">
                  <p className="font-bold text-hops-white">{formatARS(product.price * quantity)}</p>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="p-2 text-hops-subtle hover:text-hops-error transition-colors rounded-lg hover:bg-hops-raised"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
