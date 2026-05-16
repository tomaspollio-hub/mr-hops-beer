import { useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/products/ProductCard'
import Spinner from '@/components/ui/Spinner'
import { useProducts } from '@/hooks/useProducts'
import { type ProductCategory } from '@/types'
import { cn } from '@/lib/utils'

const FILTERS: { label: string; value: ProductCategory | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Latas', value: 'lata' },
  { label: 'PET 1L', value: 'pet' },
  { label: 'Packs', value: 'pack' },
  { label: 'Accesorios', value: 'accesorio' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const activeCategory = (params.get('category') ?? 'all') as ProductCategory | 'all'

  const { products, loading, error } = useProducts(
    activeCategory !== 'all' ? activeCategory : undefined,
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Productos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() =>
              setParams(f.value === 'all' ? {} : { category: f.value })
            }
            className={cn(
              'px-4 py-2 text-sm font-bold uppercase tracking-wider border rounded-sm transition-colors',
              activeCategory === f.value
                ? 'bg-hops-green text-hops-black border-hops-green'
                : 'bg-transparent text-hops-muted border-hops-border hover:border-hops-green hover:text-hops-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      )}

      {error && (
        <p className="text-red-400 text-center py-12">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🍺</span>
          <p className="text-hops-muted">No hay productos en esta categoría todavía.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
