export default function AgeBlocked() {
  return (
    <div className="min-h-screen bg-hops-black flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
          <span className="text-4xl">🚫</span>
        </div>

        <h1 className="font-display text-3xl uppercase tracking-wider text-hops-white mb-4">
          Acceso restringido
        </h1>

        <p className="text-hops-muted mb-6">
          El acceso a este sitio está reservado a personas mayores de 18 años.
        </p>

        <p className="text-xs text-hops-muted uppercase tracking-widest">
          BEBER CON MODERACIÓN. PROHIBIDA LA VENTA A MENORES DE 18 AÑOS.
        </p>
      </div>
    </div>
  )
}
