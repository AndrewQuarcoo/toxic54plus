'use client'

import { useRouter } from 'next/navigation'
import EPADashboard from '@/components/EPADashboard'
import ProtectedRoute from '../components/ProtectedRoute'

function EPADashboardPageContent() {
  const router = useRouter()

  const handleReportsClick = () => {
    router.push('/epa-dashboard/reports')
  }

  return (
    <EPADashboard>
      <div className="max-w-4xl mx-auto pt-60">
        <div className="text-center mb-0">
          <h1 className="text-3xl font-bold text-black mb-0">Galamsey Detection Center</h1>
          <p className="text-lg text-gray-600 mb-0">Monitor and detect illegal mining activities</p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={handleReportsClick}
              className="bg-black text-white py-2 px-6 rounded-full text-base font-medium hover:bg-orange-500 hover:text-black transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Reports
              </span>
              <div className="absolute inset-0 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>
        </div>
      </div>
    </EPADashboard>
  )
}

export default function EPADashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['epa_admin', 'super_admin']} redirectPath="/epa-login">
      <EPADashboardPageContent />
    </ProtectedRoute>
  )
}
