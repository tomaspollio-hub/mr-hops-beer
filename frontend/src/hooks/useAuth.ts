import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { type User } from '@/types'

interface AuthResponse {
  data: User
  token: string
}

export function useAuth() {
  const { setAuth, logout, user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password })
      setAuth(res.data, res.token)
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<AuthResponse>('/auth/register', { name, email, password, phone })
      setAuth(res.data, res.token)
      return true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { login, register, logout, user, isAuthenticated, loading, error }
}
