# Pages Connection Status

## ✅ Completed Connections

### 1. Authentication Pages
- ✅ `/login` → Connected to `POST /auth/login`
- ✅ `/signup` → Connected to `POST /auth/register`  
- ✅ `/doctor-login` → Connected to `POST /auth/login` + role check
- ✅ `/epa-login` → Connected to `POST /auth/login` + role check
- ✅ `/onboarding` → Fully implemented

### 2. Main Dashboard Pages
- ✅ `/dashboard` → Protected with `ProtectedRoute`
- ✅ `/dashboard/chat` → Ready for API integration (needs backend connection)
- ✅ `/dashboard/check` → Standalone health check form
- ✅ `/dashboard/results` → Local storage based (galamsey processing)
- ✅ `/dashboard/maps` → Using galamseyDetectionService (local processing)

### 3. Doctor Dashboard Pages
- ✅ `/doctor-dashboard` → Protected with role `health_admin`, `super_admin`
- ✅ `/doctor-dashboard/patients` → **Connected to `GET /reports/all`** ✅
- ⏳ `/doctor-dashboard/analysis` → Ready, needs API integration
- ⏳ `/doctor-dashboard/reports` → Ready, needs API integration

### 4. EPA Dashboard Pages
- ✅ `/epa-dashboard` → Protected with role `epa_admin`, `super_admin`
- ⏳ `/epa-dashboard/detection` → Ready, needs image upload API
- ⏳ `/epa-dashboard/galamsey-map` → Mock data, needs real data
- ✅ `/epa-dashboard/reports` → **Connected to `GET /reports/all`** ✅

---

## 🔄 In Progress

### Chat Integration
**File**: `app/dashboard/chat/page.tsx`
- **Status**: UI ready, needs API connection
- **Required APIs**:
  - `POST /reports/create` - Submit symptom report
  - `GET /chatbot/sessions/report/{id}` - Get chat session
  - `POST /chatbot/send` - Send messages

### Maps Integration
**File**: `app/dashboard/maps/page.tsx`
- **Status**: Using local galamseyDetectionService
- **Required API**: 
  - `GET /dashboard/heatmap` - Get toxicity heatmap data

### EPA Galamsey Map
**File**: `app/epa-dashboard/galamsey-map/page.tsx`
- **Status**: Mock data
- **Required API**: `GET /dashboard/heatmap`

---

## ❌ Not Connected Yet

### Doctor Dashboard
- `/doctor-dashboard/analysis` - Needs image upload API
- `/doctor-dashboard/reports` - Needs statistics API

### EPA Dashboard
- `/epa-dashboard/detection` - Needs image upload API
- `/epa-dashboard/galamsey-map` - Needs heatmap API

### Main Dashboard
- `/dashboard/check` - Standalone (no API needed)

---

## 🎯 Next Steps Priority

### HIGH PRIORITY
1. **Connect Chat UI** (`/dashboard/chat`)
   - Map to `POST /reports/create` (symptoms → report)
   - Map to chatbot endpoints for AI responses
   - This is the CORE feature

2. **Connect Image Upload**
   - Dashboard capture → `POST /images/upload`
   - Doctor analysis → `POST /images/upload`
   - EPA detection → `POST /images/upload`

### MEDIUM PRIORITY
3. **Connect Heatmap Data**
   - `/dashboard/maps` → `GET /dashboard/heatmap`
   - `/epa-dashboard/galamsey-map` → `GET /dashboard/heatmap`

4. **Connect Statistics**
   - `/doctor-dashboard/reports` → `GET /dashboard/summary`
   - `/epa-dashboard/reports` → Stats already calculated from reports

### LOW PRIORITY
5. **Health Check Page**
   - `/dashboard/check` - Keep standalone or connect to optional health API

---

## 📊 Connection Summary

| Page | API Endpoint | Status | Action Needed |
|------|--------------|--------|---------------|
| `/login` | `POST /auth/login` | ✅ Connected | None |
| `/signup` | `POST /auth/register` | ✅ Connected | None |
| `/doctor-login` | `POST /auth/login` | ✅ Connected | None |
| `/epa-login` | `POST /auth/login` | ✅ Connected | None |
| `/dashboard` | Protected | ✅ Protected | None |
| `/dashboard/chat` | `POST /reports/create`, `/chatbot/*` | ⏳ Ready | Connect to API |
| `/dashboard/check` | None | ✅ Standalone | None |
| `/dashboard/results` | localStorage | ✅ Working | None |
| `/dashboard/maps` | `GET /dashboard/heatmap` | ⏳ Ready | Connect to API |
| `/doctor-dashboard` | Protected | ✅ Protected | None |
| `/doctor-dashboard/patients` | `GET /reports/all` | ✅ Connected | None |
| `/doctor-dashboard/analysis` | `POST /images/upload` | ⏳ Ready | Connect image upload |
| `/doctor-dashboard/reports` | `GET /dashboard/summary` | ⏳ Ready | Connect stats API |
| `/epa-dashboard` | Protected | ✅ Protected | None |
| `/epa-dashboard/detection` | `POST /images/upload` | ⏳ Ready | Connect image upload |
| `/epa-dashboard/galamsey-map` | `GET /dashboard/heatmap` | ⏳ Ready | Connect to API |
| `/epa-dashboard/reports` | `GET /reports/all` | ✅ Connected | None |

---

## 🔧 Files That Need API Integration

1. `app/dashboard/chat/page.tsx` - Connect to chatbot API
2. `app/dashboard/maps/page.tsx` - Connect to heatmap API  
3. `app/doctor-dashboard/analysis/page.tsx` - Connect to image upload
4. `app/doctor-dashboard/reports/page.tsx` - Connect to dashboard summary
5. `app/epa-dashboard/detection/page.tsx` - Connect to image upload
6. `app/epa-dashboard/galamsey-map/page.tsx` - Connect to heatmap API

---

## 🎨 Components Ready for Integration

All the UI components are ready. They just need to:
1. Import API functions from `app/services/api.ts`
2. Call the appropriate endpoints
3. Handle loading/error states
4. Update UI with real data

---

## 📝 Notes

- Most pages are already using mock data that matches API structure
- All TypeScript interfaces are already defined in `app/services/api.ts`
- Protected routes are working correctly
- Authentication is fully connected
- The hardest part (architectural setup) is done!

