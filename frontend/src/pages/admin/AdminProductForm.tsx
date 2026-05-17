import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { api } from '@/lib/api'
import { type Product, type ProductCategory } from '@/types'
import Spinner from '@/components/ui/Spinner'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'lata', label: 'Lata' },
  { value: 'pet', label: 'PET 1L' },
  { value: 'pack', label: 'Pack' },
  { value: 'barril', label: 'Barril' },
  { value: 'accesorio', label: 'Accesorio' },
]

export default function AdminProductForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProductCategory>('lata')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get<{ data: Product }>(`/admin/products`)
      .then(() => {
        // Cargamos el listado y buscamos el producto
        api.get<{ data: Product[] }>('/admin/products').then(r => {
          const p = r.data.find(x => x.id === id)
          if (!p) return
          setName(p.name)
          setDescription(p.description ?? '')
          setCategory(p.category)
          setPrice(String(p.price))
          setComparePrice(p.compare_price ? String(p.compare_price) : '')
          setSku(p.sku ?? '')
          setStock(String(p.stock))
          setImageUrl(p.image_url ?? '')
          setImagePreview(p.image_url ?? '')
        })
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleImageUpload = async (file: File) => {
    if (!id && !isEdit) {
      // En nuevo producto, primero creamos el producto para tener el ID
      setError('Guardá el producto primero, luego subí la imagen.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('product_id', id ?? 'temp')

      const res = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body: formData,
      })
      if (!res.ok) throw new Error('Error al subir la imagen')
      const data = await res.json() as { data: { url: string } }
      setImageUrl(data.data.url)
      setImagePreview(data.data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return setError('Nombre y precio son requeridos')
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name,
        description: description || undefined,
        category,
        price: parseFloat(price),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku || null,
        stock: parseInt(stock),
        image_url: imageUrl || undefined,
      }
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      navigate('/admin/productos')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/productos" className="text-hops-muted hover:text-hops-white text-sm">← Productos</Link>
        <h1 className="section-title">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Imagen */}
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-2">Imagen</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-hops-border rounded-sm flex items-center justify-center cursor-pointer hover:border-hops-green/50 transition-colors relative overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                {uploading ? <Spinner className="mx-auto" /> : <Upload size={24} className="mx-auto text-hops-muted mb-2" />}
                <p className="text-xs text-hops-muted">{uploading ? 'Subiendo...' : 'Click para subir imagen'}</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Nombre *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="input-field" placeholder="Nombre del producto" />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-field resize-none" placeholder="Descripción opcional..." />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Categoría *</label>
          <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className="input-field">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Precio, Precio anterior y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Precio (ARS) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="1" className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Precio anterior (tachado)</label>
            <input type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)} min="0" step="1" className="input-field" placeholder="0 = sin oferta" />
          </div>
        </div>

        {/* SKU y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">SKU</label>
            <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="input-field font-mono" placeholder="MH-001" />
          </div>
          <div>
            <label className="block text-xs text-hops-muted uppercase tracking-wider mb-1">Stock</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" step="1" className="input-field" placeholder="0" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
            {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link to="/admin/productos" className="btn-secondary px-4">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
