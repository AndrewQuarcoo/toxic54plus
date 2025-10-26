'use client'

import { useEffect, useState } from 'react'
import DoctorDashboard from '@/components/DoctorDashboard'
import { getPatientsFromReports, type Report } from '@/app/services/api'
import ProtectedRoute from '@/app/components/ProtectedRoute'

function PatientsPageContent() {
  const [patientsData, setPatientsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatientsFromReports()
        setPatientsData(data)
      } catch (error) {
        console.error('Failed to fetch patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
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

  // Transform patient data to display in table
  const patients = patientsData.map((patientInfo: any, index: number) => {
    const latestReport = patientInfo.recent_reports?.[0]
    return {
      id: patientInfo.user_id || `patient-${index}`,
      name: `Patient ${patientInfo.user_id?.substring(0, 8) || index + 1}`,
      age: '-',
      condition: latestReport?.suspected_chemicals?.join(', ') || 'Unknown',
      date: latestReport ? new Date(latestReport.created_at).toLocaleDateString() : 'N/A',
      status: latestReport?.status || 'pending',
      toxicityLevel: latestReport?.toxicity_level || 'UNKNOWN',
      totalReports: patientInfo.total_reports || 0,
      latestReport: latestReport
    }
  })

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
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Reports
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recent Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Report Date
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
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient: any) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.totalReports}</div>
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

export default function PatientsPage() {
  return (
    <ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
      <PatientsPageContent />
    </ProtectedRoute>
  )
}
