# 📱 ToxiTrace API Endpoints Guide
## Complete Mapping: Mobile App → Backend API

---

## 🔐 **AUTHENTICATION ENDPOINTS** (`/auth`)

### 1. **POST /auth/register**
**Mobile Screen:** Registration Screen  
**Purpose:** Create new user account  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+233501234567",
  "language": "tw",  // "en" or "tw" (Twi)
  "location": "Kumasi",
  "latitude": 6.6885,
  "longitude": -1.6244,
  "region": "Ashanti"
}
```
**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "language": "tw",
    "role": "USER"
  }
}
```

---

### 2. **POST /auth/login**
**Mobile Screen:** Login Screen  
**Purpose:** Authenticate existing user  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:** Same as registration (returns JWT token + user info)

---

### 3. **GET /auth/me**
**Mobile Screen:** Profile Screen, App Startup  
**Purpose:** Get current user details  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "language": "tw",
  "location": "Kumasi",
  "region": "Ashanti",
  "role": "USER",
  "is_active": true
}
```

---

## 📝 **REPORT ENDPOINTS** (`/reports`)

### 4. **POST /reports/submit**
**Mobile Screen:** Symptom Report Screen (Text Input)  
**Purpose:** Submit text-based symptom report with AI analysis  
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "original_input": "Me nko wo m'adze me ti",  // User's input (can be Twi or English)
  "input_language": "tw",  // "en" or "tw"
  "input_type": "text",
  "location": "Obuasi Gold Mine Area",
  "latitude": 6.2000,
  "longitude": -1.6667,
  "region": "Ashanti"
}
```
**Backend Processing Flow:**
1. **Translation** (if Twi): Twi → English using Google Translate API
2. **NLP Extraction**: Extract symptoms using spaCy
3. **AI Classification**: Classify toxicity likelihood (MILD/MODERATE/SEVERE)
4. **Diagnosis Generation**: Generate AI diagnosis (English)
5. **Twi Translation**: Translate diagnosis back to Twi (if user prefers)

**Response:**
```json
{
  "id": 1,
  "original_input": "Me nko wo m'adze me ti",
  "translated_input": "My head hurts and I feel dizzy",  // English translation
  "input_language": "tw",
  "symptoms": ["headache", "dizziness", "nausea"],
  "toxicity_likelihood": "MODERATE",
  "possible_causes": ["Mercury poisoning", "Heavy metal exposure"],
  "confidence_score": 0.78,
  "ai_diagnosis": "Based on symptoms, possible mercury contamination exposure",  // English
  "ai_diagnosis_twi": "Εdeε εte sε mercury fi contamination mu",  // Twi translation
  "location": "Obuasi Gold Mine Area",
  "region": "Ashanti",
  "status": "PENDING",
  "created_at": "2025-10-26T10:30:00Z"
}
```

---

### 5. **GET /reports/user**
**Mobile Screen:** User's Report History Screen  
**Purpose:** Get all reports submitted by current user  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Results per page (default: 10)

**Response:**
```json
{
  "total": 25,
  "page": 1,
  "page_size": 10,
  "reports": [
    {
      "id": 5,
      "original_input": "...",
      "symptoms": ["headache", "tremors"],
      "toxicity_likelihood": "SEVERE",
      "ai_diagnosis": "...",
      "ai_diagnosis_twi": "...",  // Twi translation
      "status": "INVESTIGATING",
      "created_at": "2025-10-26T10:30:00Z"
    }
    // ... more reports
  ]
}
```

---

### 6. **GET /reports/{report_id}**
**Mobile Screen:** Report Detail Screen  
**Purpose:** Get detailed information about a specific report  
**Headers:** `Authorization: Bearer <token>`  
**Response:** Single report object (same structure as POST /reports/submit)

---

### 7. **GET /reports/all** *(Admin Only)*
**Mobile Screen:** Admin Dashboard → All Reports  
**Purpose:** EPA/Health admins view all reports  
**Headers:** `Authorization: Bearer <token>`  
**Filters:** `?status=PENDING&region=Ashanti&page=1`

---

## 📸 **IMAGE ENDPOINTS** (`/images`)

### 8. **POST /images/upload**
**Mobile Screen:** Image Upload Screen (Camera/Gallery)  
**Purpose:** Upload image for AI contamination detection  
**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`  
**Form Data:**
- `file`: Image file (PNG/JPG/JPEG)
- `image_type`: "plant" | "soil" | "water" | "fish" | "other"
- `location`: Location description

**Backend Processing Flow:**
1. **Save Image**: Store in `./uploads/` directory
2. **AI Classification**: 
   - **Stage 1**: CLIP zero-shot triage (plant/human/environmental)
   - **Stage 2**: MobileNetV2 for plant disease detection
   - **Stage 3**: Diagnosis synthesis
3. **Extract Results**: Prediction, confidence, contaminant type
4. **Persist to DB**: Save all analysis details
5. **Twi Translation** (if user prefers): Translate diagnosis to Twi

**Response:**
```json
{
  "id": 2,
  "user_id": 1,
  "image_url": "./uploads/63cd6705-e03c-4237-bc72-4709d27e2434.png",
  "image_type": "water",
  "prediction": "PROBABLE: Mercury contamination detected - High risk",  // English
  "prediction_twi": "Εdeε εte sε mercury contamination wɔ hɔ - Risk kεseε",  // Twi (dynamic)
  "confidence": 0.87,
  "toxicity_detected": true,
  "contaminant_type": "mercury",
  "location": "Kumasi Water Treatment Plant",
  "region": "Ashanti",
  "created_at": "2025-10-26T11:00:00Z"
}
```

**Note:** If user's language is `"tw"`, the response automatically includes `prediction_twi` field with Twi translation.

---

### 9. **GET /images/all**
**Mobile Screen:** User's Image Gallery  
**Purpose:** Get all images uploaded by current user  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": 2,
    "image_url": "./uploads/abc123.png",
    "prediction": "Mercury contamination",
    "confidence": 0.87,
    "toxicity_detected": true,
    "created_at": "2025-10-26T11:00:00Z"
  }
  // ... more images
]
```

---

### 10. **GET /images/{image_id}**
**Mobile Screen:** Image Detail Screen  
**Purpose:** Get detailed analysis of specific image  
**Headers:** `Authorization: Bearer <token>`  
**Response:** Single image object (full details)

---

## � **CHATBOT ENDPOINTS** (`/chat`)

### 19. **POST /chat/sessions/create**
**Mobile Screen:** Report/Image Result → "Chat with AI" Button  
**Purpose:** Create a chat session after diagnosis (from report or image)  
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "trigger_type": "report",  // "report" or "image"
  "trigger_id": "abc-123-uuid",  // Report ID or Image ID (UUID string)
  "language": "tw"  // Optional: "en" or "tw" (defaults to user's preference)
}
```

**🔄 Complete Flow from Report to Chat:**
```
1. User submits report: POST /reports/submit
   └─> Returns: { id: "uuid-123", ai_diagnosis: "..." }
   
2. Mobile shows diagnosis with "Ask AI Questions" button

3. User taps button → POST /chat/sessions/create
   └─> Body: { trigger_type: "report", trigger_id: "uuid-123" }
   
4. Backend creates session + AI sends first greeting automatically
   └─> Returns: { id: "session-uuid", message_count: 1 }
   
5. Mobile fetches session: GET /chat/sessions/{session-uuid}
   └─> Returns: { messages: [{ role: "assistant", content: "Hello!..." }] }
   
6. Display chat screen with AI's greeting already visible
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 15,
  "trigger_type": "report",
  "trigger_id": "abc-123-uuid",
  "report_id": "abc-123-uuid",
  "image_id": null,
  "language": "tw",
  "is_active": true,
  
  "initial_diagnosis": "High likelihood of mercury contamination based on symptoms",
  "contaminant_type": "Mercury",
  "symptoms": ["headache", "tremors", "metallic taste"],
  "location": "Obuasi Gold Mine Area",
  "region": "Ashanti",
  
  "message_count": 1,
  "created_at": "2025-10-26T12:00:00Z",
  "last_interaction": "2025-10-26T12:00:00Z",
  "closed_at": null
}
```

**Important Notes:**
- ✅ **AI sends first message automatically** - Greeting references diagnosis
- ✅ **Prevents duplicates** - If active session exists for this report/image, returns existing session
- ✅ **Context preserved** - Initial diagnosis, contaminant type, symptoms saved for AI memory

---

### 20. **POST /chat/messages/send**
**Mobile Screen:** Chat Screen → Send Message  
**Purpose:** User sends message to AI, receives context-aware response  
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "What should I do now? Is this dangerous?",
  "language": "en"  // "en" or "tw" - language user is typing in
}
```

**Backend Processing Flow:**
1. **Fetch Context**: Load session context (diagnosis, contaminant, symptoms, location)
2. **Build AI Prompt**: Include context in system prompt
   ```
   System: You are a medical advisor. User has mercury poisoning with symptoms: headache, tremors.
   Location: Obuasi Gold Mine Area. Provide guidance in English.
   ```
3. **Call Gemini 2.0 Flash**: Context-aware response generation
4. **Translation** (if needed): Translate response to Twi if user's language is "tw"
5. **Generate Suggested Questions**: Dynamic follow-ups based on conversation
6. **Save Both Messages**: User message + AI response to database

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_message": {
    "id": 45,
    "role": "user",
    "content": "What should I do now? Is this dangerous?",
    "content_twi": null,
    "language": "en",
    "created_at": "2025-10-26T12:05:00Z"
  },
  "assistant_message": {
    "id": 46,
    "role": "assistant",
    "content": "Yes, mercury poisoning is dangerous and requires immediate attention. Here's what you should do now:\n\n**1. Seek Medical Attention:** Visit the nearest hospital immediately...",
    "content_twi": "Aane, mercury poisoning yɛ hu na ɛhia sɛ wohwɛ no ntɛm. Deɛ ɛsɛ sɛ woyɛ seesei nie:\n\n**1. Kɔ Ayaresabea:** Kɔ ayaresabea a ɛbɛn wo ntɛm...",
    "language": "en",
    "created_at": "2025-10-26T12:05:03Z",
    "response_time_ms": 2847
  },
  "suggested_questions": [
    "How serious is mercury poisoning?",
    "How can I protect my family?",
    "Should I go to the hospital now?",
    "What is mercury contamination?",
    "Are there any immediate first aid steps?"
  ]
}
```

**Mobile UI Integration:**
```javascript
// Display user message immediately
displayMessage(response.user_message);

// Show "AI is typing..." indicator
showTypingIndicator();

// Display AI response
displayMessage(response.assistant_message);
hideTypingIndicator();

// Show suggested questions as chips/buttons
renderSuggestedQuestions(response.suggested_questions);
```

---

### 21. **GET /chat/sessions/{session_id}**
**Mobile Screen:** Chat Screen Load, Resume Chat  
**Purpose:** Get session details + full conversation history  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 15,
  "trigger_type": "report",
  "trigger_id": "abc-123-uuid",
  "language": "en",
  "is_active": true,
  
  "initial_diagnosis": "High likelihood of mercury contamination",
  "contaminant_type": "Mercury",
  "symptoms": ["headache", "tremors", "metallic taste"],
  "location": "Obuasi Gold Mine Area",
  "region": "Ashanti",
  
  "message_count": 6,
  "created_at": "2025-10-26T12:00:00Z",
  "last_interaction": "2025-10-26T12:15:00Z",
  
  "messages": [
    {
      "id": 1,
      "role": "assistant",
      "content": "Hello! I've analyzed your symptoms (headache, tremors, metallic taste) and believe there's a high likelihood of mercury contamination...",
      "content_twi": "Akwaaba! Mahwɛ wo symptoms (ti ɛyare, ho wosaw, taste a ɛte sɛ metal) na migye di sɛ mercury contamination...",
      "created_at": "2025-10-26T12:00:00Z"
    },
    {
      "id": 2,
      "role": "user",
      "content": "What should I do now?",
      "created_at": "2025-10-26T12:05:00Z"
    },
    {
      "id": 3,
      "role": "assistant",
      "content": "Here's what you should do immediately: 1. Seek medical attention...",
      "content_twi": "Deɛ ɛsɛ sɛ woyɛ ntɛm nie: 1. Kɔ ayaresabea...",
      "created_at": "2025-10-26T12:05:03Z"
    }
    // ... more messages
  ]
}
```

**Use Cases:**
- Load chat when user opens chat screen
- Resume conversation when user returns to chat
- Show full conversation history in scrollable view

---

### 22. **GET /chat/sessions/user/all**
**Mobile Screen:** Chat History Screen, Home → "My Conversations"  
**Purpose:** Get all chat sessions for current user  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `active_only` (optional): `true` | `false` (default: false)
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Results per page (default: 10)

**Response:**
```json
{
  "total": 5,
  "page": 1,
  "page_size": 10,
  "sessions": [
    {
      "id": "uuid-1",
      "trigger_type": "image",
      "initial_diagnosis": "Mercury contamination detected in water sample",
      "contaminant_type": "Mercury",
      "message_count": 8,
      "is_active": true,
      "language": "tw",
      "last_interaction": "2025-10-26T14:30:00Z",
      "created_at": "2025-10-26T12:00:00Z"
    },
    {
      "id": "uuid-2",
      "trigger_type": "report",
      "initial_diagnosis": "Moderate cyanide exposure likelihood",
      "contaminant_type": "Cyanide",
      "message_count": 12,
      "is_active": false,
      "language": "en",
      "last_interaction": "2025-10-25T18:22:00Z",
      "created_at": "2025-10-25T16:00:00Z",
      "closed_at": "2025-10-25T19:00:00Z"
    }
  ]
}
```

**Mobile UI Design:**
```
┌─────────────────────────────────────┐
│  My Conversations                   │
├─────────────────────────────────────┤
│  🔴 Mercury Contamination           │
│     8 messages • Active             │
│     Last: 2 hours ago               │
│     "What should I do now?"         │
├─────────────────────────────────────┤
│  ⚫ Cyanide Exposure                 │
│     12 messages • Closed            │
│     Last: Yesterday at 6:22 PM      │
│     "Thank you for the advice"      │
└─────────────────────────────────────┘
```

---

### 23. **PUT /chat/sessions/{session_id}/close**
**Mobile Screen:** Chat Screen → "Close Conversation" Button  
**Purpose:** Mark chat session as closed (stops appearing in active list)  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "success": true,
  "message": "Chat session closed successfully",
  "session_id": "uuid",
  "closed_at": "2025-10-26T15:00:00Z"
}
```

**Note:** Closed sessions can still be reopened by sending new message.

---

### 24. **DELETE /chat/sessions/{session_id}**
**Mobile Screen:** Chat History → Swipe to Delete  
**Purpose:** Permanently delete chat session and all messages  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "success": true,
  "message": "Chat session and 8 messages deleted successfully"
}
```

**Warning:** This is permanent! All messages are deleted from database.

---

## 🔄 **COMPLETE USER JOURNEY: Report → Chat**

### **Scenario 1: Text Report → Chat**

```typescript
// 1. User submits text report
const submitReport = async () => {
  const response = await fetch(`${API_URL}/reports/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      original_input: "Me nko wo m'adze me ti",
      input_language: "tw",
      input_type: "text",
      location: "Kumasi",
      region: "Ashanti"
    })
  });
  
  const report = await response.json();
  return report;
  // Returns: { id: "uuid-123", ai_diagnosis: "High likelihood...", symptoms: [...] }
};

// 2. Show diagnosis screen with "Ask AI Questions" button
const showDiagnosis = (report) => {
  // Display: report.ai_diagnosis_twi (Twi) or report.ai_diagnosis (English)
  // Show button: "Bisa AI Nsɛmma" (Ask AI Questions)
};

// 3. User taps "Ask AI Questions" → Create chat session
const startChat = async (reportId) => {
  const response = await fetch(`${API_URL}/chat/sessions/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      trigger_type: "report",
      trigger_id: reportId,
      language: "tw"
    })
  });
  
  const session = await response.json();
  return session;
  // Returns: { id: "session-uuid", message_count: 1, ... }
};

// 4. Load chat screen with AI's greeting
const loadChatScreen = async (sessionId) => {
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const chatData = await response.json();
  
  // AI's greeting is already in messages[0]
  const aiGreeting = chatData.messages[0];
  displayMessage(aiGreeting);
  // Shows: "Akwaaba! Mahwɛ wo symptoms na migye di sɛ mercury contamination..."
};

// 5. User sends message
const sendMessage = async (sessionId, userInput) => {
  const response = await fetch(`${API_URL}/chat/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId,
      content: userInput,
      language: "tw"
    })
  });
  
  const result = await response.json();
  
  // Display user message
  displayMessage(result.user_message);
  
  // Display AI response
  displayMessage(result.assistant_message);
  
  // Show suggested questions
  renderSuggestedQuestions(result.suggested_questions);
};
```

---

### **Scenario 2: Image Upload → Chat**

```typescript
// 1. User uploads image
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('image_type', 'water');
  formData.append('location', 'Kumasi');
  formData.append('region', 'Ashanti');
  
  const response = await fetch(`${API_URL}/images/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const image = await response.json();
  return image;
  // Returns: { 
  //   id: "uuid-456", 
  //   prediction: "PROBABLE: Mercury contamination - High risk",
  //   prediction_twi: "Εdeε εte sε mercury contamination wɔ hɔ",
  //   confidence: 0.87,
  //   contaminant_type: "mercury"
  // }
};

// 2. Show image analysis with "Chat with AI" button
const showAnalysis = (image) => {
  // Display: image.prediction_twi (if Twi) or image.prediction (English)
  // Show confidence: `${(image.confidence * 100).toFixed(0)}%`
  // Show button: "Kasa ne AI" (Chat with AI)
};

// 3. User taps "Chat with AI" → Create chat session
const startChatFromImage = async (imageId) => {
  const response = await fetch(`${API_URL}/chat/sessions/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      trigger_type: "image",
      trigger_id: imageId,
      language: "tw"
    })
  });
  
  const session = await response.json();
  return session;
  // Returns: { id: "session-uuid", message_count: 1, initial_diagnosis: "..." }
};

// 4-5. Same as Scenario 1: Load chat screen and start conversation
```

---

### **Scenario 3: Resume Existing Chat**

```typescript
// User opens "My Conversations" and taps a previous chat
const resumeChat = async (sessionId) => {
  // Load full conversation history
  const response = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const chatData = await response.json();
  
  // Display all messages in chronological order
  chatData.messages.forEach(msg => {
    displayMessage(msg);
  });
  
  // User can continue conversation by sending new messages
  // Uses same sendMessage() function as above
};
```

---

## �🚨 **ALERT ENDPOINTS** (`/alerts`)

### 11. **GET /alerts/active**
**Mobile Screen:** Home Screen → Alert Banner, Alerts Screen  
**Purpose:** Get active contamination alerts for user's region  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `region` (optional): Filter by region
- `risk_level` (optional): LOW | MODERATE | HIGH | CRITICAL

**Response:**
```json
[
  {
    "id": 1,
    "title": "⚠️ Mercury Contamination Alert - Obuasi",
    "message": "High levels of mercury detected in water sources near gold mining areas",
    "risk_level": "HIGH",
    "region": "Ashanti",
    "latitude": 6.2000,
    "longitude": -1.6667,
    "affected_radius_km": 15.0,
    "report_count": 12,
    "common_symptoms": ["headache", "tremors", "nausea"],
    "suspected_contaminant": "Mercury",
    "created_at": "2025-10-25T08:00:00Z"
  }
]
```

---

### 12. **POST /alerts/create** *(Admin Only)*
**Mobile Screen:** Admin Dashboard → Create Alert  
**Purpose:** EPA/Health admins manually create alerts  
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "title": "Mercury Warning - Obuasi Region",
  "message": "High mercury levels detected...",
  "risk_level": "HIGH",
  "region": "Ashanti",
  "affected_radius_km": 15.0,
  "suspected_contaminant": "Mercury"
}
```

---

### 13. **PUT /alerts/{alert_id}/resolve** *(Admin Only)*
**Mobile Screen:** Admin Dashboard → Resolve Alert  
**Purpose:** Mark alert as resolved  
**Headers:** `Authorization: Bearer <token>`

---

## 📊 **DASHBOARD ENDPOINTS** (`/dashboard`)

### 14. **GET /dashboard/summary** *(Admin Only)*
**Mobile Screen:** Admin Dashboard → Overview  
**Purpose:** Get system-wide statistics  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "total_reports": 1250,
  "pending_reports": 85,
  "investigating_reports": 42,
  "resolved_reports": 1123,
  "active_alerts": 3,
  "high_risk_regions": [
    {"region": "Ashanti", "report_count": 45, "risk_score": 0.78}
  ],
  "recent_contamination_types": {
    "mercury": 35,
    "cyanide": 22,
    "lead": 18
  },
  "reports_last_24h": 12,
  "reports_last_7d": 87
}
```

---

### 15. **GET /dashboard/heatmap**
**Mobile Screen:** Admin Dashboard → Map View  
**Purpose:** Get geographical contamination data for heatmap  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "latitude": 6.2000,
    "longitude": -1.6667,
    "toxicity_level": "HIGH",
    "report_count": 12,
    "region": "Ashanti"
  }
  // ... more points
]
```

---

### 16. **GET /dashboard/trends**
**Mobile Screen:** Admin Dashboard → Trends Graph  
**Purpose:** Get time-series contamination trends  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `period`: "daily" | "weekly" | "monthly"
- `days`: Number of days to fetch (default: 30)

---

## 🏥 **HEALTH CHECK ENDPOINTS**

### 25. **GET /**
**Purpose:** API health check  
**Response:**
```json
{
  "success": true,
  "message": "🌍 ToxiTrace API is running!",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

### 26. **GET /health**
**Purpose:** System health monitoring  
**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 🔐 **REQUEST/RESPONSE OBJECT SCHEMAS**

### **User Objects:**

#### **UserCreate (Registration Request):**
```typescript
interface UserCreate {
  email: string;           // Valid email format
  password: string;        // Min 8 chars, must include uppercase, lowercase, number
  name: string;            // Full name
  phone?: string;          // Optional: International format (+233...)
  language?: "en" | "tw";  // Optional: Default "en"
  location?: string;       // Optional: User's location
  latitude?: number;       // Optional: GPS coordinate
  longitude?: number;      // Optional: GPS coordinate
  region?: string;         // Optional: Ghana region
}
```

#### **UserLogin (Login Request):**
```typescript
interface UserLogin {
  email: string;
  password: string;
}
```

#### **UserResponse (Authentication Response):**
```typescript
interface UserResponse {
  access_token: string;    // JWT token (valid 24 hours)
  token_type: "bearer";
  user: {
    id: number;
    email: string;
    name: string;
    language: "en" | "tw";
    role: "USER" | "EPA_ADMIN" | "HEALTH_ADMIN" | "SUPER_ADMIN";
    is_active: boolean;
    created_at: string;    // ISO 8601 timestamp
  };
}
```

---

### **Report Objects:**

#### **ReportCreate (Submit Report Request):**
```typescript
interface ReportCreate {
  original_input: string;              // User's symptom description
  input_language: "en" | "tw";         // Language user typed in
  input_type: "text" | "audio";        // Input method
  location?: string;                   // Location description
  latitude?: number;                   // GPS coordinate
  longitude?: number;                  // GPS coordinate
  region?: string;                     // Ghana region
}
```

#### **ReportResponse (Report with AI Analysis):**
```typescript
interface ReportResponse {
  id: string;                          // UUID format
  user_id: number;
  
  original_input: string;              // User's original input
  translated_input?: string;           // English translation (if Twi input)
  input_language: "en" | "tw";
  input_type: "text" | "audio";
  
  symptoms: string[];                  // Extracted symptoms
  toxicity_likelihood: "MILD" | "MODERATE" | "SEVERE" | "UNKNOWN";
  possible_causes: string[];
  confidence_score: number;            // 0.0 to 1.0
  
  ai_diagnosis: string;                // English diagnosis
  ai_diagnosis_twi?: string;           // Twi translation (if user language is "tw")
  
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "FALSE_ALARM";
  created_at: string;                  // ISO 8601
  updated_at: string;
}
```

---

### **Image Objects:**

#### **ImageUpload (Multipart Form Data):**
```typescript
interface ImageUploadForm {
  file: File;                          // PNG/JPG/JPEG, max 10MB
  image_type: "plant" | "soil" | "water" | "fish" | "other";
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
}
```

#### **ImageResponse (Image Analysis Result):**
```typescript
interface ImageResponse {
  id: string;                          // UUID format
  user_id: number;
  
  image_url: string;                   // Server path: ./uploads/uuid.png
  image_type: "plant" | "soil" | "water" | "fish" | "other";
  
  prediction: string;                  // English: "PROBABLE: Mercury contamination - High risk"
  prediction_twi?: string;             // Twi translation (if user language is "tw")
  confidence: number;                  // 0.0 to 1.0
  
  toxicity_detected: boolean;
  contaminant_type?: string;           // "mercury", "cyanide", "lead", etc.
  
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  
  created_at: string;                  // ISO 8601
}
```

---

### **Chat Objects:**

#### **ChatSessionCreate (Create Session Request):**
```typescript
interface ChatSessionCreate {
  trigger_type: "report" | "image";    // What triggered the chat
  trigger_id: string;                  // UUID of report or image
  language?: "en" | "tw";              // Optional: defaults to user's preference
}
```

#### **ChatSessionResponse (Session with Context):**
```typescript
interface ChatSessionResponse {
  id: string;                          // UUID format
  user_id: number;
  
  trigger_type: "report" | "image";
  trigger_id: string;
  report_id?: string;                  // Set if trigger_type = "report"
  image_id?: string;                   // Set if trigger_type = "image"
  
  language: "en" | "tw";
  is_active: boolean;
  
  // Context for AI memory
  initial_diagnosis: string;
  contaminant_type?: string;
  symptoms?: string[];
  location?: string;
  region?: string;
  
  // Session stats
  message_count: number;
  created_at: string;
  last_interaction: string;
  closed_at?: string;
  
  // Only included in GET /chat/sessions/{id}
  messages?: ChatMessage[];
}
```

#### **ChatMessageSend (Send Message Request):**
```typescript
interface ChatMessageSend {
  session_id: string;                  // UUID of chat session
  content: string;                     // User's message
  language: "en" | "tw";               // Language user is typing in
}
```

#### **ChatMessageResponse (Chat Turn):**
```typescript
interface ChatMessageResponse {
  session_id: string;
  
  user_message: {
    id: number;
    role: "user";
    content: string;                   // User's message
    content_twi?: string;              // Twi translation (if input was English)
    language: "en" | "tw";
    created_at: string;
  };
  
  assistant_message: {
    id: number;
    role: "assistant";
    content: string;                   // AI response (English)
    content_twi?: string;              // Twi translation (if user language is "tw")
    language: "en" | "tw";
    created_at: string;
    response_time_ms: number;          // How long AI took to respond
  };
  
  suggested_questions: string[];       // Dynamic follow-up questions
}
```

#### **ChatMessage (Individual Message):**
```typescript
interface ChatMessage {
  id: number;
  session_id: string;
  
  role: "user" | "assistant";
  content: string;                     // Primary content (English or user input)
  content_twi?: string;                // Twi translation (if applicable)
  language: "en" | "tw";
  
  created_at: string;
  tokens_used?: number;                // Gemini API tokens
  response_time_ms?: number;           // Response latency
}
```

---

### **Alert Objects:**

#### **AlertResponse:**
```typescript
interface AlertResponse {
  id: number;
  
  title: string;                       // Alert headline
  message: string;                     // Detailed description
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  
  region?: string;
  latitude?: number;
  longitude?: number;
  affected_radius_km?: number;
  
  report_count: number;                // How many reports triggered this
  common_symptoms: string[];
  suspected_contaminant?: string;
  
  is_active: boolean;
  created_at: string;
  resolved_at?: string;
}
```

---

## 🔄 **ERROR RESPONSES**

### **Standard Error Format:**
```typescript
interface ErrorResponse {
  detail: string;                      // Human-readable error message
  status_code: number;                 // HTTP status code
  error_code?: string;                 // Optional: Machine-readable code
}
```

### **Common Error Codes:**

#### **401 Unauthorized:**
```json
{
  "detail": "Invalid or expired token",
  "status_code": 401
}
```
**Fix:** User needs to login again

#### **403 Forbidden:**
```json
{
  "detail": "You don't have permission to access this resource",
  "status_code": 403
}
```
**Fix:** User doesn't have required role (e.g., not an admin)

#### **404 Not Found:**
```json
{
  "detail": "Report with id 'abc-123' not found",
  "status_code": 404
}
```
**Fix:** Invalid resource ID or resource deleted

#### **422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ],
  "status_code": 422
}
```
**Fix:** Fix request body validation errors

#### **500 Internal Server Error:**
```json
{
  "detail": "An unexpected error occurred. Please try again later.",
  "status_code": 500
}
```
**Fix:** Backend issue, contact support

---

## 🌍 **BILINGUAL SUPPORT (Twi Integration)**

### How Translation Works Across Endpoints:

#### **Text Reports** (`POST /reports/submit`):
1. User submits in Twi → Backend translates to English
2. AI processes in English
3. Response includes both English + Twi diagnosis

#### **Image Analysis** (`POST /images/upload`):
1. AI processes image (English diagnosis)
2. If user's language = `"tw"`, response includes `prediction_twi`
3. Translation done dynamically at response time

#### **User Language Preference:**
- Set during registration: `"language": "tw"` or `"en"`
- Retrieved from `GET /auth/me`
- Used to determine response language

---

## 📱 **Mobile App → API Mapping Summary**

| **Mobile Screen** | **API Endpoint** | **Purpose** |
|-------------------|------------------|-------------|
| **Registration** | `POST /auth/register` | Create account |
| **Login** | `POST /auth/login` | Authenticate |
| **Profile** | `GET /auth/me` | Get user info |
| **Report Symptoms (Text)** | `POST /reports/submit` | Submit text report with AI analysis |
| **Upload Image** | `POST /images/upload` | Submit image for CNN analysis |
| **My Reports** | `GET /reports/user` | View user's report history |
| **Report Details** | `GET /reports/{id}` | View single report |
| **My Images** | `GET /images/all` | View uploaded images |
| **Image Details** | `GET /images/{id}` | View image analysis |
| **Start Chat from Report** | `POST /chat/sessions/create` | Create chat after diagnosis |
| **Chat Screen** | `POST /chat/messages/send` | Send message to AI |
| **Load Chat History** | `GET /chat/sessions/{id}` | Get conversation history |
| **My Conversations** | `GET /chat/sessions/user/all` | View all chat sessions |
| **Close Chat** | `PUT /chat/sessions/{id}/close` | Mark conversation as closed |
| **Delete Chat** | `DELETE /chat/sessions/{id}` | Permanently delete chat |
| **Alerts Banner** | `GET /alerts/active` | Show active alerts |
| **Admin Dashboard** | `GET /dashboard/summary` | System statistics |
| **Admin Map** | `GET /dashboard/heatmap` | Contamination heatmap |
| **Admin Reports** | `GET /reports/all` | All system reports |

---

## 🔑 **Authentication Flow**

### For All Protected Endpoints:
1. User logs in → receives JWT token
2. Store token in mobile app (secure storage)
3. Include in all requests:
   ```
   Authorization: Bearer <token>
   ```
4. Token expires after 24 hours → user must re-login

### Role-Based Access:
- **USER**: Can access own reports/images, view alerts
- **EPA_ADMIN**: Can view all reports, create alerts, dashboard access
- **HEALTH_ADMIN**: Can view all reports, update report status
- **SUPER_ADMIN**: Full system access

---

## 🚀 **Testing the API**

### Using cURL (Bash):
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "phone": "+233501234567",
    "language": "tw"
  }'

# Submit Report
curl -X POST http://localhost:8000/reports/submit \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "original_input": "Me nko wo m'\''adze me ti",
    "input_language": "tw",
    "input_type": "text",
    "location": "Kumasi"
  }'

# Upload Image
curl -X POST http://localhost:8000/images/upload \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@/path/to/image.jpg" \
  -F "image_type=water" \
  -F "location=Kumasi"
```

### Using PowerShell:
```powershell
# Register
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/auth/register" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Test123!","name":"Test","phone":"+233501234567","language":"tw"}'

# Submit Report
$headers = @{ Authorization = "Bearer <your-token>" }
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/reports/submit" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"original_input":"Me nko wo m'\''adze me ti","input_language":"tw","input_type":"text","location":"Kumasi"}'
```

---

## 📝 **API Interactive Documentation**

Visit these URLs when the server is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## ✅ **Integration Checklist for Mobile Developers**

- [ ] Implement user registration/login flow
- [ ] Store JWT token securely
- [ ] Add Authorization header to all requests
- [ ] Implement language selector (English/Twi)
- [ ] Create symptom report form with Twi input
- [ ] Implement image upload with camera access
- [ ] Display AI diagnosis in user's language
- [ ] Show active alerts on home screen
- [ ] Create report history view
- [ ] Handle network errors gracefully
- [ ] Implement offline mode (store reports locally)
- [ ] Add location services integration
- [ ] Test with Twi language input

---

*Last Updated: October 26, 2025*  
*API Version: 1.0.0*
