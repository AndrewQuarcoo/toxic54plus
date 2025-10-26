# Backend Connection Summary

## ✅ Completed Integration

Your frontend is now fully connected to the production backend at **https://toxitrace-backendx.onrender.com**

---

## 🔗 API Configuration

### Base URL
The frontend uses the production backend:
```
https://toxitrace-backendx.onrender.com
```

### Where it's configured:
- `app/services/api.ts` - Line 4
- `app/contexts/AuthContext.tsx` - Line 35

---

## 🔐 Authentication System

### 1. Login Pages
✅ **Regular Users**: `/login`
- Component: `components/LoginAuth.tsx`
- API: `POST /auth/login`
- Redirects to: `/dashboard`

✅ **Doctor Dashboard**: `/doctor-login`
- Component: `components/DoctorLoginAuth.tsx`
- API: `POST /auth/login`
- Required roles: `health_admin`, `super_admin`
- Redirects to: `/doctor-dashboard`

✅ **EPA Dashboard**: `/epa-login`
- Component: `components/EPALoginAuth.tsx`
- API: `POST /auth/login`
- Required roles: `epa_admin`, `super_admin`
- Redirects to: `/epa-dashboard`

### 2. Registration
✅ **User Signup**: `/signup`
- Component: `components/SignupAuth.tsx`
- API: `POST /auth/register`
- Redirects to: `/onboarding`

---

## 🛡️ Protected Routes

All dashboards are now wrapped with `ProtectedRoute` component:

### Regular Dashboard (`/dashboard`)
```typescript
<ProtectedRoute allowedRoles={['user', 'epa_admin', 'health_admin', 'super_admin']}>
  {/* Dashboard content */}
</ProtectedRoute>
```

### Doctor Dashboard (`/doctor-dashboard`)
```typescript
<ProtectedRoute allowedRoles={['health_admin', 'super_admin']} redirectPath="/doctor-login">
  {/* Doctor dashboard content */}
</ProtectedRoute>
```

### EPA Dashboard (`/epa-dashboard`)
```typescript
<ProtectedRoute allowedRoles={['epa_admin', 'super_admin']} redirectPath="/epa-login">
  {/* EPA dashboard content */}
</ProtectedRoute>
```

---

## 📡 API Endpoints Available

### Authentication Endpoints
| Endpoint | Method | Purpose | Component Usage |
|----------|--------|---------|-----------------|
| `/auth/login` | POST | User login | All login forms |
| `/auth/register` | POST | User registration | SignupAuth |
| `/auth/me` | GET | Get current user | AuthContext |

### Reports Endpoints (Mapped to Chat Frontend)
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/reports/create` | POST | Submit symptom report | ✅ Ready to use |
| `/reports/user/me` | GET | Get user's reports | ✅ Ready to use |
| `/reports/all` | GET | Get all reports (admin) | ✅ Ready to use |
| `/reports/{id}` | GET | Get specific report | ✅ Ready to use |
| `/reports/update-status/{id}` | PATCH | Update report status | ✅ Ready to use |

### Chatbot Endpoints
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/chatbot/sessions/report/{id}` | GET | Get chat session | ✅ Ready to use |
| `/chatbot/send` | POST | Send message | ✅ Ready to use |
| `/chatbot/sessions/{id}/history` | GET | Get chat history | ✅ Ready to use |

### Image Endpoints
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/images/upload` | POST | Upload image | ✅ Ready to use |

### Dashboard Endpoints
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/dashboard/summary` | GET | Get summary stats | ✅ Ready to use |
| `/dashboard/heatmap` | GET | Get heatmap data | ✅ Ready to use |

### Alert Endpoints
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/alerts/all` | GET | Get all alerts | ✅ Ready to use |
| `/alerts/create` | POST | Create alert (admin) | ✅ Ready to use |
| `/alerts/{id}/resolve` | PATCH | Resolve alert (admin) | ✅ Ready to use |

---

## 🎯 Next Steps to Complete Integration

### 1. Connect Chat UI to API (Priority)
**File**: `app/dashboard/chat/page.tsx`

Currently using mock data. Need to:
```typescript
import { getChatSession, sendChatMessage, submitReport } from '@/app/services/api'

// Replace mock with real API calls
const handleSendMessage = async (message: string) => {
  const response = await sendChatMessage(sessionId, message, 'en')
  setMessages([...messages, response])
}
```

### 2. Connect Doctor Dashboard to API
**Files**: 
- `app/doctor-dashboard/patients/page.tsx`
- `app/doctor-dashboard/analysis/page.tsx`
- `app/doctor-dashboard/reports/page.tsx`

Need to:
```typescript
import { getAllReports, getReport } from '@/app/services/api'

// Fetch all reports as patient cases
const reports = await getAllReports()
```

### 3. Connect EPA Dashboard to API
**Files**:
- `app/epa-dashboard/detection/page.tsx`
- `app/epa-dashboard/galamsey-map/page.tsx`
- `app/epa-dashboard/reports/page.tsx`

Need to:
```typescript
import { getAllReports, uploadImage, getAllAlerts } from '@/app/services/api'

// Fetch environmental reports
const reports = await getAllReports()
```

### 4. Connect Maps
**File**: `app/dashboard/maps/page.tsx`

Need to:
```typescript
import { getHeatmapData } from '@/app/services/api'

// Fetch toxicity heatmap data
const heatmapData = await getHeatmapData()
// Render map with coordinates
```

### 5. Implement Image Upload
Need to add file upload functionality:

```typescript
import { uploadImage } from '@/app/services/api'

const handleFileUpload = async (file: File) => {
  const image = await uploadImage(file, "Symptom evidence")
  console.log('Uploaded:', image)
}
```

---

## 🧪 Testing the Connection

### Test Authentication
```bash
# Register a new user
curl -X POST https://toxitrace-backendx.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "username": "test",
    "full_name": "Test User"
  }'

# Login
curl -X POST https://toxitrace-backendx.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test from Frontend
1. Open http://localhost:3000
2. Click "Sign Up"
3. Fill form and submit
4. Should redirect to `/onboarding`
5. Complete onboarding
6. Should redirect to `/dashboard`

---

## 🔍 Verification

### Backend is Running
✅ Confirmed: https://toxitrace-backendx.onrender.com/ returns:
```json
{
  "success": true,
  "message": "🌍 ToxiTrace API is running!",
  "version": "1.0.0",
  "docs": "/docs"
}
```

### Frontend Configuration
✅ API base URL set correctly
✅ Authentication endpoints configured
✅ All dashboards protected with role-based access
✅ Error handling implemented
✅ Loading states added

---

## 📋 Checklist

- [x] Update API base URL to production
- [x] Wrap dashboards with ProtectedRoute
- [x] Add error handling to auth forms
- [x] Add loading states to auth forms
- [x] Connect SignupAuth to API
- [x] Connect LoginAuth to API
- [ ] Connect Chat UI to chatbot API
- [ ] Connect Doctor Dashboard to reports API
- [ ] Connect EPA Dashboard to reports API
- [ ] Connect Maps to heatmap API
- [ ] Implement image upload

---

## 🚀 Deployment Notes

### For Cloudflare Pages:
1. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://toxitrace-backendx.onrender.com
   ```
2. Redeploy
3. Test authentication flow

### Backend URL
- Production: https://toxitrace-backendx.onrender.com
- Docs: https://toxitrace-backendx.onrender.com/docs

---

## 📚 Reference Documentation

- `ARCHITECTURE.md` - Complete backend API documentation
- `FRONTEND_BACKEND_MAPPING.md` - Frontend-backend mapping
- Backend docs: https://toxitrace-backendx.onrender.com/docs

---

## 💡 Important Notes

1. **All IDs are UUID strings**, not numbers (see ARCHITECTURE.md)
2. **JWT tokens** are stored in localStorage
3. **Automatic logout** on 401 response
4. **Role-based access** enforced on protected routes
5. **Bilingual chat** supported (English ↔ Twi)

---

## ✅ Current Status

**Frontend**: ✅ Ready  
**Backend**: ✅ Running  
**Authentication**: ✅ Connected  
**API Service Layer**: ✅ Implemented  
**Protected Routes**: ✅ Active  
**UI Components**: ✅ Ready  
**Integration**: 🟡 In Progress (50% complete)

**Next**: Connect UI components to API endpoints

