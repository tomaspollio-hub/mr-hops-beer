import { useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { type User } from '@/types'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// Google One Tap (prompt) is silently blocked by Brave and some Firefox configs.
// Solution: pre-render a hidden Google button using renderButton() which opens a
// real popup window instead of an overlay. Since we click it synchronously inside
// the user-gesture handler, Brave's popup blocker allows it.

export function useGoogleAuth() {
  const { setAuth } = useAuthStore()
  const resolveRef   = useRef<((v: { ok: boolean; role: string }) => void) | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const readyRef     = useRef(false)

  useEffect(() => {
    const init = () => {
      if (readyRef.current) return
      readyRef.current = true

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const res = await api.post<{ data: User; token: string }>('/auth/google', { credential })
            setAuth(res.data, res.token)
            resolveRef.current?.({ ok: true, role: res.data.role ?? 'customer' })
          } catch {
            resolveRef.current?.({ ok: false, role: '' })
          }
          resolveRef.current = null
        },
      })

      // Pre-render a hidden Google button (popup mode, Brave-compatible)
      const container = document.createElement('div')
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:220px;height:50px;overflow:hidden;'
      document.body.appendChild(container)
      containerRef.current = container

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
      })
    }

    if (window.google) {
      init()
    } else {
      // GSI script loads async — poll until ready
      const timer = setInterval(() => {
        if (window.google) { clearInterval(timer); init() }
      }, 150)
      return () => clearInterval(timer)
    }

    return () => { containerRef.current?.remove() }
  }, [setAuth])

  const loginWithGoogle = (): Promise<{ ok: boolean; role: string }> => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve({ ok: false, role: '' })
        return
      }

      resolveRef.current = resolve

      // Click the pre-rendered Google button synchronously (preserves user-gesture context)
      const btn = containerRef.current?.querySelector('[role="button"]') as HTMLElement | null
      if (btn) {
        btn.click()
      } else {
        // Button not ready yet — fallback to One Tap
        window.google.accounts.id.prompt(n => {
          if (n.isNotDisplayed() || n.isSkippedMoment()) {
            resolveRef.current = null
            resolve({ ok: false, role: '' })
          }
        })
      }
    })
  }

  return { loginWithGoogle }
}
