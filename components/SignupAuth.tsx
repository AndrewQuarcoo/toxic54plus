'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { useAuth } from '@/app/contexts/AuthContext'

export default function SignupAuth() {
  const isMobile = useIsMobile()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
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
    
    // Store signup data temporarily and go to onboarding
    const signupData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      full_name: `${formData.firstName} ${formData.lastName}`,
      username: formData.firstName.toLowerCase()
    }
    
    // Store in sessionStorage (temporary, will be cleared after registration)
    sessionStorage.setItem('pendingSignup', JSON.stringify(signupData))
    
    // Navigate to onboarding
    window.location.href = '/onboarding'
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
            <h2 className={`font-bold text-black mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Create your account
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Fill in the details below to get started
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
            {/* Name Fields */}
            <div className={isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isMobile ? 'py-2.5 px-3 text-sm' : 'py-3 px-4'
                  }`}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isMobile ? 'py-2.5 px-3 text-sm' : 'py-3 px-4'
                  }`}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

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
                className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
                className={`w-full bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isMobile ? 'py-2.5 px-3 text-sm' : 'py-3 px-4'
                }`}
                placeholder="Enter password"
                required
              />
              <p className="mt-1 text-gray-500" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                Must be at least 8 characters
              </p>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white rounded-full font-medium hover:bg-green-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${
                isMobile ? 'py-2.5 text-sm' : 'py-3'
              }`}
            >
                     <span className="relative z-10">
                       Next
                     </span>
              <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </form>

          {/* Login Link */}
          <p className={`text-center text-gray-600 ${isMobile ? 'mt-4 text-xs' : 'mt-6 text-sm'}`}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-green-500 hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
