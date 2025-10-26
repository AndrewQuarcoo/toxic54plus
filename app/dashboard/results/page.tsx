'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUserReports } from '@/app/services/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toxitrace-backendx.onrender.com'

interface Report {
  id: string
  original_input: string
  translated_input?: string
  input_language: string
  symptoms: string[]
  toxicity_likelihood: string
  possible_causes: string[]
  confidence_score: number
  ai_diagnosis: string
  ai_diagnosis_twi?: string
  location?: string
  region?: string
  status: string
  created_at: string
}

interface Image {
  id: string
  image_url: string
  image_type: string
  prediction: string
  prediction_twi?: string
  confidence: number
  toxicity_detected: boolean
  contaminant_type?: string
  location?: string
  region?: string
  created_at: string
}

function ResultsPageContent() {
  const { token } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'images'>('reports')
  const [selectedItem, setSelectedItem] = useState<Report | Image | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [token])

  const fetchHistory = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      
      // Fetch reports
      const reportsResponse = await fetch(`${API_BASE_URL}/reports/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        // Handle paginated response
        const reportsList = reportsData.reports || reportsData
        setReports(Array.isArray(reportsList) ? reportsList : [])
      }

      // Fetch images
      const imagesResponse = await fetch(`${API_BASE_URL}/images/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setImages(Array.isArray(imagesData) ? imagesData : [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getToxicityColor = (likelihood: string) => {
    switch (likelihood?.toUpperCase()) {
      case 'SEVERE':
        return 'text-red-600 bg-red-100'
      case 'MODERATE':
        return 'text-yellow-600 bg-yellow-100'
      case 'MILD':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Dashboard>
    )
  }

  const activeItems = activeTab === 'reports' ? reports : images
  const totalCount = reports.length + images.length

  return (
    <Dashboard>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">My Reports & Images</h1>
          <p className="text-gray-600">View and manage your toxicity detection history</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('reports')
              setSelectedItem(null)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Reports ({reports.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('images')
              setSelectedItem(null)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'images'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Images ({images.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-black">
                  {activeTab === 'reports' ? 'Symptom Reports' : 'Image Uploads'}
                </h2>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {activeItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No {activeTab} yet</p>
                    <p className="text-sm mt-1">
                      {activeTab === 'reports' 
                        ? 'Submit a symptom report to see results here' 
                        : 'Upload an image to see results here'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {activeItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedItem?.id === item.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        {activeTab === 'reports' ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor((item as Report).toxicity_likelihood)}`}>
                                {(item as Report).toxicity_likelihood || 'UNKNOWN'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-black line-clamp-2 mb-1">
                              {(item as Report).original_input}
                            </p>
                            {(item as Report).location && (
                              <p className="text-xs text-gray-600">{item.location}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{formatTimestamp(item.created_at)}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700 uppercase">{(item as Image).image_type}</span>
                              <span className={`text-xs px-2 py-1 rounded ${(item as Image).toxicity_detected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {(item as Image).toxicity_detected ? 'Risk Detected' : 'No Risk'}
                              </span>
                            </div>
                            {(item as Image).location && (
                              <p className="text-xs text-gray-600 mb-1">{item.location}</p>
                            )}
                            <p className="text-xs text-gray-500">{formatTimestamp(item.created_at)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {activeTab === 'reports' && (selectedItem as Report) ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-black">Report Details</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getToxicityColor(selectedItem.toxicity_likelihood)}`}>
                          {selectedItem.toxicity_likelihood}
                        </span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Original Input</label>
                          <p className="text-black mt-1">{selectedItem.original_input}</p>
                        </div>
                        
                        {selectedItem.translated_input && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Translated (English)</label>
                            <p className="text-black mt-1">{selectedItem.translated_input}</p>
                          </div>
                        )}

                        {selectedItem.symptoms && selectedItem.symptoms.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Symptoms Detected</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedItem.symptoms.map((symptom, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {selectedItem.location && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Location</label>
                              <p className="text-black">{selectedItem.location}</p>
                            </div>
                          )}
                          {selectedItem.region && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Region</label>
                              <p className="text-black">{selectedItem.region}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Confidence</label>
                            <p className="text-black">{(selectedItem.confidence_score * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <p className="text-black capitalize">{selectedItem.status}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">AI Diagnosis</label>
                          <p className="text-black mt-1">{selectedItem.ai_diagnosis}</p>
                        </div>

                        {selectedItem.ai_diagnosis_twi && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">AI Diagnosis (Twi)</label>
                            <p className="text-black mt-1">{selectedItem.ai_diagnosis_twi}</p>
                          </div>
                        )}

                        {selectedItem.possible_causes && selectedItem.possible_causes.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Possible Causes</label>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              {selectedItem.possible_causes.map((cause, idx) => (
                                <li key={idx} className="text-black">{cause}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : selectedItem && (selectedItem as Image) ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-black">Image Analysis</h3>
                        <span className={`text-sm px-3 py-1 rounded ${selectedItem.toxicity_detected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {selectedItem.toxicity_detected ? 'Risk Detected' : 'No Risk'}
                        </span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Image Type</label>
                          <p className="text-black">{selectedItem.image_type}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Analysis Result</label>
                          <p className="text-black mt-1">{selectedItem.prediction}</p>
                        </div>

                        {selectedItem.prediction_twi && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Analysis Result (Twi)</label>
                            <p className="text-black mt-1">{selectedItem.prediction_twi}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {selectedItem.location && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Location</label>
                              <p className="text-black">{selectedItem.location}</p>
                            </div>
                          )}
                          {selectedItem.region && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Region</label>
                              <p className="text-black">{selectedItem.region}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Confidence</label>
                            <p className="text-black">{(selectedItem.confidence * 100).toFixed(1)}%</p>
                          </div>
                          {selectedItem.contaminant_type && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Contaminant</label>
                              <p className="text-black capitalize">{selectedItem.contaminant_type}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Image URL</label>
                          <p className="text-blue-600 truncate">{selectedItem.image_url}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Item</h3>
                <p className="text-gray-500">Choose a {activeTab === 'reports' ? 'report' : 'image'} from the list to view detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  )
}

export default function ResultsPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
      <ResultsPageContent />
    </ProtectedRoute>
  )
}