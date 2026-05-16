import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

interface StockItem {
  id: string
  name: string
  category: string
  stock: number
}

const CATEGORY_LABEL: Record<string, string> = {
  lata: 'Lata', pet: 'PET 1L', pack: 'Pack', barril: 'Barril', accesorio: 'Accesorio',
}

export default function AdminStock() {
  const [items, setItems] = useState<StockItem[]>([])
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ data: StockItem[] }>('/admin/stock')
      .then(r => {
        setItems(r.data)
        const initial: Record<string, string> = {}
        r.data.forEach(i => { initial[i.id] = String(i.stock) })
        setEdits(initial)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (id: string) => {
    const newStock = parseInt(edits[id] ?? '0')
    if (isNaN(newStock) || newStock < 0) return
    setSaving(id)
    try {
      await api.patch(`/admin/stock/${id}`, { stock: newStock })
      setItems(prev => prev.map(i => i.id === id ? { ...i, stock: newStock } : i))
      setSaved(id)
      setTimeout(() => setSaved(null), 1500)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>

  // Agrupar por categoría
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, StockItem[]>)

  return (
    <div>
      <h1 className="section-title mb-2">Stock</h1>
      <p className="text-hops-muted text-sm mb-8">Actualizá el stock manualmente. Los cambios se guardan por producto.</p>

      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h2 className="text-xs text-hops-muted uppercase tracking-widest mb-3">
              {CATEGORY_LABEL[cat] ?? cat}
            </h2>
            <div className="space-y-2">
              {catItems.map(item => {
                const changed = edits[item.id] !== String(item.stock)
                const isSaving = saving === item.id
                const isSaved = saved === item.id

                return (
                  <div key={item.id} className="card flex items-center gap-4">
                    <p className="flex-1 text-hops-white text-sm font-medium truncate">{item.name}</p>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        value={edits[item.id] ?? '0'}
                        onChange={e => setEdits(prev => ({ ...prev, [item.id]: e.target.value }))}
                        min="0"
                        className="input-field w-20 text-center"
                      />
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={!changed || isSaving}
                        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-colors min-w-[80px]
                          ${isSaved ? 'border-hops-green bg-hops-green/10 text-hops-green' : changed ? 'btn-primary py-2' : 'border-hops-border text-hops-border cursor-default'}`}
                      >
                        {isSaving ? '...' : isSaved ? '✓ Guardado' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
