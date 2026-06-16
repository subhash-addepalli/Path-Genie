# 📘 PathGenie — Complete Project Documentation

> Everything about PathGenie: architecture, code flow, decisions, and how every feature works.

---

## 1. PROJECT SUMMARY

**Name:** PathGenie
**Tagline:** Your AI Learning Genie 🧞
**Purpose:** Help engineering and degree students find courses, plan careers, build projects, and test knowledge using AI.

### Problem It Solves
Students waste time searching for courses across multiple platforms, have no clear career direction, don't know what projects to build for their portfolio, and have no easy way to test their knowledge. PathGenie solves all four problems in one place.

### Who It's For
- Engineering students (CSE, IT, ECE, Mechanical, Civil)
- Degree students looking for online learning resources
- Self-learners planning a career switch
- Anyone wanting to upskill with a structured plan

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                    DOCKER NETWORK                    │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   Frontend   │    │   Backend    │                │
│  │   (Nginx)    │───▶│  (FastAPI)   │                │
│  │   Port 80    │    │  Port 8000   │                │
│  └──────────────┘    └──────┬───────┘               │
│                             │                        │
│                      ┌──────▼───────┐               │
│                      │  PostgreSQL  │               │
│                      │  Port 5432   │               │
│                      └──────────────┘               │
└─────────────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
      Groq AI API          Gmail SMTP
   (LLaMA 3.3 70B)      (Email delivery)
```

### Container Roles

**coursegenie_web (Nginx + React)**
- Serves the compiled React app as static files
- Proxies all `/api/*` requests to the backend container
- Handles React Router (all routes return index.html)

**coursegenie_api (FastAPI + Uvicorn)**
- Handles all business logic
- Calls Groq AI API for AI features
- Sends emails via Gmail SMTP
- Reads/writes to PostgreSQL
- Issues and validates JWT tokens

**coursegenie_db (PostgreSQL 16)**
- Stores all persistent data
- Tables: users, quiz_history, bookmarks, roadmap_progress
- Tables auto-created on backend startup via SQLAlchemy

---

## 3. BACKEND ARCHITECTURE

### Framework: FastAPI
FastAPI was chosen because:
- Async support (perfect for database + AI API calls)
- Auto-generates API documentation at /docs
- Built-in Pydantic validation
- Fast performance with Uvicorn

### Database: PostgreSQL + SQLAlchemy (Async)
- `asyncpg` driver for async PostgreSQL connections
- SQLAlchemy ORM for table definitions and queries
- Tables auto-created on startup using `Base.metadata.create_all`
- Session-per-request pattern using FastAPI `Depends`

### Code Flow — Request Lifecycle
```
HTTP Request
    │
    ▼
Nginx (routes /api/* to backend)
    │
    ▼
FastAPI CORS Middleware
    │
    ▼
Route Handler (e.g. routes/courses.py)
    │
    ├── Pydantic validates request body
    ├── JWT token verified (if protected)
    ├── Database session created
    ├── Groq AI called (if AI feature)
    └── Response returned
```

### Authentication Flow
```
Register:
User → POST /api/auth/register
     → OTP generated (6 digits, random)
     → OTP stored in DB with 10-min expiry
     → OTP email sent via Gmail SMTP
     → Response: { message, email }

Verify OTP:
User → POST /api/auth/verify-otp
     → OTP checked against DB
     → Expiry checked
     → User marked as verified
     → Welcome email sent
     → JWT token returned (7-day expiry)

Login:
User → POST /api/auth/login
     → Email + password verified
     → Password compared with bcrypt hash
     → If not verified → new OTP sent
     → JWT token returned

Every Protected Request:
Client sends: Authorization: Bearer <token>
Backend: jwt.decode(token) → extract email → find user in DB
```

### JWT Implementation
- Algorithm: HS256
- Expiry: 10080 minutes (7 days)
- Payload: { sub: email, exp: timestamp }
- Secret: stored in .env as JWT_SECRET
- Library: python-jose

### Password Security
- bcrypt hashing via passlib
- Passwords truncated to 72 bytes (bcrypt limitation)
- Never stored in plain text
- Never returned in API responses

### AI Integration — Groq API
All AI features use the same pattern:
```python
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are an expert..."},
        {"role": "user",   "content": prompt}
    ],
    temperature=0.7,
    max_tokens=2000-4000,
)

raw = response.choices[0].message.content.strip()
# Strip markdown fences if present
# Parse JSON
# Return structured response
```

### Email Service
Two HTML email templates:
1. **OTP Email** — styled with inline CSS, shows 6-digit code in a blue box
2. **Welcome Email** — shows 3 feature cards after successful verification

Gmail SMTP settings:
- Server: smtp.gmail.com
- Port: 465 (SSL)
- Auth: Gmail App Password (not regular password)

---

## 4. FRONTEND ARCHITECTURE

### Framework: React 18 + Vite
Vite chosen for:
- Fast development server with HMR
- Optimized production builds
- Simple configuration

### Styling: Tailwind CSS
Custom design system defined in `tailwind.config.js`:
- Brand colors: blue-based (`brand-*`)
- Violet accents for AI features
- Dark theme: `slate-950` background
- Glass effect: `bg-white/[0.04] backdrop-blur-xl`

### State Management
No Redux or Zustand — uses React Context + useState:
- `AuthContext` — global user state (user object, loading state)
- Component-level state for everything else
- JWT stored in `localStorage` as `cg_token`
- User data stored in `localStorage` as `cg_user`

### Routing: React Router v6
```
/ (public)           → Home
/login (public)      → Login
/register (public)   → Register
/verify-otp (public) → VerifyOTP

/dashboard (protected)  → Dashboard
/courses (protected)    → Courses
/roadmap (protected)    → Roadmap
/projects (protected)   → Projects
/quiz (protected)       → Quiz
/profile (protected)    → Profile
```

Protected routes use `ProtectedRoute` component:
```jsx
if (!user) return <Navigate to="/login" state={{ from: location.pathname }} />
```

### Axios Interceptors
`src/utils/api.js` adds JWT to every request:
```javascript
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

Auto-logout on 401:
```javascript
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cg_token')
      window.location.href = '/login'
    }
  }
)
```

### Layout: Sidebar
Left sidebar fixed at `w-64` on desktop.
On mobile: hamburger menu opens a drawer with backdrop.

Sidebar shows different links based on auth state:
- Logged out: Courses, Roadmap, Quiz + Login/Register
- Logged in: Dashboard, Courses, Roadmap, Projects, Quiz, Profile + Logout

---

## 5. FEATURE DEEP DIVE

### 5.1 Course Search
**User flow:**
1. User types prompt (e.g. "Machine Learning with Python")
2. Selects filter: All / Free / Paid
3. Clicks Search
4. API call to `POST /api/courses/search`
5. Groq AI generates 6 course objects as JSON
6. Results displayed as CourseCard grid

**CourseCard features:**
- Platform badge with color coding
- Level badge (Beginner/Intermediate/Advanced)
- Price badge (Free = green, Paid = amber)
- Star rating, duration, instructor
- Bookmark button (⭐) — saves to DB if logged in
- External link to actual course

**Bookmark flow:**
- On load: fetches `/api/bookmarks/ids` → map of {url: bookmark_id}
- Click bookmark → POST `/api/bookmarks/add` → shows filled icon
- Click again → DELETE `/api/bookmarks/remove/{id}` → shows empty icon

### 5.2 Career Roadmap
**Generation flow:**
1. User enters career goal
2. AI generates structured JSON with phases, projects, certifications
3. Displayed with phase cards, project grid, certification grid

**Save + Track flow:**
1. User clicks "Save Roadmap"
2. POST `/api/roadmap/save` → stores full JSON + goal in DB
3. Phase selector appears → user marks current phase
4. Topic buttons become checkboxes → click to mark done
5. PUT `/api/roadmap/update-progress` called on every change
6. Progress bar updates in real time

**Load saved roadmap flow:**
- Dashboard/Profile passes `{ state: { savedRoadmap: r } }` to navigate
- Roadmap page reads `location.state?.savedRoadmap` on mount
- Restores: roadmap data, goal, saved=true, savedId, currentPhase, completedTopics

### 5.3 Project Recommender
**Flow:**
1. User enters job role
2. AI generates exactly 9 projects (3 Beginner + 3 Intermediate + 3 Advanced)
3. Each project: name, difficulty, duration, description, tech stack, learning outcomes, why it helps, GitHub search query
4. Filter buttons let user view by difficulty level
5. GitHub icon links to search on GitHub

### 5.4 Quiz System
**Generation flow:**
1. User selects topic, difficulty, number of questions
2. POST `/api/quiz/generate`
3. AI generates full quiz with correct answers
4. Backend strips correct_answer before sending to frontend
5. Full questions (with answers) stored in `quiz._answers`

**Taking flow:**
1. Timer starts (90s × num_questions)
2. User selects options → stored in `answers` state as {qid: option}
3. Question navigator shows answered (green) vs unanswered
4. Submit → POST `/api/quiz/submit` with answers + full questions
5. Backend scores, returns grade + explanations

**Save to history:**
After submit, if user is logged in:
```javascript
const token = localStorage.getItem('cg_token')
if (token) {
  api.post('/progress/quiz/save', { topic, difficulty, score, total, percentage, grade })
}
```

### 5.5 Progress Dashboard
Fetches 4 APIs in parallel on load:
```javascript
const [statsRes, historyRes, bookmarksRes, roadmapsRes] = await Promise.all([
  api.get('/progress/quiz/stats'),
  api.get('/progress/quiz/history'),
  api.get('/bookmarks/list'),
  api.get('/roadmap/my-roadmaps'),
])
```

Stats calculation (backend):
- `avg_percentage` = sum of all percentages / count
- `strong_topics` = topics where avg score ≥ 75%
- `weak_topics` = topics where avg score < 50%
- `grade_counts` = { A: n, B: n, C: n, D: n, F: n }
- `best_grade` = first grade in [A,B,C,D,F] that exists in grade_counts

### 5.6 OTP Verification Page
**UX details:**
- 6 separate single-digit inputs
- Auto-focus moves to next input on entry
- Backspace moves to previous input
- Paste works (splits 6-digit OTP across inputs)
- 60-second countdown before Resend becomes available
- Timer resets after successful resend

---

## 6. DOCKER CONFIGURATION

### docker-compose.yml explained
```yaml
services:
  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: pg_isready              # backend waits for this
      
  backend:
    depends_on:
      postgres:
        condition: service_healthy  # won't start until DB is ready
    env_file: .env                  # loads all env variables
    volumes:
      - ./backend:/app              # hot reload in development
      
  frontend:
    depends_on:
      - backend
    ports:
      - "80:80"                     # public port
```

### Nginx configuration explained
```nginx
# Proxy /api requests to FastAPI
location /api/ {
    proxy_pass http://backend:8000;
    proxy_read_timeout 120s;        # AI calls can take time
}

# React SPA routing
location / {
    try_files $uri $uri/ /index.html;  # all routes serve index.html
}
```

### Multi-stage Frontend Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
RUN npm install && npm run build    # creates /app/dist

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Final image is much smaller — no Node.js
```

---

## 7. SECURITY CONSIDERATIONS

| Area | Implementation |
|---|---|
| Passwords | bcrypt hashed, never stored plain |
| API Keys | Stored in .env, never in code |
| JWT | HS256, 7-day expiry, invalidated on logout |
| OTP | 6-digit random, 10-minute expiry, single use |
| Protected routes | Backend verifies JWT on every request |
| CORS | Only allowed origins can call the API |
| SQL Injection | SQLAlchemy ORM prevents raw SQL injection |
| .gitignore | .env excluded from version control |

---

## 8. GRADING SYSTEM

| Score | Grade |
|---|---|
| 90-100% | A |
| 75-89% | B |
| 60-74% | C |
| 50-59% | D |
| 0-49% | F |

---

## 9. AI PROMPT ENGINEERING

All AI prompts follow this pattern:
1. **Role assignment** — "You are an expert..."
2. **Task description** — clear, specific instruction
3. **Output format** — exact JSON structure with example
4. **Rules** — explicit constraints (count, format, etc.)
5. **Command** — "Return the JSON now"

The system prompt always says: "Always respond with valid JSON only, no markdown, no explanation."

After receiving AI response:
```python
# Strip markdown fences if AI adds them
if raw.startswith("```"):
    raw = raw.split("```")[1]
    if raw.startswith("json"):
        raw = raw[4:]
    raw = raw.rstrip("```").strip()

data = json.loads(raw)
```

---

## 10. DEVELOPMENT DECISIONS

| Decision | Why |
|---|---|
| Groq over OpenAI | Free tier, no credit card required |
| FastAPI over Flask | Async support, auto docs, better performance |
| PostgreSQL over MongoDB | Structured data, better for relational data (users → history) |
| Docker Compose | One command to run all 3 services |
| Tailwind CSS | Rapid UI development, no separate CSS files |
| JWT over Sessions | Stateless, works well with React SPA |
| Vite over CRA | Faster dev server, better build output |
| React Context over Redux | Simpler, sufficient for this app's needs |
| Nginx to serve React | Better performance than Node.js for static files |
| Gmail SMTP | Free, no third-party service needed |
| bcrypt for passwords | Industry standard, secure hashing |

---

## 11. KNOWN LIMITATIONS

1. **Groq rate limits** — Free tier has request per minute limits. App shows "try again" message.
2. **AI hallucination** — Course URLs may not always be real. Users should verify before clicking.
3. **No real-time course data** — Course information is AI-generated, not scraped live.
4. **PostgreSQL free tier** — Render's free PostgreSQL expires after 90 days.
5. **No email confirmation resend limit** — Currently no limit on how many times OTP can be resent.
6. **Single language** — English only.
7. **No file uploads** — Profile pictures not supported.

---

## 12. TESTING THE APPLICATION

### Manual Test Checklist

**Auth flow:**
- [ ] Register with valid email
- [ ] Check email for OTP
- [ ] Enter correct OTP → redirected to dashboard
- [ ] Enter wrong OTP → error message
- [ ] OTP expires after 10 minutes
- [ ] Login with correct credentials
- [ ] Login with wrong password → error
- [ ] Logout → redirected to home

**Course search:**
- [ ] Search "Python for beginners"
- [ ] Filter by Free → only free courses shown
- [ ] Filter by Paid → only paid courses shown
- [ ] Filter by All → mixed results
- [ ] Click bookmark icon → course saved
- [ ] Click bookmark again → course removed
- [ ] Visit Profile → My Courses tab shows bookmarked course

**Roadmap:**
- [ ] Enter "I want to become a Data Scientist"
- [ ] Roadmap generated with 3 phases
- [ ] Click Save Roadmap → "Saved" badge appears
- [ ] Mark a topic as done → checkbox fills, progress bar updates
- [ ] Change current phase → phase marker moves
- [ ] Visit Profile → My Roadmaps tab shows saved roadmap
- [ ] Click open on saved roadmap → loads with progress intact
- [ ] Delete roadmap → removed from profile

**Projects:**
- [ ] Enter "Data Scientist"
- [ ] 9 projects appear (3 Beginner, 3 Intermediate, 3 Advanced)
- [ ] Filter by Beginner → shows only 3
- [ ] Click GitHub icon → opens GitHub search
- [ ] Reset → goes back to search form

**Quiz:**
- [ ] Generate quiz on "Operating Systems"
- [ ] Timer counts down
- [ ] Answer questions → question navigator updates
- [ ] Submit → grade and results shown
- [ ] Visit Dashboard → quiz appears in recent history

**Dashboard:**
- [ ] Total quizzes count is correct
- [ ] Grade distribution chart shows grades
- [ ] Strong/weak topics appear after multiple quizzes
- [ ] Active roadmaps show progress bars
- [ ] "Continue learning" opens roadmap with progress

**Profile:**
- [ ] Edit name → name updates in sidebar
- [ ] Change password → old password required
- [ ] Delete account → logs out, data deleted

---

*Last updated: June 2026*
*Version: 5.0.0*
