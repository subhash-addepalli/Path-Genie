import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import Sidebar            from './components/Sidebar'
import ProtectedRoute     from './components/ProtectedRoute'
import Home               from './pages/Home'
import Courses            from './pages/Courses'
import Quiz               from './pages/Quiz'
import Roadmap            from './pages/Roadmap'
import Projects           from './pages/Projects'
import Login              from './pages/Login'
import Register           from './pages/Register'
import VerifyOTP          from './pages/VerifyOTP'
import Dashboard          from './pages/Dashboard'
import Profile            from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/"           element={<Home />}     />
              <Route path="/login"      element={<Login />}    />
              <Route path="/register"   element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses"   element={<ProtectedRoute><Courses /></ProtectedRoute>}   />
              <Route path="/roadmap"   element={<ProtectedRoute><Roadmap /></ProtectedRoute>}   />
              <Route path="/projects"  element={<ProtectedRoute><Projects /></ProtectedRoute>}  />
              <Route path="/quiz"      element={<ProtectedRoute><Quiz /></ProtectedRoute>}      />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>}   />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
