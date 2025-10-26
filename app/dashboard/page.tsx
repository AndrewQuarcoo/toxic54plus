'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Dashboard from '@/components/Dashboard'
import ProtectedRoute from '../components/ProtectedRoute'

function DashboardPageContent() {
  const router = useRouter()
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [isLiveCamera, setIsLiveCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChatClick = () => {
    router.push('/dashboard/chat')
  }

  const handleCaptureClick = () => {
    setShowCaptureModal(true)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
      setShowCaptureModal(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return
    
    try {
      setIsProcessing(true)
      
      // Import API function dynamically to avoid issues
      const { uploadImage, createChatSession } = await import('@/app/services/api')
      
      // Upload image
      const image = await uploadImage(selectedFile, 'Health check evidence')
      console.log('Image uploaded successfully:', image)
      
      // Create chat session with the image ID
      const session = await createChatSession('image', image.id)
      console.log('Chat session created:', session)
      
      // Show success toast
      toast.success('Image uploaded successfully!', {
        description: 'Redirecting to chat...',
      })
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      
      // Navigate to chat with session ID
      router.push(`/dashboard/chat?sessionId=${session.id}`)
      
    } catch (error) {
      console.error('Failed to process image:', error)
      toast.error('Failed to process image', {
        description: 'Please try again or select a different image.',
      })
      setIsProcessing(false)
    }
  }

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
    // Reset file input so user can select the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLiveCameraClick = async () => {
    try {
      // First, set isLiveCamera to true so the video element renders
      setIsLiveCamera(true)
      
      // Wait for the next tick so the video element is in the DOM
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video starts playing
        videoRef.current.play().catch(err => console.error('Error playing video:', err))
        console.log('Camera started successfully')
      } else {
        console.error('videoRef.current is still null after timeout')
        setIsLiveCamera(false)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Camera access denied', {
        description: 'Please check your camera permissions and try again.',
      })
      setIsLiveCamera(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context?.drawImage(video, 0, 0)

    // Convert canvas to blob and create File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const url = URL.createObjectURL(blob)
        
        setSelectedFile(file)
        setPreviewUrl(url)
        
        // Stop camera
        stopCamera()
        // Close capture modal
        setShowCaptureModal(false)
      }
    }, 'image/jpeg', 0.95)
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
    setShowCaptureModal(false)
    setIsLiveCamera(false)
  }

  const closePreviewModal = () => {
    handleCancelPreview()
  }

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Dashboard>
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Check if you have been affected?</h1>
              <p className="text-base md:text-lg text-gray-600 mb-6">Monitor your health and performance metrics</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button 
                  onClick={handleChatClick}
                  className="bg-black text-white py-3 px-6 rounded-full text-base font-medium hover:bg-green-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </span>
                  <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
                <button 
                  onClick={handleCaptureClick}
                  className="bg-black text-white py-3 px-6 rounded-full text-base font-medium hover:bg-green-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capture
                  </span>
                  <div className="absolute inset-0 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewUrl && !isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Review Your Image</h3>
                <button
                  onClick={closePreviewModal}
                  className="text-gray-400 hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative w-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg object-contain max-h-[60vh]"
                  />
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">File:</span> {selectedFile.name}</p>
                    <p><span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelPreview}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Upload & Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Processing Image</h3>
                <p className="text-gray-600">Please wait while we analyze your image...</p>
              </div>
            </div>
          </div>
        )}

        {/* Capture Modal */}
        {showCaptureModal && !isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Capture Image</h3>
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
                  {/* Video Preview - matching image preview style */}
                  <div className="relative w-full bg-black rounded-lg min-h-[300px] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg max-h-[60vh]"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                    />
                  </div>
                  
                  {/* Capture Controls */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={stopCamera}
                      className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Take Photo
                    </button>
                  </div>
                  
                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Choose how you want to capture an image</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleUploadClick}
                      className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Upload from Gallery</p>
                        <p className="text-xs text-gray-500">Select from camera roll</p>
                      </div>
                    </button>

                    <button
                      onClick={handleLiveCameraClick}
                      className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
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
    </Dashboard>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
      <DashboardPageContent />
    </ProtectedRoute>
  )
}