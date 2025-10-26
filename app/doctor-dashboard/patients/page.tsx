'use client'

import DoctorDashboard from '@/components/DoctorDashboard'

export default function PatientsPage() {
  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      condition: 'Respiratory Issues',
      date: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      condition: 'Skin Rash',
      date: '2024-01-14',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Michael Johnson',
      age: 58,
      condition: 'Toxin Exposure',
      date: '2024-01-13',
      status: 'Monitoring'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      age: 29,
      condition: 'Eye Irritation',
      date: '2024-01-12',
      status: 'Active'
    },
    {
      id: 5,
      name: 'David Brown',
      age: 67,
      condition: 'Respiratory Issues',
      date: '2024-01-11',
      status: 'Recovering'
    },
  ]

  const getStatusBadge = (status: string) => {
    const colors = {
      'Active': 'bg-blue-100 text-blue-800',
      'Monitoring': 'bg-yellow-100 text-yellow-800',
      'Recovering': 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
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
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
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
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{patient.age} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.condition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{patient.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DoctorDashboard>
  )
}
