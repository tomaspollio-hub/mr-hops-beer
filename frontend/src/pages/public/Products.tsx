import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, PackageOpen } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import Spinner from '@/components/ui/Spinner'
import { useProducts } from '@/hooks/useProducts'
import { type ProductCategory } from '@/types'
import { cn } from '@/lib/utils'

const FILTERS: { label: string; value: ProductCategory | 'all' }[] = [
  { label: 'Todos',      value: 'all' },
  { label: 'Latas',      value: 'lata' },
  { label: 'PET 1L',     value: 'pet' },
  { label: 'Packs',      value: 'pack' },
  { label: 'Accesorios', value: 'accesorio' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const activeCategory      = (params.get('category') ?? 'all') as ProductCategory | 'all'
  const [search, setSearch] = useState('')
  const [gridVisible, setGridVisible] = useState(true)

  const { products, loading, error } = useProducts(
    activeCategory !== 'all' ? activeCategory : undefined,
  )

  // Fade grid out on category change, back in once loaded
  useEffect(() => {
    setGridVisible(false)
    const t = setTimeout(() => setGridVisible(true), 140)
    return () => clearTimeout(t)
  }, [activeCategory])

  useEffect(() => {
    if (!loading) setGridVisible(true)
  }, [loading])

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title mb-8">Productos</h1>

      {/* Búsqueda + filtros en una fila */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hops-subtle pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setParams(f.value === 'all' ? {} : { category: f.value })}
              className={cn(
                'filter-tab shrink-0',
                activeCategory === f.value ? 'filter-tab-active' : 'filter-tab-inactive',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="w-10 h-10" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-hops-error text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-hops-raised flex items-center justify-center mx-auto mb-5">
            <PackageOpen size={36} className="text-hops-subtle" />
          </div>
          <p className="text-hops-muted text-lg font-medium mb-1">
            {search ? `Sin resultados para "${search}"` : 'Sin productos en esta categoría'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-sm text-hops-green hover:text-hops-green-light transition-colors mt-2"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity duration-200',
            gridVisible ? 'opacity-100' : 'opacity-0',
          )}
        >
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
