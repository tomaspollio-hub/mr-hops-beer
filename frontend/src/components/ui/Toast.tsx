import { X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

const TYPE_STYLES = {
  success: 'border-hops-green text-hops-green bg-hops-green/10',
  error:   'border-red-500 text-red-400 bg-red-500/10',
  info:    'border-hops-gold text-hops-gold bg-hops-gold/10',
}

const TYPE_ICON = {
  success: '✓',
  error:   '✕',
  info:    'i',
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 border text-sm font-medium
            max-w-xs shadow-lg toast-enter ${TYPE_STYLES[t.type]}`}
        >
          <span className="font-bold text-base leading-none">{TYPE_ICON[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
