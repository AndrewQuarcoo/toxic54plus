// API Service based on ARCHITECTURE.md
// Maps backend API endpoints to frontend usage

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toxitrace-backendx.onrender.com'

export interface User {
  id: string  // UUID
  email: string
  username: string
  full_name: string
  phone_number?: string
  role: 'user' | 'epa_admin' | 'health_admin' | 'super_admin'
  is_verified: boolean
  created_at: string
}

export interface Report {
  id: string  // UUID
  user_id: string  // UUID
  original_input: string  // Original text (Twi or English)
  translated_input?: string  // English translation
  symptoms?: string[]  // Extracted symptoms array
  location: string
  latitude?: number
  longitude?: number
  
  // AI Analysis
  toxicity_level?: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  toxicity_likelihood?: string  // From backend (MILD/MODERATE/SEVERE)
  confidence?: number  // 0.0 to 1.0
  confidence_score?: number  // 0.0 to 1.0
  suspected_chemicals?: string[]
  possible_causes?: string[]
  reasoning?: string
  recommendations?: string[]
  
  // AI Diagnosis (main fields from backend)
  ai_diagnosis?: string  // English diagnosis
  ai_diagnosis_twi?: string  // Twi translation of diagnosis
  input_language?: 'en' | 'tw'
  
  // Metadata
  status?: 'pending' | 'under_review' | 'resolved' | 'false_alarm' | 'PENDING' | 'INVESTIGATING'
  chat_session_id?: string  // UUID - auto-created for follow-up
  region?: string
  created_at: string
  updated_at?: string
}

export interface ChatSession {
  id: string  // UUID
  user_id: string  // UUID
  trigger_type: 'report' | 'image'
  trigger_id: string  // UUID
  report_id?: string  // UUID
  image_id?: string  // UUID
  status: 'active' | 'closed'
  created_at: string
}

export interface ChatMessage {
  id: number
  session_id: string
  role: 'user' | 'assistant'
  content: string  // Primary content (English or user input)
  content_twi?: string  // Twi translation (if applicable)
  language: 'en' | 'tw'
  created_at: string
  response_time_ms?: number  // Response latency
  tokens_used?: number  // Gemini API tokens
}

export interface Image {
  id: string  // UUID
  user_id: string  // UUID
  report_id?: string  // UUID
  image_url: string
  image_type: string
  prediction: string
  confidence: number
  toxicity_detected: boolean
  contaminant_type?: string
  location?: string
  latitude?: number
  longitude?: number
  region?: string
  created_at: string
  processed_at?: string
  filename?: string
  file_path?: string
  description?: string
  chat_session_id?: string  // UUID - auto-created for follow-up
}

export interface Alert {
  id: string  // UUID
  report_id: string  // UUID
  alert_type: 'toxicity_detection' | 'cluster_alert' | 'outbreak_warning'
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  affected_location: string
  is_active: boolean
  created_at: string
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// API Functions

// Authentication
export async function login(email: string, password: string): Promise<{ access_token: string, user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }
  
  return await response.json()
}

export async function register(formData: {
  email: string
  password: string
  username: string
  full_name: string
  phone_number?: string
}): Promise<{ access_token: string, user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }
  
  return await response.json()
}

export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  
  return await response.json()
}

// Reports (Maps to Chat in frontend)
export async function submitReport(
  original_input: string, 
  location: string, 
  input_language: 'en' | 'tw' = 'en',
  latitude?: number, 
  longitude?: number
): Promise<Report> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/reports/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      original_input,
      input_language,
      input_type: 'text',
      location,
      latitude,
      longitude,
      region: location
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to submit report')
  }
  
  return await response.json()
}

export async function getUserReports(): Promise<Report[]> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/reports/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }
  
  return await response.json()
}

export async function getAllReports(): Promise<Report[]> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/reports/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }
  
  const data = await response.json()
  
  // Handle both array response and paginated response
  if (Array.isArray(data)) {
    return data
  }
  
  // Handle paginated response with reports array
  if (data.reports && Array.isArray(data.reports)) {
    return data.reports
  }
  
  // Handle other possible response formats
  return data
}

// New function to get all users/patients from reports
export interface PatientInfo {
  user_id: string
  total_reports: number
  recent_reports: Report[]
  latest_report_date: string
}

export async function getPatientsFromReports(): Promise<PatientInfo[]> {
  const response = await getAllReports()
  
  // Handle paginated or direct array response
  const reports: Report[] = Array.isArray(response) 
    ? response 
    : ((response as any).reports || [])
  
  // Group reports by user_id
  const patientMap = new Map<string, Report[]>()
  
  reports.forEach(report => {
    if (report.user_id) {
      if (!patientMap.has(report.user_id)) {
        patientMap.set(report.user_id, [])
      }
      patientMap.get(report.user_id)!.push(report)
    }
  })
  
  // Convert to array and add metadata
  const patients: PatientInfo[] = Array.from(patientMap.entries()).map(([user_id, userReports]) => {
    // Sort reports by date (most recent first)
    const sortedReports = userReports.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return {
      user_id,
      total_reports: userReports.length,
      recent_reports: sortedReports.slice(0, 5), // Get 5 most recent
      latest_report_date: sortedReports[0]?.created_at || ''
    }
  })
  
  // Sort by most recent report
  return patients.sort((a, b) => 
    new Date(b.latest_report_date).getTime() - new Date(a.latest_report_date).getTime()
  )
}

export async function getReport(reportId: string): Promise<Report> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch report')
  }
  
  return await response.json()
}

// Images
export async function uploadImage(file: File, description?: string): Promise<Image> {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  
  const token = localStorage.getItem('access_token')
  
  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to upload image')
  }
  
  return await response.json()
}

// Chatbot (Connected to Chat UI)
export async function createChatSession(triggerType: 'report' | 'image', triggerId: string): Promise<ChatSession> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/chat/sessions/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      trigger_type: triggerType,
      trigger_id: triggerId,
      language: 'en'
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create chat session')
  }
  
  return await response.json()
}

export async function getChatSession(reportId: string): Promise<{
  session_id: string
  messages: ChatMessage[]
  suggested_questions: { english: string, twi: string }[]
}> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/chat/sessions/report/${reportId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat session')
  }
  
  return await response.json()
}

export async function sendChatMessage(sessionId: string, message: string, language: 'en' | 'tw' = 'en'): Promise<{
  session_id: string
  user_message: ChatMessage
  assistant_message: ChatMessage
  suggested_questions: string[]
}> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/chat/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId,
      content: message,
      language
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to send message')
  }
  
  return await response.json()
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat history')
  }
  
  return await response.json()
}

// Get chat session by session ID (for accessing sessions directly)
export async function getChatSessionById(sessionId: string): Promise<{
  session_id: string
  messages: ChatMessage[]
  suggested_questions?: string[]
}> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat session')
  }
  
  return await response.json()
}

// Alerts
export async function getAllAlerts(): Promise<Alert[]> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/alerts/active`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }
  
  return await response.json()
}

// Dashboard
export async function getDashboardSummary(): Promise<any> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary')
  }
  
  return await response.json()
}

export async function getHeatmapData(): Promise<any> {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`${API_BASE_URL}/dashboard/heatmap`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch heatmap data')
  }
  
  return await response.json()
}

// Error handling helper
export async function makeRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.json()
      
      if (response.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Session expired')
      }
      
      if (response.status === 422) {
        console.error('Validation errors:', error.detail)
        throw new Error('Invalid input data')
      }
      
      throw new Error(error.detail || 'Request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}


