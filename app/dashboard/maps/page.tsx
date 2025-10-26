'use client'

import Dashboard from '@/components/Dashboard'
import GalamseyDetectionMap from '@/components/GalamseyDetectionMap'
import { galamseyDetectionService, GalamseySite, DetectionResult } from '@/services/galamseyDetectionService'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/app/hooks/use-mobile'
import ProtectedRoute from '@/app/components/ProtectedRoute'

function MapsPageContent() {
  const isMobile = useIsMobile()
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedSite, setSelectedSite] = useState<GalamseySite | null>(null)
  const [detectionMethod, setDetectionMethod] = useState<string>('combined')

  useEffect(() => {
    const fetchGalamseyData = async () => {
      setLoading(true)
      const startTime = Date.now()
      
      // Create a new processing session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newSession = {
        id: sessionId,
        timestamp: new Date(),
        status: 'processing' as const,
        method: `${detectionMethod}${selectedRegion !== 'all' ? ` (${selectedRegion})` : ''}`,
        region: selectedRegion !== 'all' ? selectedRegion : undefined
      }
      
      // Save processing session to localStorage
      const existingSessions = JSON.parse(localStorage.getItem('galamsey-processing-sessions') || '[]')
      const updatedSessions = [newSession, ...existingSessions]
      localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessions))
      
      try {
        // Use CERSGIS deep learning detection service
        const result = await galamseyDetectionService.detectGalamseySites(selectedRegion === 'all' ? undefined : selectedRegion)
        setDetectionResult(result)
        
        // Update session with results
        const processingTime = Math.round((Date.now() - startTime) / 1000)
        const completedSession = {
          ...newSession,
          status: 'completed' as const,
          results: {
            sites: result.sites,
            totalArea: result.totalArea,
            activeSites: result.activeSites,
            inactiveSites: result.inactiveSites,
            rehabilitatedSites: result.rehabilitatedSites,
            averageConfidence: result.averageConfidence
          },
          processingTime
        }
        
        // Update the session in localStorage
        const updatedSessionsWithResults = updatedSessions.map((session: any) => 
          session.id === sessionId ? completedSession : session
        )
        localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessionsWithResults))
        
      } catch (error) {
        console.error('Error detecting galamsey sites:', error)
        
        // Update session with error
        const failedSession = {
          ...newSession,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
        
        const updatedSessionsWithError = updatedSessions.map((session: any) => 
          session.id === sessionId ? failedSession : session
        )
        localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessionsWithError))
        
        // Fallback to empty result
        setDetectionResult({
          sites: [],
          totalArea: 0,
          activeSites: 0,
          inactiveSites: 0,
          rehabilitatedSites: 0,
          averageConfidence: 0,
          lastProcessed: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGalamseyData()
  }, [selectedRegion, detectionMethod])

  const handleSiteClick = (site: GalamseySite) => {
    setSelectedSite(site)
  }

  const handleRefresh = async () => {
    setLoading(true)
    const startTime = Date.now()
    
    // Create a new processing session for refresh
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSession = {
      id: sessionId,
      timestamp: new Date(),
      status: 'processing' as const,
      method: `${detectionMethod}${selectedRegion !== 'all' ? ` (${selectedRegion})` : ''} - Refresh`,
      region: selectedRegion !== 'all' ? selectedRegion : undefined
    }
    
    // Save processing session to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('galamsey-processing-sessions') || '[]')
    const updatedSessions = [newSession, ...existingSessions]
    localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessions))
    
    try {
      const result = await galamseyDetectionService.detectGalamseySites(selectedRegion === 'all' ? undefined : selectedRegion)
      setDetectionResult(result)
      
      // Update session with results
      const processingTime = Math.round((Date.now() - startTime) / 1000)
      const completedSession = {
        ...newSession,
        status: 'completed' as const,
        results: {
          sites: result.sites,
          totalArea: result.totalArea,
          activeSites: result.activeSites,
          inactiveSites: result.inactiveSites,
          rehabilitatedSites: result.rehabilitatedSites,
          averageConfidence: result.averageConfidence
        },
        processingTime
      }
      
      // Update the session in localStorage
      const updatedSessionsWithResults = updatedSessions.map((session: any) => 
        session.id === sessionId ? completedSession : session
      )
      localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessionsWithResults))
      
    } catch (error) {
      console.error('Error refreshing data:', error)
      
      // Update session with error
      const failedSession = {
        ...newSession,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      
      const updatedSessionsWithError = updatedSessions.map((session: any) => 
        session.id === sessionId ? failedSession : session
      )
      localStorage.setItem('galamsey-processing-sessions', JSON.stringify(updatedSessionsWithError))
    } finally {
      setLoading(false)
    }
  }

  const sites = detectionResult?.sites || []

  return (
    <Dashboard>
      <div className={`${isMobile ? 'w-full' : 'max-w-7xl'} mx-auto`}>
        {/* Header */}
        <div className={isMobile ? 'mb-4' : 'mb-6'}>
          <h1 className={`font-bold text-black ${isMobile ? 'text-xl mb-1' : 'text-3xl mb-2'}`}>CERSGIS Galamsey Detection Map</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>AI-powered detection using Sentinel-1 thresholding and U-Net deep learning</p>
        </div>

        {/* Controls */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3 mb-4' : 'p-4 mb-6'}`}>
          <div className={`flex flex-wrap items-center justify-between gap-4 ${isMobile ? 'flex-col' : ''}`}>
            <div className={`flex flex-wrap items-center gap-4 ${isMobile ? 'w-full flex-col' : ''}`}>
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                <label className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Region:</label>
                <select 
                  value={selectedRegion} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={`border border-gray-300 rounded-md ${isMobile ? 'px-2 py-1 text-xs flex-1' : 'px-3 py-1 text-sm'}`}
                >
                  <option value="all">All Regions</option>
                  <option value="Western">Western</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                </select>
              </div>
              
              <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                <label className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Method:</label>
                <select 
                  value={detectionMethod} 
                  onChange={(e) => setDetectionMethod(e.target.value)}
                  className={`border border-gray-300 rounded-md ${isMobile ? 'px-2 py-1 text-xs flex-1' : 'px-3 py-1 text-sm'}`}
                >
                  <option value="combined">Combined (Sentinel-1 + U-Net)</option>
                  <option value="sentinel-1">Sentinel-1 Thresholding</option>
                  <option value="unet">U-Net Deep Learning</option>
                </select>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'px-3 py-1 text-xs w-full' : 'px-3 py-1 text-sm'}`}
              >
                {loading ? 'Processing...' : 'Refresh Detection'}
              </button>
            </div>
            
            <div className={`flex items-center gap-4 ${isMobile ? 'w-full justify-center flex-wrap' : ''}`}>
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Active Sites</span>
              </div>
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Inactive Sites</span>
              </div>
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Rehabilitated Sites</span>
              </div>
            </div>
          </div>
          
          <div className={`${isMobile ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-gray-200`}>
            <div className={`flex flex-wrap items-center gap-4 text-gray-500 ${isMobile ? 'flex-col text-xs' : 'text-sm'}`}>
              <div className={isMobile ? 'text-center' : ''}>
                <strong>Methodology:</strong>
                <a href="https://github.com/CERSGIS/Small-Scale-Mining-Sites-Monitoring" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">CERSGIS Deep Learning</a>
                <span className="mx-1">•</span>
                <a href="https://servir.cersgis.org/map" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SERVIR West Africa</a>
              </div>
              <div className={isMobile ? 'text-xs' : 'text-xs'}>
                Last processed: {detectionResult?.lastProcessed ? new Date(detectionResult.lastProcessed).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-6'}`}>
          {loading ? (
            <div className={`flex items-center justify-center ${isMobile ? 'h-64' : 'h-96'}`}>
              <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-gray-900 mx-auto mb-2 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}></div>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Running AI detection algorithms...</p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Processing Sentinel-1 and Planet NICFI imagery</p>
              </div>
            </div>
          ) : (
            <GalamseyDetectionMap
              sites={sites}
              selectedRegion={selectedRegion}
              onSiteClick={handleSiteClick}
            />
          )}
        </div>

        {/* Statistics */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2 mt-4' : 'grid-cols-1 md:grid-cols-5 mt-6'}`}>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`font-bold text-red-500 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{detectionResult?.activeSites || 0}</div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Active Sites</div>
          </div>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`font-bold text-yellow-500 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{detectionResult?.inactiveSites || 0}</div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Inactive Sites</div>
          </div>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`font-bold text-green-500 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{detectionResult?.rehabilitatedSites || 0}</div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rehabilitated Sites</div>
          </div>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`font-bold text-blue-500 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{(detectionResult?.totalArea || 0).toFixed(1)}</div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Area (km²)</div>
          </div>
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`font-bold text-purple-500 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{((detectionResult?.averageConfidence || 0) * 100).toFixed(1)}%</div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Avg Confidence</div>
          </div>
        </div>

        {/* Site Details Modal */}
        {selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg w-full ${isMobile ? 'p-4 max-w-sm' : 'p-6 max-w-md'}`}>
              <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{selectedSite.name}</h3>
                <button
                  onClick={() => setSelectedSite(null)}
                  className={`text-gray-500 hover:text-gray-700 ${isMobile ? 'text-lg' : 'text-xl'}`}
                >
                  ✕
                </button>
              </div>
              <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <p><strong>Status:</strong> <span className={`capitalize ${selectedSite.status === 'active' ? 'text-red-600' : selectedSite.status === 'inactive' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedSite.status}</span></p>
                <p><strong>Region:</strong> {selectedSite.region}</p>
                <p><strong>Size:</strong> <span className="capitalize">{selectedSite.size}</span></p>
                <p><strong>Confidence:</strong> {(selectedSite.confidence * 100).toFixed(1)}%</p>
                <p><strong>Area:</strong> {selectedSite.area.toFixed(2)} km²</p>
                <p><strong>Degradation Level:</strong> <span className={`capitalize ${selectedSite.degradationLevel === 'high' ? 'text-red-600' : selectedSite.degradationLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedSite.degradationLevel}</span></p>
                <p><strong>Detection Method:</strong> <span className="capitalize">{selectedSite.detectionMethod}</span></p>
                <p><strong>Last Updated:</strong> {new Date(selectedSite.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  )
}

export default function MapsPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
      <MapsPageContent />
    </ProtectedRoute>
  )
}
