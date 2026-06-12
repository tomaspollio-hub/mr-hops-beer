import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastStore {
  toasts:  Toast[]
  exiting: string[]
  show:    (message: string, type?: Toast['type']) => void
  dismiss: (id: string) => void
}

const VISIBLE_MS  = 3500
const EXIT_MS     = 300

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts:  [],
  exiting: [],

  show: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))

    // Start exit animation before removal
    setTimeout(() => {
      if (get().toasts.some(t => t.id === id)) {
        set(s => ({ exiting: [...s.exiting, id] }))
      }
    }, VISIBLE_MS - EXIT_MS)

    // Remove from store
    setTimeout(() => {
      set(s => ({
        toasts:  s.toasts.filter(t => t.id !== id),
        exiting: s.exiting.filter(e => e !== id),
      }))
    }, VISIBLE_MS)
  },

  dismiss: (id) => {
    set(s => ({ exiting: [...s.exiting, id] }))
    setTimeout(() => {
      set(s => ({
        toasts:  s.toasts.filter(t => t.id !== id),
        exiting: s.exiting.filter(e => e !== id),
      }))
    }, EXIT_MS)
  },
}))
