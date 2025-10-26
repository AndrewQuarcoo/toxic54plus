'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'

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

  useEffect(() => {
    // Load sessions from localStorage
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

  return (
    <Dashboard>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">Processing Results</h1>
          <p className="text-gray-600">View and manage your galamsey detection processing sessions</p>
        </div>

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