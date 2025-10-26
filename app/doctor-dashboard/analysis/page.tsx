'use client'

import { useState, useEffect } from 'react'
import DoctorDashboard from '@/components/DoctorDashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'
import { getAllReports } from '@/app/services/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toxitrace-backendx.onrender.com'

interface Report {
  id: string
  user_id: string
  original_input: string
  symptoms: string[]
  toxicity_likelihood: string
  ai_diagnosis: string
  reasoning?: string
  recommendations?: string[]
  suspected_chemicals?: string[]
  status: string
  created_at: string
}

interface DashboardSummary {
  total_reports: number
  pending_reports: number
  investigating_reports: number
  resolved_reports: number
  active_alerts: number
}

function AnalysisPageContent() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [reports, setReports] = useState<Report[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      
      // Fetch dashboard summary
      const summaryResponse = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setSummary(summaryData)
      }

      // Fetch all reports
      const reportsResponse = await fetch(`${API_BASE_URL}/reports/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        // Handle paginated or direct array response
        const reportsList = Array.isArray(reportsData) ? reportsData : (reportsData.reports || [])
        setReports(reportsList.slice(0, 10)) // Show 10 most recent
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors: { [key: string]: string } = {
      'LOW': 'bg-green-100 text-green-800',
      'MILD': 'bg-green-100 text-green-800',
      'MODERATE': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-red-100 text-red-800',
      'SEVERE': 'bg-red-100 text-red-800',
      'CRITICAL': 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[severity] || 'bg-gray-100 text-gray-800'}`}>
        {severity}
      </span>
    )
  }

  const getDisplaySeverity = (likelihood: string) => {
    const mapping: { [key: string]: string } = {
      'LOW': 'Low',
      'MILD': 'Low',
      'MODERATE': 'Moderate',
      'HIGH': 'High',
      'SEVERE': 'High',
      'CRITICAL': 'High'
    }
    return mapping[likelihood] || 'Unknown'
  }

  const getAnalysisType = (report: Report) => {
    if (report.suspected_chemicals && report.suspected_chemicals.length > 0) {
      return report.suspected_chemicals.join(', ')
    }
    if (report.symptoms && report.symptoms.length > 0) {
      return report.symptoms.join(', ')
    }
    return 'Symptom Analysis'
  }

  if (loading) {
    return (
      <DoctorDashboard>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DoctorDashboard>
    )
  }

  // Calculate urgent cases (SEVERE or CRITICAL)
  const urgentCases = reports.filter(r => 
    ['SEVERE', 'CRITICAL'].includes(r.toxicity_likelihood?.toUpperCase() || '')
  ).length

  return (
    <DoctorDashboard>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Medical Analysis</h1>
          <p className="text-gray-600">Review and analyze patient medical data</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Analysis
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                    <p className="text-2xl font-bold text-gray-900">{summary?.total_reports || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{summary?.pending_reports || 0}</p>
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
                    <p className="text-sm font-medium text-gray-600">Urgent Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{urgentCases}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Analyses</h3>
              </div>
              {reports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No recent analyses found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <div key={report.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              Patient {report.user_id?.substring(0, 8) || 'Unknown'}
                            </h4>
                            {getSeverityBadge(report.toxicity_likelihood)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{getAnalysisType(report)}</p>
                          <p className="text-sm text-gray-900 mb-2">{report.ai_diagnosis || 'No diagnosis available'}</p>
                          <p className="text-sm text-gray-600">
                            {report.reasoning || report.recommendations?.join(', ') || 'No specific recommendations'}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-900 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DoctorDashboard>
  )
}

export default function AnalysisPage() {
  return (
    <ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
      <AnalysisPageContent />
    </ProtectedRoute>
  )
}
