'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone_number?: string
  role: 'user' | 'epa_admin' | 'health_admin' | 'super_admin'
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, role?: 'doctor' | 'epa') => Promise<void>
  register: (formData: any) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Base URL for API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toxitrace-backendx.onrender.com'

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role?: 'doctor' | 'epa') => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Check role-based access
      if (role === 'doctor' && !['health_admin', 'super_admin'].includes(data.user.role)) {
        throw new Error('Access denied: Doctor dashboard requires health_admin or super_admin role')
      }
      if (role === 'epa' && !['epa_admin', 'super_admin'].includes(data.user.role)) {
        throw new Error('Access denied: EPA dashboard requires epa_admin or super_admin role')
      }

      setToken(data.access_token)
      setUser(data.user)
      
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on role
      if (role === 'doctor') {
        router.push('/doctor-dashboard')
      } else if (role === 'epa') {
        router.push('/epa-dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData: any) => {
    setLoading(true)
    try {
      // Build request body with all provided fields
      const requestBody: any = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name
      }
      
      // Add phone_number if provided
      if (formData.phone_number) {
        requestBody.phone_number = formData.phone_number
      }
      
      // Add name field if provided (backend expects this)
      if (formData.name) {
        requestBody.name = formData.name
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Registration error:', errorData)
        throw new Error(errorData.detail || errorData.msg || 'Registration failed')
      }

      const data = await response.json()
      setToken(data.access_token)
      setUser(data.user)
      
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on flow
      if (formData.skipOnboarding) {
        router.push('/dashboard')
      } else {
        // This will be handled by the calling component now
        // No redirect here since onboarding handles it
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!user && !!token,
      loading
    }}>
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

