'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  redirectPath?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['user'],
  redirectPath = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push(redirectPath)
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(redirectPath)
        return
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectPath, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

