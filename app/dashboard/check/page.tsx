'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { useIsMobile } from '@/app/hooks/use-mobile'
import ProtectedRoute from '@/app/components/ProtectedRoute'

function CheckPageContent() {
  const isMobile = useIsMobile()
  const [checkData, setCheckData] = useState({
    heartRate: '',
    bloodPressure: '',
    weight: '',
    sleep: '',
    mood: '',
    energy: '',
    notes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCheckData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Health check submitted:', checkData)
    // Handle form submission here
    alert('Health check data saved successfully!')
  }

  return (
    <Dashboard>
      <div className={`${isMobile ? 'w-full' : 'max-w-4xl'} mx-auto`}>
        <div className={isMobile ? 'mb-6' : 'mb-8'}>
          <h1 className={`font-bold text-black ${isMobile ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>Health Check</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Log your daily health metrics and track your progress</p>
        </div>

        <form onSubmit={handleSubmit} className={isMobile ? 'space-y-4' : 'space-y-6'}>
          {/* Vital Signs */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`font-semibold text-black ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Vital Signs</h3>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  name="heartRate"
                  value={checkData.heartRate}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
                  placeholder="72"
                />
              </div>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={checkData.bloodPressure}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={checkData.weight}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
                  placeholder="165"
                />
              </div>
            </div>
          </div>

          {/* Wellness Metrics */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`font-semibold text-black ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Wellness Metrics</h3>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Sleep Duration (hours)
                </label>
                <input
                  type="number"
                  name="sleep"
                  value={checkData.sleep}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
                  placeholder="7.5"
                  step="0.5"
                />
              </div>
              <div>
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Mood (1-10)
                </label>
                <select
                  name="mood"
                  value={checkData.mood}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
                >
                  <option value="">Select mood</option>
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Below Average</option>
                  <option value="4">4 - Below Average</option>
                  <option value="5">5 - Average</option>
                  <option value="6">6 - Above Average</option>
                  <option value="7">7 - Good</option>
                  <option value="8">8 - Very Good</option>
                  <option value="9">9 - Excellent</option>
                  <option value="10">10 - Outstanding</option>
                </select>
              </div>
            </div>
          </div>

          {/* Energy Level */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`font-semibold text-black ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Energy Level</h3>
            <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
              {[1, 2, 3, 4, 5].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="energy"
                    value={level}
                    checked={checkData.energy === level.toString()}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    checkData.energy === level.toString()
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  } ${isMobile ? 'w-8 h-8 text-sm' : 'w-12 h-12'}`}>
                    {level}
                  </div>
                </label>
              ))}
            </div>
            <div className={`flex justify-between text-gray-500 mt-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Notes */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`font-semibold text-black ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Additional Notes</h3>
            <textarea
              name="notes"
              value={checkData.notes}
              onChange={handleInputChange}
              rows={isMobile ? 3 : 4}
              className={`w-full bg-gray-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 ${isMobile ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}`}
              placeholder="Any additional observations or concerns..."
            />
          </div>

          {/* Submit Button */}
          <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
            <button
              type="submit"
              className={`bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-colors ${isMobile ? 'py-2.5 px-6 text-sm w-full' : 'py-3 px-8'}`}
            >
              Save Health Check
            </button>
          </div>
        </form>

        {/* Recent Checks */}
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'mt-6 p-4' : 'mt-8 p-6'}`}>
          <h3 className={`font-semibold text-black ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>Recent Health Checks</h3>
          <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
            <div className={`flex items-center justify-between bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <p className={`text-black font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Today - 2:30 PM</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>HR: 72 BPM • BP: 120/80 • Weight: 165 lbs</p>
              </div>
              <span className={`text-green-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>✓ Complete</span>
            </div>
            <div className={`flex items-center justify-between bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <p className={`text-black font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Yesterday - 3:15 PM</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>HR: 68 BPM • BP: 118/78 • Weight: 165.2 lbs</p>
              </div>
              <span className={`text-green-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>✓ Complete</span>
            </div>
            <div className={`flex items-center justify-between bg-gray-50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <p className={`text-black font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>2 days ago - 2:45 PM</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>HR: 75 BPM • BP: 122/82 • Weight: 165.5 lbs</p>
              </div>
              <span className={`text-green-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>✓ Complete</span>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  )
}

export default function CheckPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
      <CheckPageContent />
    </ProtectedRoute>
  )
}
