import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Plus, Minus, CheckCircle, Package } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatARS } from '@/lib/utils'

const CATEGORY_LABEL: Record<string, string> = {
  lata: 'Lata', pet: 'PET 1L', pack: 'Pack', barril: 'Barril', accesorio: 'Accesorio',
}

export default function ProductDetail() {
  const { id }      = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(id!)
  const addItem     = useCartStore(s => s.addItem)
  const [qty, setQty]     = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!product) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner className="w-12 h-12" /></div>
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-hops-raised flex items-center justify-center mx-auto mb-5">
          <Package size={36} className="text-hops-subtle" />
        </div>
        <p className="text-hops-muted mb-6 text-lg">Producto no encontrado</p>
        <Link to="/productos" className="btn-secondary gap-2">
          <ArrowLeft size={16} /> Volver a productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        to="/productos"
        className="inline-flex items-center gap-2 text-sm text-hops-muted hover:text-hops-white transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver a productos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

        {/* Imagen */}
        <div className="rounded-xl overflow-hidden bg-hops-card border border-hops-border">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-80 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-80 flex items-center justify-center">
              <Package size={80} className="text-hops-subtle opacity-40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="badge bg-hops-green/10 text-hops-green mb-3 self-start">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>

          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-hops-white mb-4 leading-tight">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-hops-muted mb-6 leading-relaxed text-sm">
              {product.description}
            </p>
          )}

          <div className="flex items-baseline gap-3 mb-8">
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-hops-subtle line-through text-xl font-display">
                {formatARS(product.compare_price)}
              </span>
            )}
            <span className="font-display text-4xl text-hops-gold">
              {formatARS(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs font-bold bg-hops-error text-white px-2 py-0.5 rounded uppercase tracking-wider">
                Oferta
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <>
              {/* Selector de cantidad */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-1.5">
                  <span className="text-sm text-hops-muted uppercase tracking-wider">Cantidad</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-11 h-11 border border-hops-border rounded-lg flex items-center justify-center text-hops-white hover:border-hops-green hover:bg-hops-raised active:scale-[0.95] transition-all duration-150"
                      aria-label="Reducir cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-hops-white w-8 text-center text-lg select-none">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-11 h-11 border border-hops-border rounded-lg flex items-center justify-center text-hops-white hover:border-hops-green hover:bg-hops-raised active:scale-[0.95] transition-all duration-150"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <span className="text-xs text-hops-subtle">{product.stock} disponibles</span>
              </div>

              {/* Botón agregar */}
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider px-5 py-3.5 rounded w-full transition-all duration-300 text-sm ${
                  added
                    ? 'bg-hops-success text-hops-black cursor-default scale-[0.99]'
                    : 'bg-hops-green text-hops-black hover:bg-hops-green-light active:scale-[0.97]'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircle size={18} />
                    ¡Agregado al carrito!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Agregar al carrito
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="py-4 px-6 border border-hops-border rounded-xl text-hops-subtle text-center uppercase tracking-wider text-sm bg-hops-raised">
              Sin stock disponible
            </div>
          )}

          <p className="text-xs text-hops-subtle mt-6 uppercase tracking-widest">
            Prohibida la venta a menores de 18 años.
          </p>
        </div>
      </div>
    </div>
  )
}
