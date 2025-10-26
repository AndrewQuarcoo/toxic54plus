'use client'

import { useEffect, useState } from 'react'
import DoctorDashboard from '@/components/DoctorDashboard'
import { getAllReports, type Report } from '@/app/services/api'

export default function PatientsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllReports()
        setReports(data)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

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

  const patients = reports.map(report => ({
    id: report.id,
    name: `Report ${report.id.substring(0, 8)}`, // Extract short ID
    age: '-',
    condition: report.suspected_chemicals?.join(', ') || 'Unknown',
    date: new Date(report.created_at).toLocaleDateString(),
    status: report.status,
    toxicityLevel: report.toxicity_level,
    report: report
  }))

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'false_alarm': 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <DoctorDashboard>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Patients</h1>
          <p className="text-gray-600">Manage and monitor your patients</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suspected Chemicals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toxicity Level
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
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No reports available
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.age}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{patient.condition}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getToxicityBadge(patient.toxicityLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View Details
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
    </DoctorDashboard>
  )
}
