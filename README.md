# 🧞 PathGenie — AI-Powered Learning Assistant

> Your personal AI genie for courses, career roadmaps, project ideas, and knowledge testing.

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Local Setup](#local-setup)
9. [Docker Setup](#docker-setup)
10. [Deployment Guide](#deployment-guide)
11. [Screenshots](#screenshots)
12. [Future Improvements](#future-improvements)

---

## 📖 Project Overview

PathGenie is an AI-powered web platform built specifically for **engineering and degree students**. It helps students:

- Find the best online courses for any topic using AI
- Get a complete step-by-step career roadmap for their dream job
- Discover hands-on project ideas tailored to their target role
- Test their knowledge with AI-generated quizzes
- Track their learning progress over time
- Save favorite courses and roadmaps for later

The platform uses **Groq AI (LLaMA 3.3 70B)** for all AI features, **PostgreSQL** for data storage, **FastAPI** for the backend, and **React** for the frontend — all containerized with **Docker**.

---

## ✨ Features

### 🔍 AI Course Finder
- Enter any topic in natural language
- AI searches and returns 6 curated courses
- Filter by Free / Paid / Both
- Bookmark courses to save for later
- Quick suggestion chips for popular topics
- Courses from Udemy, Coursera, YouTube, NPTEL, Khan Academy, edX, and more

### 🗺️ Career Roadmap Generator
- Enter your dream career goal
- AI generates a 3-phase roadmap (Beginner → Intermediate → Advanced)
- Each phase includes topics, skills, duration
- Recommended projects and certifications
- Tools & technologies list
- Job roles and salary information
- Save roadmap to your account
- Track progress by marking topics as done ✅
- Per-phase and overall progress bars
- Delete saved roadmaps anytime

### 🛠️ Project Recommender
- Enter a job role or career goal
- AI suggests 9 hands-on projects (3 per difficulty level)
- Each project includes tech stack, what you'll learn, estimated duration
- GitHub search link for each project
- Filter by Beginner / Intermediate / Advanced
- Explains why each project helps for that specific role

### 🧠 AI Quiz Generator
- Enter any engineering topic
- Choose difficulty: Easy / Medium / Hard
- Choose number of questions: 5, 10, 15, or 20
- Timed quiz (90 seconds per question)
- Question navigator to jump between questions
- Auto-submit when timer expires
- Instant scoring with A–F grade
- Detailed results with correct answers and explanations
- Quiz history saved to account (if logged in)

### 📊 Progress Dashboard
- Overview of all learning activity
- Total quizzes taken, average score, best grade
- Saved courses count and active roadmaps count
- Active roadmaps with progress bars
- Grade distribution chart (A through F)
- Strong topics vs weak topics analysis
- Recent quiz history with scores

### 👤 Profile Page
- View and edit your full name
- Change password securely
- Delete account permanently
- My Courses tab — all bookmarked courses with remove option
- My Roadmaps tab — all saved roadmaps with progress indicators

### 🔐 Authentication
- Register with name, email, password
- OTP email verification (6-digit code, 10-minute expiry)
- Resend OTP with 60-second cooldown
- Welcome email after successful verification
- JWT-based authentication (7-day token)
- Protected routes — login required for all features
- Auto-redirect to dashboard after login
- Auto-logout on token expiry

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18.2 |
| **Frontend Build** | Vite | 5.2 |
| **Styling** | Tailwind CSS | 3.4 |
| **Routing** | React Router DOM | 6.23 |
| **HTTP Client** | Axios | 1.6 |
| **Icons** | Lucide React | 0.383 |
| **Backend** | Python FastAPI | 0.111 |
| **Server** | Uvicorn | 0.29 |
| **Database** | PostgreSQL | 16 |
| **ORM** | SQLAlchemy (async) | 2.0 |
| **DB Driver** | asyncpg | 0.29 |
| **AI Model** | Groq (LLaMA 3.3 70B) | — |
| **Auth** | JWT + bcrypt | — |
| **Email** | Gmail SMTP | — |
| **Container** | Docker + Docker Compose | — |
| **Web Server** | Nginx (frontend) | alpine |

---

## 📁 Project Structure

```
pathgenie/
│
├── docker-compose.yml              # Orchestrates all 3 containers
├── .env                            # All environment secrets
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile                  # Python 3.11 slim image
│   ├── main.py                     # FastAPI app entry point
│   ├── database.py                 # PostgreSQL async connection
│   ├── schemas.py                  # Pydantic request/response models
│   ├── email_service.py            # Gmail SMTP + HTML email templates
│   ├── requirements.txt
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                 # Users table
│   │   ├── quiz_history.py         # Quiz results table
│   │   ├── bookmark.py             # Course bookmarks table
│   │   └── roadmap_progress.py     # Saved roadmaps + progress table
│   │
│   └── routes/
│       ├── __init__.py
│       ├── auth.py                 # Register, Login, OTP, Profile CRUD
│       ├── courses.py              # AI course search
│       ├── quiz.py                 # AI quiz generation + submission
│       ├── roadmap.py              # AI roadmap + save/progress/delete
│       ├── projects.py             # AI project recommender
│       ├── history.py              # Quiz history + stats
│       └── bookmarks.py           # Course bookmark CRUD
│
└── frontend/
    ├── Dockerfile                  # Node 20 build + Nginx serve
    ├── nginx.conf                  # Serve React + proxy /api to backend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx                # React entry point
        ├── App.jsx                 # Router + layout
        ├── index.css               # Global styles + Tailwind
        │
        ├── context/
        │   └── AuthContext.jsx     # Global auth state + login/logout
        │
        ├── utils/
        │   └── api.js              # Axios instance + JWT interceptor
        │
        ├── components/
        │   ├── Sidebar.jsx         # Left navigation sidebar
        │   ├── ProtectedRoute.jsx  # Auth guard for protected pages
        │   ├── CourseCard.jsx      # Course card with bookmark button
        │   └── Loader.jsx          # Animated loading spinner
        │
        └── pages/
            ├── Home.jsx            # Landing page
            ├── Login.jsx           # Login form
            ├── Register.jsx        # Registration form
            ├── VerifyOTP.jsx       # OTP verification with 6 inputs
            ├── Dashboard.jsx       # User progress overview
            ├── Courses.jsx         # Course search page
            ├── Roadmap.jsx         # Career roadmap generator + tracker
            ├── Projects.jsx        # Project recommender
            ├── Quiz.jsx            # Quiz generator + taker + results
            └── Profile.jsx         # User profile + bookmarks + roadmaps
```

---

## 🗄️ Database Schema

### users
```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,           -- bcrypt hashed
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code    VARCHAR(6),                       -- 6-digit OTP
    otp_expires TIMESTAMPTZ,                      -- 10 min expiry
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### quiz_history
```sql
CREATE TABLE quiz_history (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic       VARCHAR(255) NOT NULL,
    difficulty  VARCHAR(20) NOT NULL,
    score       INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    percentage  INTEGER NOT NULL,
    grade       VARCHAR(2) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### bookmarks
```sql
CREATE TABLE bookmarks (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    platform    VARCHAR(100),
    url         VARCHAR(1000) NOT NULL,
    price       VARCHAR(50),
    level       VARCHAR(50),
    rating      FLOAT,
    description VARCHAR(1000),
    mode        VARCHAR(10),
    instructor  VARCHAR(200),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### roadmap_progress
```sql
CREATE TABLE roadmap_progress (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal             VARCHAR(500) NOT NULL,
    roadmap_data     TEXT NOT NULL,              -- Full JSON
    current_phase    INTEGER DEFAULT 1,
    completed_topics TEXT DEFAULT '[]',          -- JSON array
    status           VARCHAR(20) DEFAULT 'active',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create account, send OTP | No |
| POST | `/verify-otp` | Verify OTP, activate account | No |
| POST | `/resend-otp` | Resend new OTP to email | No |
| POST | `/login` | Login, get JWT token | No |
| GET | `/me` | Get current user info | Yes |
| PUT | `/update-name` | Update display name | Yes |
| PUT | `/change-password` | Change password | Yes |
| DELETE | `/delete-account` | Delete account + all data | Yes |

### Courses — `/api/courses`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/search` | AI course search by prompt + mode | No |

### Quiz — `/api/quiz`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/generate` | Generate MCQ quiz on topic | No |
| POST | `/submit` | Submit answers, get score + grade | No |

### Roadmap — `/api/roadmap`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/generate` | Generate career roadmap | No |
| POST | `/save` | Save roadmap to account | Yes |
| GET | `/my-roadmaps` | Get all saved roadmaps | Yes |
| PUT | `/update-progress/{id}` | Update phase + completed topics | Yes |
| DELETE | `/delete/{id}` | Delete saved roadmap | Yes |

### Projects — `/api/projects`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/recommend` | Get 9 project ideas for a role | No |

### Progress — `/api/progress`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/quiz/save` | Save quiz result to history | Yes |
| GET | `/quiz/history` | Get all quiz history | Yes |
| GET | `/quiz/stats` | Get stats + strong/weak topics | Yes |

### Bookmarks — `/api/bookmarks`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/add` | Bookmark a course | Yes |
| DELETE | `/remove/{id}` | Remove a bookmark | Yes |
| GET | `/list` | Get all bookmarked courses | Yes |
| GET | `/ids` | Get bookmarked URLs map | Yes |

---

## ⚙️ Environment Variables

Create a `.env` file in the root folder:

```env
# ── Groq AI ─────────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key_here

# ── PostgreSQL ──────────────────────────────────────
POSTGRES_USER=coursegenie_user
POSTGRES_PASSWORD=coursegenie_pass
POSTGRES_DB=coursegenie_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# ── JWT ─────────────────────────────────────────────
JWT_SECRET=your_long_random_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# ── Gmail SMTP ──────────────────────────────────────
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password

# ── App ─────────────────────────────────────────────
FRONTEND_URL=http://localhost:80
```

### How to get each key:

| Key | Where to get |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com → API Keys → Create Key |
| `JWT_SECRET` | Any long random string (no $ signs) |
| `GMAIL_APP_PASSWORD` | https://myaccount.google.com/apppasswords |
| `POSTGRES_*` | Keep defaults for local, use Render values for production |

---

## 💻 Local Setup (Without Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from root .env)
# Make sure POSTGRES_HOST=localhost

# Run backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

**1. Clone / Download the project**
```bash
git clone https://github.com/yourusername/pathgenie.git
cd pathgenie
```

**2. Set up environment variables**
```bash
# Edit .env file and fill in your API keys
notepad .env    # Windows
nano .env       # Mac/Linux
```

**3. Start all containers**
```bash
docker-compose up --build
```

This starts:
- `pathgenie_db` — PostgreSQL on port 5432
- `pathgenie_api` — FastAPI on port 8000
- `pathgenie_web` — React/Nginx on port 80

**4. Open browser**
```
http://localhost
```

### Useful Docker Commands

```bash
# Start containers
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop containers
docker-compose down

# Stop and delete database
docker-compose down -v

# View logs
docker logs pathgenie_api --tail 50

# View logs live
docker logs pathgenie_api -f

# Access database
docker exec -it pathgenie_db psql -U coursegenie_user -d coursegenie_db

# Restart single service
docker-compose restart backend
```

### If you add new DB columns
```bash
docker exec -it pathgenie_db psql -U coursegenie_user -d coursegenie_db
```
Then run your ALTER TABLE commands.

---

## ☁️ Deployment Guide

### Architecture
```
Internet
    │
    ▼
Vercel (React Frontend)
    │  /api/* requests
    ▼
Render (FastAPI Backend)
    │  SQL queries
    ▼
Render (PostgreSQL Database)
```

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial PathGenie commit"
git remote add origin https://github.com/yourusername/pathgenie.git
git push -u origin main
```

### Step 2 — Deploy PostgreSQL on Render
1. Go to https://render.com → Sign up
2. New → PostgreSQL
3. Name: `pathgenie-db`
4. Plan: Free
5. Click Create
6. Copy the **Internal Database URL**

### Step 3 — Deploy Backend on Render
1. New → Web Service
2. Connect your GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
```
GROQ_API_KEY          = gsk_...
DATABASE_URL          = (paste Internal DB URL from Step 2)
JWT_SECRET            = your_secret
JWT_ALGORITHM         = HS256
JWT_EXPIRE_MINUTES    = 10080
GMAIL_USER            = your@gmail.com
GMAIL_APP_PASSWORD    = xxxx xxxx xxxx xxxx
FRONTEND_URL          = https://your-app.vercel.app
```
5. Click Deploy
6. Copy your backend URL: `https://pathgenie-api.onrender.com`

### Step 4 — Deploy Frontend on Vercel
1. Go to https://vercel.com → Sign up
2. New Project → Import GitHub repo
3. Root Directory: `frontend`
4. Update `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://pathgenie-api.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
5. Click Deploy
6. Your app is live at `https://pathgenie.vercel.app`

---

## 🔧 Common Issues & Fixes

| Problem | Cause | Fix |
|---|---|---|
| `column users.is_verified does not exist` | Old DB schema | Run ALTER TABLE or docker-compose down -v |
| `bcrypt error` | Version mismatch | Use `bcrypt==4.0.1` in requirements.txt |
| `429 RESOURCE_EXHAUSTED` | Groq rate limit | Wait 1 minute and retry |
| `Invalid API Key` | Wrong Groq key | Re-copy key from console.groq.com |
| `Gmail auth failed` | Wrong app password | Regenerate at myaccount.google.com/apppasswords |
| `Port 80 in use` | Another app on port 80 | Change `"80:80"` to `"8080:80"` in docker-compose.yml |
| `Docker not starting` | Docker Desktop not running | Open Docker Desktop and wait for green icon |
| `CORS error` | Frontend URL not in allowed origins | Add frontend URL to FRONTEND_URL in .env |
| Frontend build fails | Duplicate import | Check for duplicate import statements in .jsx files |
| `JWT_SECRET` has `$` sign | Docker interprets `$` | Remove `$` from JWT_SECRET value |

---

## 🚀 Future Improvements

| Feature | Description |
|---|---|
| Google OAuth | Login with Google account |
| Course Reviews | Users can rate and review courses |
| Community Forum | Students can ask questions and share resources |
| AI Chat Assistant | Chat with AI about any learning topic |
| Resume Builder | AI-generated resume based on skills and projects |
| Interview Prep | AI mock interview questions for job roles |
| Peer Groups | Study groups for same career goals |
| Mobile App | React Native version for iOS/Android |
| Notifications | Email reminders to continue learning |
| Analytics | Advanced learning analytics dashboard |
| Dark/Light Mode | Theme toggle |
| Multi-language | Support for regional languages |

---

## 👨‍💻 Developer Info

- **Project:** PathGenie
- **Type:** Full Stack Web Application
- **Purpose:** Engineering student learning platform
- **Built with:** FastAPI + React + PostgreSQL + Docker + Groq AI

---

## 📄 License

This project is built for educational purposes.

---

*Made with ❤️ for engineering students*
