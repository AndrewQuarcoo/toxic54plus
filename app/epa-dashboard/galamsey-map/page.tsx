'use client'

import { useState } from 'react'
import EPADashboard from '@/components/EPADashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import GalamseyDetectionMap, { GalamseySite } from '@/components/GalamseyDetectionMap'

function GalamseyMapPageContent() {
  const [selectedRegion, setSelectedRegion] = useState('all')
  
  const detectionSites = [
    {
      id: '1',
      name: 'Prestea Site',
      lat: 5.4345,
      lng: -2.1447,
      status: 'active' as const,
      size: 'medium' as const,
      lastUpdated: '2024-01-15',
      region: 'Western',
      confidence: 0.87,
      area: 12.5,
      degradationLevel: 'high' as const,
      detectionMethod: 'sentinel-2' as const
    },
    {
      id: '2',
      name: 'Obuasi Site',
      lat: 6.2048,
      lng: -1.6679,
      status: 'active' as const,
      size: 'large' as const,
      lastUpdated: '2024-01-14',
      region: 'Ashanti',
      confidence: 0.92,
      area: 35.8,
      degradationLevel: 'high' as const,
      detectionMethod: 'planet-nicfi' as const
    },
    {
      id: '3',
      name: 'Kibi Site',
      lat: 5.9333,
      lng: -0.5167,
      status: 'inactive' as const,
      size: 'small' as const,
      lastUpdated: '2024-01-13',
      region: 'Eastern',
      confidence: 0.75,
      area: 8.3,
      degradationLevel: 'medium' as const,
      detectionMethod: 'sentinel-1' as const
    },
    {
      id: '4',
      name: 'Dunkwa Site',
      lat: 5.9667,
      lng: -1.7833,
      status: 'rehabilitated' as const,
      size: 'medium' as const,
      lastUpdated: '2024-01-12',
      region: 'Central',
      confidence: 0.68,
      area: 15.2,
      degradationLevel: 'low' as const,
      detectionMethod: 'unet-deep-learning' as const
    },
    {
      id: '5',
      name: 'Wa Site',
      lat: 10.0600,
      lng: -2.5019,
      status: 'active' as const,
      size: 'large' as const,
      lastUpdated: '2024-01-11',
      region: 'Upper West',
      confidence: 0.91,
      area: 42.6,
      degradationLevel: 'high' as const,
      detectionMethod: 'sentinel-2' as const
    },
  ]

  const tableData = detectionSites.map((site, index) => ({
    id: index + 1,
    location: `${site.region} Region, ${site.name}`,
    coordinates: `${site.lat.toFixed(4)}° N, ${site.lng.toFixed(4)}° W`,
    date: site.lastUpdated,
    status: site.status === 'active' ? 'Active' : site.status === 'inactive' ? 'Investigating' : 'Contained',
    severity: site.degradationLevel === 'high' ? 'Critical' : site.degradationLevel === 'medium' ? 'High' : 'Moderate'
  }))

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-red-100 text-red-800',
      'Contained': 'bg-green-100 text-green-800',
      'Investigating': 'bg-yellow-100 text-yellow-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
      'Critical': 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {severity}
      </span>
    )
  }

  const handleSiteClick = (site: GalamseySite) => {
    console.log('Site clicked:', site)
    // You can add more functionality here, like opening a modal or navigating
  }

  return (
    <EPADashboard>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Regional Map</h1>
          <p className="text-gray-600">Monitor environmental activities across Ghana</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <GalamseyDetectionMap 
              sites={detectionSites} 
              selectedRegion={selectedRegion}
              onSiteClick={handleSiteClick}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Active Sites</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Investigating</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Contained</p>
                  <p className="text-2xl font-bold text-green-600">1</p>
                </div>
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Detections</p>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                </div>
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{site.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{site.coordinates}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{site.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(site.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(site.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900 mr-3">
                        View Details
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Take Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EPADashboard>
  )
}

export default function GalamseyMapPage() {
  return (
    <ProtectedRoute allowedRoles={['epa_admin', 'super_admin']} redirectPath="/epa-login">
      <GalamseyMapPageContent />
    </ProtectedRoute>
  )
}
