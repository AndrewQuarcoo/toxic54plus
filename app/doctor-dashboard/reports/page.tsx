'use client'

import { useState, useEffect } from 'react'
import DoctorDashboard from '@/components/DoctorDashboard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toxitrace-backendx.onrender.com'

interface Report {
  id: string
  user_id: string
  original_input: string
  symptoms: string[]
  toxicity_likelihood: string
  ai_diagnosis: string
  suspected_chemicals?: string[]
  status: string
  created_at: string
}

interface DashboardSummary {
  total_reports: number
  pending_reports: number
  investigating_reports: number
  resolved_reports: number
}

function ReportsPageContent() {
  const { token } = useAuth()
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
        setReports(reportsList)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalReports = summary?.total_reports || reports.length
  const thisMonthReports = reports.filter(r => {
    const reportDate = new Date(r.created_at)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  }).length
  const pendingReports = summary?.pending_reports || reports.filter(r => r.status === 'PENDING').length
  const completedReports = summary?.resolved_reports || reports.filter(r => r.status === 'RESOLVED').length

  const getReportTitle = (report: Report) => {
    if (report.suspected_chemicals && report.suspected_chemicals.length > 0) {
      return `${report.suspected_chemicals[0]} Exposure Analysis`
    }
    if (report.toxicity_likelihood) {
      return `${report.toxicity_likelihood} Toxicity Assessment`
    }
    return 'Medical Report'
  }

  const getReportType = (report: Report) => {
    if (report.symptoms && report.symptoms.length > 0) {
      return 'Symptom Analysis'
    }
    return 'Comprehensive Analysis'
  }

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'INVESTIGATING': 'bg-blue-100 text-blue-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'FALSE_ALARM': 'bg-gray-100 text-gray-800',
    }
    
    const labels: { [key: string]: string } = {
      'PENDING': 'Pending',
      'INVESTIGATING': 'Investigating',
      'RESOLVED': 'Completed',
      'FALSE_ALARM': 'False Alarm',
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
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

  const stats = [
    { 
      label: 'Total Reports', 
      value: totalReports.toString(), 
      icon: (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'This Month', 
      value: thisMonthReports.toString(), 
      icon: (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      label: 'Pending', 
      value: pendingReports.toString(), 
      icon: (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Completed', 
      value: completedReports.toString(), 
      icon: (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ]

  return (
    <DoctorDashboard>
      <div className="p-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Reports</h1>
            <p className="text-gray-600">View and manage medical reports</p>
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
                <div className="text-gray-400">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Medical Reports</h3>
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getReportTitle(report)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Patient {report.user_id?.substring(0, 8) || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                          {getReportType(report)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DoctorDashboard>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
      <ReportsPageContent />
    </ProtectedRoute>
  )
}
