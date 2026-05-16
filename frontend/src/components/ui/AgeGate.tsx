import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'age_verified'

export default function AgeGate() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  const deny = () => {
    navigate('/edad-bloqueada', { replace: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hops-black/95 backdrop-blur-sm p-4">
      <div className="bg-hops-card border border-hops-border rounded-sm p-8 max-w-sm w-full text-center">
        {/* Mascota placeholder — reemplazar con imagen real */}
        <div className="w-24 h-24 mx-auto mb-6 bg-hops-green/10 border border-hops-green/30 rounded-full flex items-center justify-center">
          <span className="text-5xl">🍺</span>
        </div>

        <h1 className="font-display text-2xl uppercase tracking-wider text-hops-white mb-2">
          Mr. Hops Beer
        </h1>
        <p className="text-hops-muted text-sm mb-8">
          Para ingresar debés confirmar que tenés 18 años o más.
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={accept} className="btn-primary w-full">
            Sí, soy mayor de 18
          </button>
          <button onClick={deny} className="btn-secondary w-full">
            No, soy menor
          </button>
        </div>

        <p className="text-xs text-hops-muted mt-6 uppercase tracking-widest">
          Beber con moderación. Prohibida la venta a menores de 18 años.
        </p>
      </div>
    </div>
  )
}
