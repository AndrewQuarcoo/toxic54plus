# Frontend-Backend Architecture Mapping

## Overview
This document maps the frontend components to the backend API endpoints based on `ARCHITECTURE.md`.

---

## Authentication Flow

### User Roles
- `user` - Regular users (access to main dashboard)
- `epa_admin` - EPA administrators (access to EPA dashboard)
- `health_admin` - Health administrators (access to Doctor dashboard)
- `super_admin` - Super administrators (access to all dashboards)

### Login Pages
- **Regular Users**: `/login` → `LoginAuth` → redirects to `/dashboard`
- **Doctors**: `/doctor-login` → `DoctorLoginAuth` → redirects to `/doctor-dashboard`
  - Required roles: `health_admin`, `super_admin`
- **EPA Admins**: `/epa-login` → `EPALoginAuth` → redirects to `/epa-dashboard`
  - Required roles: `epa_admin`, `super_admin`

### Authentication Components
| Component | Purpose | API Endpoint |
|-----------|---------|--------------|
| `LoginAuth.tsx` | Regular user login | `POST /auth/login` |
| `DoctorLoginAuth.tsx` | Doctor/health admin login | `POST /auth/login` + role check |
| `EPALoginAuth.tsx` | EPA admin login | `POST /auth/login` + role check |
| `SignupAuth.tsx` | User registration | `POST /auth/register` |
| `AuthContext.tsx` | Global auth state management | JWT token storage |

---

## Main Dashboard (User)

### Features Mapping

| Frontend Feature | Backend API Endpoint | Purpose |
|-----------------|---------------------|---------|
| Chat (Symptom Reporting) | `POST /reports/create` | Submit symptom report |
| Chat History | `GET /chatbot/sessions/{session_id}/history` | View past conversations |
| Send Message | `POST /chatbot/send` | Send chat message (bidirectional Twi/English) |
| Image Upload | `POST /images/upload` | Upload evidence image |
| User Reports | `GET /reports/user/me` | View user's submitted reports |
| Maps | `GET /dashboard/heatmap` | View toxicity hotspot map |

### API → UI Flow
```
User submits symptom → POST /reports/create
  ↓
Backend processes with AI:
  - Translation (Twi → English)
  - NLP symptom extraction
  - Gemini AI toxicity classification
  ↓
Returns Report with chat_session_id
  ↓
Frontend Chat UI connects to session
  ↓
User can ask follow-up questions via POST /chatbot/send
```

---

## Doctor Dashboard

### Features Mapping

| Frontend Feature | Backend API Endpoint | Purpose |
|-----------------|---------------------|---------|
| View Patients | `GET /reports/all` | View all patient reports |
| Patient Analysis | `GET /reports/{id}` | Get specific patient report |
| Medical Analysis | `POST /images/upload` | Upload patient images for analysis |
| Reports Dashboard | `GET /dashboard/summary` | View health statistics |
| Close Report | `PATCH /reports/update-status/{id}` | Mark report as resolved |

### Protected Routes
- `/doctor-dashboard` - Requires `health_admin` or `super_admin` role
- `/doctor-dashboard/patients` - Lists all reports as patient cases
- `/doctor-dashboard/analysis` - Medical image analysis
- `/doctor-dashboard/reports` - Health statistics dashboard

---

## EPA Dashboard

### Features Mapping

| Frontend Feature | Backend API Endpoint | Purpose |
|-----------------|---------------------|---------|
| View Reports | `GET /reports/all` | View all environmental reports |
| Galamsey Detection | `POST /images/upload` | Upload images for mining detection |
| Detection Map | `GET /dashboard/heatmap` | View galamsey hotspots |
| Alerts | `GET /alerts/all` | View active environmental alerts |
| Create Alert | `POST /alerts/create` | Create manual alert |
| Resolve Alert | `PATCH /alerts/{id}/resolve` | Mark alert as resolved |

### Protected Routes
- `/epa-dashboard` - Requires `epa_admin` or `super_admin` role
- `/epa-dashboard/detection` - Galamsey detection center
- `/epa-dashboard/galamsey-map` - Interactive map of hotspots
- `/epa-dashboard/reports` - Environmental reports dashboard

---

## Reports → Chat Integration

### Key Concept
**Reports in the API = Chat on the Frontend**

When a user submits a symptom report:
1. Report is created via `POST /reports/create`
2. Backend automatically creates a chat session
3. AI sends first greeting message
4. Chat UI displays conversation history
5. User can ask follow-up questions

### Bidirectional Translation
- User can type in **English** or **Twi**
- AI responses are generated in **both languages**
- Frontend displays based on user's language preference
- Stored as `message_text` (English) and `message_text_twi` (Twi)

---

## Protected Route System

### Components
- `ProtectedRoute.tsx` - Wraps sensitive routes
- Checks authentication status
- Verifies user roles
- Redirects to login if unauthorized

### Usage
```typescript
import ProtectedRoute from '@/app/components/ProtectedRoute'

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
      <DoctorDashboard>
        {/* Page content */}
      </DoctorDashboard>
    </ProtectedRoute>
  )
}
```

---

## API Service Layer

### Location: `app/services/api.ts`

Provides TypeScript interfaces and functions for all backend endpoints:

#### Authentication
- `login(email, password)` → `POST /auth/login`
- `register(formData)` → `POST /auth/register`
- `getCurrentUser()` → `GET /auth/me`

#### Reports (Chat Feature)
- `submitReport(symptoms, location, lat?, lng?)` → `POST /reports/create`
- `getUserReports()` → `GET /reports/user/me`
- `getAllReports()` → `GET /reports/all` (admin only)
- `getReport(reportId)` → `GET /reports/{id}`

#### Chatbot
- `getChatSession(reportId)` → `GET /chatbot/sessions/report/{id}`
- `sendChatMessage(sessionId, message, language)` → `POST /chatbot/send`
- `getChatHistory(sessionId)` → `GET /chatbot/sessions/{id}/history`

#### Images
- `uploadImage(file, description?)` → `POST /images/upload`

#### Alerts
- `getAllAlerts()` → `GET /alerts/all`
- `createAlert(data)` → `POST /alerts/create` (admin only)
- `resolveAlert(alertId)` → `PATCH /alerts/{id}/resolve` (admin only)

#### Dashboard
- `getDashboardSummary()` → `GET /dashboard/summary`
- `getHeatmapData()` → `GET /dashboard/heatmap`

---

## Environment Variables

### Required
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Backend Variables (ARCHITECTURE.md)
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=...
GEMINI_API_KEY=...
GOOGLE_API_KEY=...
```

---

## User Flow Diagrams

### Regular User Flow
```
Signup → POST /auth/register
  ↓
Onboarding → Set location & GPS
  ↓
Dashboard → View options
  ↓
Chat → POST /reports/create → Get chat_session_id
  ↓
Chat UI → POST /chatbot/send → Get AI responses
```

### Doctor Flow
```
Doctor Login → POST /auth/login (health_admin role)
  ↓
Doctor Dashboard
  ↓
View Patients → GET /reports/all
  ↓
Analyze Report → GET /reports/{id}
  ↓
Medical Analysis → POST /images/upload
  ↓
Close Case → PATCH /reports/update-status/{id}
```

### EPA Admin Flow
```
EPA Login → POST /auth/login (epa_admin role)
  ↓
EPA Dashboard
  ↓
Detection → POST /images/upload (galamsey)
  ↓
View Map → GET /dashboard/heatmap
  ↓
Alerts → GET /alerts/all
  ↓
Create Alert → POST /alerts/create
```

---

## Security

### Role-Based Access Control
- Users can only access routes matching their role
- JWT tokens stored in `localStorage`
- Protected routes check both auth and role
- Unauthorized access redirects to appropriate login page

### Token Management
- Stored in `localStorage` as `access_token`
- Included in `Authorization: Bearer {token}` header
- Automatic logout on 401 response
- 24-hour expiration

---

## Next Steps

1. **Connect Dashboards to ProtectedRoute**: Update `/app/doctor-dashboard/page.tsx` and `/app/epa-dashboard/page.tsx` to wrap content in `ProtectedRoute`

2. **Implement API Calls**: Use functions from `app/services/api.ts` in components

3. **Add Real Chat**: Connect chat UI to chatbot endpoints

4. **Add Image Upload**: Implement image upload for reports/analysis

5. **Add Maps**: Connect maps to heatmap data endpoint

6. **Environment Setup**: Set `NEXT_PUBLIC_API_URL` in production

---

## Testing

### Test Authentication
1. Register new user → Should redirect to onboarding
2. Login as regular user → Should access `/dashboard`
3. Login as doctor (health_admin) → Should access `/doctor-dashboard`
4. Login as EPA (epa_admin) → Should access `/epa-dashboard`
5. Access wrong dashboard → Should redirect to login

### Test API Connection
```typescript
import { submitReport, sendChatMessage } from '@/app/services/api'

// Submit report
const report = await submitReport("I have a headache", "Accra", 6.6885, -1.6244)
console.log('Report created:', report.chat_session_id)

// Send chat message
const response = await sendChatMessage(report.chat_session_id, "What should I do?", "en")
console.log('AI response:', response.ai_response)
```

