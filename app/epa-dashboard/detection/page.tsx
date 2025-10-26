'use client'

import { useState } from 'react'
import EPADashboard from '@/components/EPADashboard'

export default function DetectionPage() {
  const [activeTab, setActiveTab] = useState('upload')

  const recentDetections = [
    {
      id: 1,
      location: 'Western Region, Prestea',
      confidence: '95%',
      date: '2024-01-15',
      result: 'Galamsey Activity Confirmed',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: 2,
      location: 'Ashanti Region, Obuasi',
      confidence: '87%',
      date: '2024-01-14',
      result: 'Suspected Mining Site',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: 3,
      location: 'Eastern Region, Kibi',
      confidence: '92%',
      date: '2024-01-13',
      result: 'Galamsey Activity Detected',
      imageUrl: '/api/placeholder/300/200'
    },
  ]

  return (
    <EPADashboard>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Galamsey Detection</h1>
          <p className="text-gray-600">Upload and analyze images for illegal mining activities</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload Image
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Detections
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Upload Image for Analysis</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Upload
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-4 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter location (e.g., Western Region, Prestea)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPS Coordinates (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Latitude"
                      />
                      <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Longitude"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Add any additional information about the detection..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                      Analyze Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              {recentDetections.map((detection) => (
                <div key={detection.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">{detection.location}</h4>
                        <p className="text-sm text-gray-500">{detection.date}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                        {detection.confidence} confidence
                      </span>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">{detection.result}</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
                            View Full Report
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Detections</p>
                    <p className="text-2xl font-bold text-gray-900">124</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EPADashboard>
  )
}
