'use client'

import { useEffect, useState } from 'react'
import EPADashboard from '@/components/EPADashboard'
import { getAllReports, type Report } from '@/app/services/api'
import ProtectedRoute from '@/app/components/ProtectedRoute'

function ReportsPageContent() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllReports()
        setReports(data)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
        setError('Failed to load reports. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) {
    return (
      <EPADashboard>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </EPADashboard>
    )
  }

  if (error) {
    return (
      <EPADashboard>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Reports</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </EPADashboard>
    )
  }

  const formattedReports = reports.map(report => ({
    id: report.id,
    title: `Report - ${report.location || 'Unknown Location'}`,
    location: report.location || 'Unknown',
    date: new Date(report.created_at).toLocaleDateString(),
    type: report.suspected_chemicals?.join(', ') || 'Toxicity Report',
    status: report.status?.toLowerCase() || 'pending',
    priority: report.toxicity_level || 'NONE',
    report: report
  }))

  const stats = [
    { label: 'Total Reports', value: reports.length.toString(), icon: 'document' },
    { label: 'This Month', value: reports.filter(r => {
      const reportDate = new Date(r.created_at)
      const now = new Date()
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
    }).length.toString(), icon: 'chart' },
    { label: 'Under Review', value: reports.filter(r => {
      const status = r.status?.toLowerCase()
      return status === 'under_review' || status === 'investigating'
    }).length.toString(), icon: 'clock' },
    { label: 'Resolved', value: reports.filter(r => r.status?.toLowerCase() === 'resolved').length.toString(), icon: 'check' },
  ]

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MODERATE': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-red-100 text-red-800',
      'CRITICAL': 'bg-purple-100 text-purple-800',
      'NONE': 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending'
    const colors = {
      'pending': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'investigating': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'false_alarm': 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[normalizedStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {normalizedStatus.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getStatIcon = (iconType: string) => {
    const iconClass = "w-8 h-8 text-orange-600"
    
    switch (iconType) {
      case 'document':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'chart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'clock':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'check':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <EPADashboard>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">EPA Reports</h1>
              <p className="text-gray-600">View and manage environmental reports</p>
            </div>
            <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Report
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="flex items-center justify-center">
                  {getStatIcon(stat.icon)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">EPA Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
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
                {formattedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No reports available
                    </td>
                  </tr>
                ) : (
                  formattedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{report.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{report.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{report.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded max-w-xs truncate block">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(report.priority || 'NONE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status || 'pending')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setSelectedReport(report.report)}
                          className="text-orange-600 hover:text-orange-900 mr-3 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-lg text-gray-900">{selectedReport.location || 'Unknown'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedReport.status || 'pending')}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <div className="mt-1">
                    {getPriorityBadge(selectedReport.toxicity_level || 'NONE')}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-lg text-gray-900">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
              </div>

              {selectedReport.suspected_chemicals && selectedReport.suspected_chemicals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Suspected Chemicals</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.suspected_chemicals.map((chemical, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {chemical}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.symptoms && selectedReport.symptoms.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.symptoms.map((symptom, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.ai_diagnosis && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">AI Diagnosis</h3>
                  <p className="text-lg text-gray-900 mt-2">{selectedReport.ai_diagnosis}</p>
                </div>
              )}

              {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReport.confidence !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Confidence Score</h3>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-orange-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedReport.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{(selectedReport.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </EPADashboard>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['epa_admin', 'super_admin']} redirectPath="/epa-login">
      <ReportsPageContent />
    </ProtectedRoute>
  )
}
