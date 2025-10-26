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
  symptoms: string  // Original text (Twi or English)
  translated_text: string  // English translation
  location: string
  latitude?: number
  longitude?: number
  
  // AI Analysis
  toxicity_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  confidence: number  // 0.0 to 1.0
  suspected_chemicals: string[]
  reasoning: string
  recommendations: string[]
  
  // Metadata
  status: 'pending' | 'under_review' | 'resolved' | 'false_alarm'
  chat_session_id?: string  // UUID - auto-created for follow-up
  created_at: string
  updated_at: string
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
  id: string  // UUID
  session_id: string  // UUID
  sender: 'user' | 'ai'
  message_text: string  // English version
  message_text_twi: string  // Twi translation
  created_at: string
}

export interface Image {
  id: string  // UUID
  user_id: string  // UUID
  report_id?: string  // UUID
  filename: string
  file_path: string
  description: string
  chat_session_id?: string  // UUID - auto-created for follow-up
  created_at: string
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
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
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
  const response = await fetch(`${API_BASE_URL}/reports/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
  const response = await fetch(`${API_BASE_URL}/reports/user/me`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }
  
  return await response.json()
}

export async function getAllReports(): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/reports/all`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }
  
  return await response.json()
}

export async function getReport(reportId: string): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    headers: getAuthHeaders()
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
export async function getChatSession(reportId: string): Promise<{
  session_id: string
  messages: ChatMessage[]
  suggested_questions: { english: string, twi: string }[]
}> {
  const response = await fetch(`${API_BASE_URL}/chatbot/sessions/report/${reportId}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat session')
  }
  
  return await response.json()
}

export async function sendChatMessage(sessionId: string, message: string, language: 'en' | 'tw' = 'en'): Promise<{
  message_id: string
  ai_response: {
    english: string
    twi: string
  }
  suggested_followups: { english: string, twi: string }[]
}> {
  const response = await fetch(`${API_BASE_URL}/chatbot/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      session_id: sessionId,
      message,
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
  const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}/history`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat history')
  }
  
  return await response.json()
}

// Alerts
export async function getAllAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts/all`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }
  
  return await response.json()
}

// Dashboard
export async function getDashboardSummary(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary')
  }
  
  return await response.json()
}

export async function getHeatmapData(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/dashboard/heatmap`, {
    headers: getAuthHeaders()
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

