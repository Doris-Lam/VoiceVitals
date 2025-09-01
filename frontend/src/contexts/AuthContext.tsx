'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  _id: string
  name: string
  email: string
  role: string
  healthProfile?: {
    dateOfBirth?: Date
    gender?: string
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
  preferences?: {
    notifications: {
      email: boolean
      push: boolean
    }
    privacy: {
      shareData: boolean
      allowAnalytics: boolean
    }
  }
  lastLogin?: Date
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const clearError = () => setError(null)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only run on client side
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token')
          if (storedToken) {
            setToken(storedToken)
            await getCurrentUser(storedToken)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const getCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      } else {
        throw new Error('Failed to get user data')
      }
    } catch (error) {
      console.error('Get current user failed:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.data.user)
        setToken(data.token)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
        }
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, confirmPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.data.user)
        setToken(data.token)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
        }
      } else {
        throw new Error(data.message || 'Signup failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      setUser(null)
      setToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE}/api/auth/updateMe`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.data.user)
      } else {
        throw new Error(data.message || 'Update failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    updateUser,
    loading,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
