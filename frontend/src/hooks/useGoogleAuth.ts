import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { type User } from '@/types'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

export function useGoogleAuth() {
  const { setAuth } = useAuthStore()

  const loginWithGoogle = (): Promise<{ ok: boolean; role: string }> => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve({ ok: false, role: '' })
        return
      }
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const res = await api.post<{ data: User; token: string }>('/auth/google', { credential })
            setAuth(res.data, res.token)
            resolve({ ok: true, role: res.data.role ?? 'customer' })
          } catch {
            resolve({ ok: false, role: '' })
          }
        },
      })
      window.google.accounts.id.prompt()
    })
  }

  return { loginWithGoogle }
}
