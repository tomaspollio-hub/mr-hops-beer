import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, EyeOff, Eye, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { formatARS } from '@/lib/utils'
import { type Product, type ProductCategory } from '@/types'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  lata: 'Lata', pet: 'PET 1L', pack: 'Pack', barril: 'Barril', accesorio: 'Accesorio',
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<{ data: Product[] }>('/admin/products')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActive = async (p: Product) => {
    setToggling(p.id)
    try {
      await api.put(`/admin/products/${p.id}`, { active: !p.active })
      load()
    } finally {
      setToggling(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>}

      {!loading && (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className={`card flex items-center gap-4 ${!p.active ? 'opacity-50' : ''}`}>
              {/* Imagen */}
              <div className="w-12 h-12 shrink-0 rounded-sm bg-hops-border overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-hops-subtle" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-hops-white truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-hops-border text-hops-muted">{CATEGORY_LABEL[p.category]}</Badge>
                  <span className="text-xs text-hops-muted">Stock: {p.stock}</span>
                </div>
              </div>

              {/* Precio */}
              <span className="font-bold text-hops-gold shrink-0">{formatARS(p.price)}</span>

              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/productos/${p.id}/editar`}
                  className="p-2 text-hops-muted hover:text-hops-white transition-colors"
                  title="Editar"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => toggleActive(p)}
                  disabled={toggling === p.id}
                  className="p-2 text-hops-muted hover:text-hops-white transition-colors disabled:opacity-50"
                  title={p.active ? 'Desactivar' : 'Activar'}
                >
                  {p.active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
