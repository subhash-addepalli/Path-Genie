import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'
import api from '../utils/api'

const PERKS = ['Find courses with AI', 'Generate unlimited quizzes', 'Track your progress']

export default function Register() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const validatePassword = (pwd) => {
      if (pwd.length < 8)               return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(pwd))           return 'Password must contain at least one capital letter'
      // if (!/[0-9]/.test(pwd))           return 'Password must contain at least one number'
      if (!/[^a-zA-Z0-9]/.test(pwd))    return 'Password must contain at least one symbol'
      return null
    }

    const pwdError = validatePassword(password)
    if (pwdError) { setError(pwdError); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/register', { name, email, password })
      // Redirect to OTP page with email
      navigate('/verify-otp', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-7 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="text-5xl">🧞</div>
          <h1 className="text-3xl font-black">Create Account</h1>
          <p className="text-slate-400 text-sm">Join PathGenie — completely free</p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {PERKS.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle size={12} className="text-emerald-400" /> {p}
            </span>
          ))}
        </div>

        <div className="card space-y-5">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input pr-11"
                  placeholder="At least 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <p className={`text-xs flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One capital letter
                  </p>
                  {/* <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </p> */}
                  <p className={`text-xs flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} One symbol (e.g. @, #, !)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              <UserPlus size={18} />
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
