import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatARS } from '@/lib/utils'

const CATEGORY_LABEL: Record<string, string> = {
  lata: 'Lata', pet: 'PET 1L', pack: 'Pack', barril: 'Barril', accesorio: 'Accesorio',
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(id!)
  const addItem = useCartStore(s => s.addItem)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!product) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-12 h-12" /></div>
  if (error || !product) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-hops-muted mb-4">Producto no encontrado</p>
      <Link to="/productos" className="btn-secondary">← Volver a productos</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/productos" className="inline-flex items-center gap-2 text-sm text-hops-muted hover:text-hops-white transition-colors mb-8">
        <ArrowLeft size={16} /> Volver a productos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="rounded-sm overflow-hidden bg-hops-card border border-hops-border">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-80 md:h-full object-cover" />
          ) : (
            <div className="w-full h-80 flex items-center justify-center">
              <span className="text-8xl">🍺</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="badge bg-hops-green/10 text-hops-green mb-3 self-start">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-hops-white mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-hops-muted mb-6 leading-relaxed">{product.description}</p>
          )}

          <div className="text-3xl font-display text-hops-gold mb-8">
            {formatARS(product.price)}
          </div>

          {product.stock > 0 ? (
            <>
              {/* Cantidad */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-hops-muted uppercase tracking-wider">Cantidad</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 border border-hops-border rounded-sm flex items-center justify-center text-hops-white hover:border-hops-green transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-hops-white w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 border border-hops-border rounded-sm flex items-center justify-center text-hops-white hover:border-hops-green transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-hops-muted">{product.stock} disponibles</span>
              </div>

              <button onClick={handleAdd} className={`btn-primary flex items-center justify-center gap-2 ${added ? '!bg-hops-green-dark' : ''}`}>
                <ShoppingCart size={18} />
                {added ? '¡Agregado!' : 'Agregar al carrito'}
              </button>
            </>
          ) : (
            <div className="py-4 px-6 border border-hops-border rounded-sm text-hops-muted text-center uppercase tracking-wider text-sm">
              Sin stock disponible
            </div>
          )}

          <p className="text-xs text-hops-muted mt-6 uppercase tracking-widest">
            Prohibida la venta a menores de 18 años.
          </p>
        </div>
      </div>
    </div>
  )
}
