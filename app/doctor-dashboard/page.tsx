'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DoctorDashboard from '@/components/DoctorDashboard'
import ProtectedRoute from '../components/ProtectedRoute'

function DoctorDashboardPageContent() {
  const router = useRouter()
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [isLiveCamera, setIsLiveCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePatientsClick = () => {
    router.push('/doctor-dashboard/patients')
  }

  const handleAnalysisClick = () => {
    setShowAnalysisModal(true)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('File selected for analysis:', file.name)
      // Handle file upload for medical analysis here
      setShowAnalysisModal(false)
    }
  }

  const handleLiveCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsLiveCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsLiveCamera(false)
    }
  }

  const closeModal = () => {
    stopCamera()
    setShowAnalysisModal(false)
    setIsLiveCamera(false)
  }

  return (
    <DoctorDashboard>
      <div className="max-w-4xl mx-auto pt-60">
        <div className="text-center mb-0">
          <h1 className="text-3xl font-bold text-black mb-0">Medical Analysis Center</h1>
          <p className="text-lg text-gray-600 mb-0">Review patient data and analyze health impacts</p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={handlePatientsClick}
              className="bg-black text-white py-2 px-6 rounded-full text-base font-medium hover:bg-blue-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Patients
              </span>
              <div className="absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
            <button 
              onClick={handleAnalysisClick}
              className="bg-black text-white py-2 px-6 rounded-full text-base font-medium hover:bg-blue-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Medical Analysis
              </span>
              <div className="absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>
        </div>

        {/* Analysis Modal */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Medical Analysis</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isLiveCamera ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={stopCamera}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Stop Camera
                    </button>
                    <button
                      onClick={() => {
                        console.log('Medical image captured')
                        closeModal()
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Capture for Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Upload patient images or data for analysis</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleUploadClick}
                      className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Upload Medical Images</p>
                        <p className="text-xs text-gray-500">Select from files</p>
                      </div>
                    </button>

                    <button
                      onClick={handleLiveCameraClick}
                      className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Live Camera</p>
                        <p className="text-xs text-gray-500">Use device camera</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>
    </DoctorDashboard>
  )
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
      <DoctorDashboardPageContent />
    </ProtectedRoute>
  )
}
