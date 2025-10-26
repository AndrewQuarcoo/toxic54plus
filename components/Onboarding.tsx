'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useIsMobile } from '@/app/hooks/use-mobile'

export default function Onboarding() {
  const isMobile = useIsMobile()
  const [formData, setFormData] = useState({
    location: '',
    phoneNumber: '',
    gpsEnabled: false
  })
  const [locationError, setLocationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value || ''
    }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          location: `${latitude}, ${longitude}`,
          gpsEnabled: true
        }))
        setIsLoading(false)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. '
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        setLocationError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.location) {
      setLocationError('Location is required. Please use GPS to get your location.')
      return
    }
    
    if (!formData.phoneNumber) {
      alert('Phone number is required.')
      return
    }
    
    if (!formData.gpsEnabled) {
      alert('GPS permission is required to continue.')
      return
    }
    
    console.log('Onboarding form submitted:', formData)
    // Handle form submission here
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Back to Home Link */}
      <Link
        href="/"
        className={`absolute text-white hover:text-gray-300 transition-colors z-20 ${
          isMobile ? 'top-4 left-4 text-sm' : 'top-6 left-6'
        }`}
      >
        ← Back to Home
      </Link>
      
      <div className={`w-full relative z-10 ${isMobile ? 'max-w-sm px-2' : 'max-w-4xl'}`}>
        <div className={`bg-white rounded-3xl shadow-lg ${isMobile ? 'p-6' : 'p-12'}`}>
          {/* Header */}
          <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
            <h2 className={`font-bold text-black mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              Complete Your Profile
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Help us personalize your experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={isMobile ? 'space-y-5' : 'space-y-8'}>
            {/* Location Field */}
            <div>
              <label className={`block font-medium text-gray-700 mb-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                Location <span className="text-red-500">*</span>
              </label>
              <div className={isMobile ? 'flex flex-col gap-2' : 'flex gap-3'}>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`flex-1 bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isMobile ? 'py-2.5 px-3 text-sm' : 'py-4 px-5 text-lg'
                  }`}
                  placeholder="Your location coordinates"
                  readOnly
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className={`bg-green-500 text-white px-6 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isMobile ? 'py-2.5 text-sm' : 'py-4 text-lg'
                  }`}
                >
                  {isLoading ? 'Getting...' : 'Get GPS'}
                </button>
              </div>
              {locationError && (
                <p className={`mt-2 text-red-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>{locationError}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className={`block font-medium text-gray-700 mb-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className="phone-input"
                style={{
                  '--PhoneInputCountryFlag-height': isMobile ? '1.2em' : '1.5em',
                  '--PhoneInputCountrySelectArrow-color': '#10b981',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              />
              <p className={`mt-2 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                We'll use this for important updates
              </p>
            </div>

            {/* GPS Permission Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="gpsEnabled"
                checked={formData.gpsEnabled}
                onChange={handleInputChange}
                className={`mt-1 bg-gray-50 border border-gray-300 rounded text-green-500 focus:ring-green-500 focus:ring-2 ${
                  isMobile ? 'w-4 h-4' : 'w-5 h-5'
                }`}
                required
              />
              <label className={`text-gray-600 ${isMobile ? 'ml-2 text-xs' : 'ml-3 text-base'}`}>
                I allow GPS location tracking for personalized recommendations <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-black text-white rounded-full font-medium hover:bg-green-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isMobile ? 'py-2.5 text-sm' : 'py-4 text-lg'
              }`}
            >
              <span className="relative z-10">Complete Setup</span>
              <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
