'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { getUserReports, getUserImages, type Report, type Image } from '@/app/services/api'

interface ProcessingSession {
  id: string
  timestamp: Date
  status: 'completed' | 'processing' | 'failed'
  method: string
  region?: string
  results?: {
    sites: any[]
    totalArea: number
    activeSites: number
    inactiveSites: number
    rehabilitatedSites: number
    averageConfidence: number
  }
  processingTime?: number
  error?: string
}

function ResultsPageContent() {
  const [sessions, setSessions] = useState<ProcessingSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ProcessingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [activeTab, setActiveTab] = useState<'galamsey' | 'reports' | 'images'>('reports')
  const [loadingReports, setLoadingReports] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)

  useEffect(() => {
    // Load galamsey sessions from localStorage
    const loadSessions = () => {
      try {
        const storedSessions = localStorage.getItem('galamsey-processing-sessions')
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
            ...session,
            timestamp: new Date(session.timestamp)
          }))
          setSessions(parsedSessions.sort((a: ProcessingSession, b: ProcessingSession) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          ))
        }
      } catch (error) {
        console.error('Error loading sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()

    // Listen for new sessions from other pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'galamsey-processing-sessions') {
        loadSessions()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    // Load user reports from API
    const fetchReports = async () => {
      setLoadingReports(true)
      try {
        const data = await getUserReports()
        setReports(data)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoadingReports(false)
      }
    }

    fetchReports()
  }, [])

  useEffect(() => {
    // Load user images from API
    const fetchImages = async () => {
      setLoadingImages(true)
      try {
        const data = await getUserImages()
        setImages(data)
      } catch (error) {
        console.error('Failed to fetch images:', error)
      } finally {
        setLoadingImages(false)
      }
    }

    fetchImages()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'processing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId)
    setSessions(updatedSessions)
    localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessions))
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null)
    }
  }

  const clearAllSessions = () => {
    setSessions([])
    localStorage.removeItem('galamsey-processing-sessions')
    setSelectedSession(null)
  }

  if (loading || loadingReports || loadingImages) {
    return (
      <Dashboard>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading your results...</p>
            </div>
          </div>
        </div>
      </Dashboard>
    )
  }

  const getToxicityBadge = (level: string) => {
    const colors = {
      'NONE': 'bg-gray-100 text-gray-800',
      'LOW': 'bg-green-100 text-green-800',
      'MODERATE': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    )
  }

  return (
    <Dashboard>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">My Results</h1>
          <p className="text-gray-600">View all your symptom reports, image analyses, and galamsey detection results</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'reports'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Symptom Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'images'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Analyses ({images.length})
              </button>
              <button
                onClick={() => setActiveTab('galamsey')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'galamsey'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Galamsey Detection ({sessions.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {loadingReports ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No symptom reports yet</p>
                    <p className="text-sm mt-1">Start a chat to submit your first symptom report</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getToxicityBadge(report.toxicity_level)}
                              <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded capitalize">
                                {report.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Symptoms:</strong> {report.symptoms}
                            </p>
                            {report.translated_text && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Translation:</strong> {report.translated_text}
                              </p>
                            )}
                            {report.reasoning && (
                              <p className="text-sm text-gray-900 mb-2">
                                <strong>Analysis:</strong> {report.reasoning}
                              </p>
                            )}
                            {report.suspected_chemicals && report.suspected_chemicals.length > 0 && (
                              <p className="text-sm text-orange-600 mb-1">
                                <strong>Suspected Chemicals:</strong> {report.suspected_chemicals.join(', ')}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📍 {report.location || 'No location'}</span>
                              <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                              <span>🎯 Confidence: {(report.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {loadingImages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No image analyses yet</p>
                    <p className="text-sm mt-1">Upload an image to start analysis</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              image.toxicity_detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {image.toxicity_detected ? 'Toxicity Detected' : 'No Toxicity'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-1 font-medium">{image.prediction}</p>
                          {image.contaminant_type && (
                            <p className="text-xs text-gray-600 mb-1">
                              Contaminant: {image.contaminant_type}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>Confidence: {(image.confidence * 100).toFixed(0)}%</span>
                            <span>{new Date(image.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Galamsey Tab - Existing Code */}
          {activeTab === 'galamsey' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Processing Sessions</h2>
                {sessions.length > 0 && (
                  <button
                    onClick={clearAllSessions}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No processing sessions yet</p>
                    <p className="text-sm mt-1">Run detection on the Maps page to see results here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSession?.id === session.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="ml-1 capitalize">{session.status}</span>
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-black">{session.method}</p>
                          {session.region && <p>Region: {session.region}</p>}
                          <p className="text-xs text-gray-500 mt-1">{formatTimestamp(session.timestamp)}</p>
                          {session.processingTime && (
                            <p className="text-xs text-gray-500">Processing time: {session.processingTime}s</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-black">Session Details</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSession.status)}`}>
                      {getStatusIcon(selectedSession.status)}
                      <span className="ml-2 capitalize">{selectedSession.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Detection Method</label>
                      <p className="text-black">{selectedSession.method}</p>
                    </div>
                    {selectedSession.region && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Region</label>
                        <p className="text-black">{selectedSession.region}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="text-black">{selectedSession.timestamp.toLocaleString()}</p>
                    </div>
                    {selectedSession.processingTime && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Processing Time</label>
                        <p className="text-black">{selectedSession.processingTime} seconds</p>
                      </div>
                    )}
                  </div>

                  {selectedSession.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Error Details</h4>
                      <p className="text-sm text-red-700">{selectedSession.error}</p>
                    </div>
                  )}

                  {selectedSession.results && (
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-4">Detection Results</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{selectedSession.results.activeSites}</div>
                          <div className="text-sm text-gray-600">Active Sites</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{selectedSession.results.inactiveSites}</div>
                          <div className="text-sm text-gray-600">Inactive Sites</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedSession.results.rehabilitatedSites}</div>
                          <div className="text-sm text-gray-600">Rehabilitated Sites</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedSession.results.totalArea.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Total Area (km²)</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Average Confidence</span>
                          <span className="text-lg font-bold text-purple-600">
                            {(selectedSession.results.averageConfidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Session</h3>
                <p className="text-gray-500">Choose a processing session from the list to view detailed results</p>
              </div>
            )}
          </div>
        </div>
          )}
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