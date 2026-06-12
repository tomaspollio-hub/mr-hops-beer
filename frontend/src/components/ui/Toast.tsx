import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

const TYPE_CONFIG = {
  success: {
    icon:      CheckCircle2,
    classes:   'border-hops-success/30 text-hops-white bg-hops-card',
    iconClass: 'text-hops-success',
  },
  error: {
    icon:      AlertCircle,
    classes:   'border-hops-error/30 text-hops-error bg-hops-error/8',
    iconClass: 'text-hops-error',
  },
  info: {
    icon:      Info,
    classes:   'border-hops-gold/30 text-hops-white bg-hops-card',
    iconClass: 'text-hops-gold',
  },
}

export default function ToastContainer() {
  const { toasts, exiting, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => {
        const { icon: Icon, classes, iconClass } = TYPE_CONFIG[t.type]
        const isExiting = exiting.includes(t.id)
        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3.5
              border rounded-xl text-sm font-medium max-w-xs
              shadow-2xl shadow-black/60
              ${isExiting ? 'toast-exit' : 'toast-enter'}
              ${classes}
            `}
          >
            <Icon size={16} className={`shrink-0 ${iconClass}`} />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity ml-1 rounded p-0.5 hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
