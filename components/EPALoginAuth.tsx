'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { useAuth } from '@/app/contexts/AuthContext'

export default function EPALoginAuth() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(formData.email, formData.password, 'epa')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/loginsignbackground.jpg)',
          opacity: 0.3
        }}
      />
      
      {/* Back to Home Link */}
      <Link
        href="/"
        className={`absolute text-white hover:text-gray-300 transition-colors z-20 ${
          isMobile ? 'top-4 left-4 text-sm' : 'top-6 left-6'
        }`}
      >
        ← Back to Home
      </Link>
      
      <div className={`w-full relative z-10 ${isMobile ? 'max-w-sm px-2' : 'max-w-md'}`}>
        <div className={`bg-white rounded-3xl shadow-lg ${isMobile ? 'p-6' : 'p-8'}`}>
          {/* Header */}
          <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className={`font-bold text-black mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              EPA Portal
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Sign in to access environmental monitoring center
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-6'}>
            {/* Email Field */}
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  isMobile ? 'py-2.5 px-3 text-sm' : 'py-3 px-4'
                }`}
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  isMobile ? 'py-2.5 px-3 text-sm' : 'py-3 px-4'
                }`}
                placeholder="Enter password"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                className="w-4 h-4 bg-gray-50 border border-gray-300 rounded text-orange-500 focus:ring-orange-500 focus:ring-2"
              />
              <label className={`ml-2 text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white rounded-full font-medium hover:bg-orange-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 ${
                isMobile ? 'py-2.5 text-sm' : 'py-3'
              }`}
            >
              <span className="relative z-10">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </span>
              <div className="absolute inset-0 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </form>

          {/* Info */}
          <p className={`text-center text-gray-600 mt-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Requires epa_admin or super_admin role
          </p>
        </div>
      </div>
    </div>
  )
}

