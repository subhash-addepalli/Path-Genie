import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, RotateCcw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function VerifyOTP() {
  const [otp,      setOtp]      = useState(['', '', '', '', '', ''])
  const [loading,  setLoading]  = useState(false)
  const [resending,setResending]= useState(false)
  const [error,    setError]    = useState('')
  const [timer,    setTimer]    = useState(60)
  const inputRefs               = useRef([])
  const navigate                = useNavigate()
  const location                = useLocation()
  const { login }               = useAuth()

  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) { navigate('/register'); return }
    inputRefs.current[0]?.focus()
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const submit = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: otpString })
      localStorage.setItem('cg_token', data.token)
      localStorage.setItem('cg_user', JSON.stringify({ name: data.name, email: data.email }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true); setError('')
    try {
      await api.post('/auth/resend-otp', { email })
      setTimer(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-7 animate-slide-up">

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-brand-600/20 border border-brand-500/40 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={32} className="text-brand-400" />
          </div>
          <h1 className="text-3xl font-black">Verify Your Email</h1>
          <p className="text-slate-400 text-sm">
            We sent a 6-digit OTP to<br />
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="card space-y-6">
          {/* OTP inputs */}
          <div>
            <label className="label text-center block mb-4">Enter OTP</label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border bg-white/[0.05] transition-all focus:outline-none ${
                    digit
                      ? 'border-brand-500 bg-brand-500/10 text-white'
                      : 'border-white/[0.12] text-white focus:border-brand-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full py-3.5 text-base"
          >
            <ShieldCheck size={18} />
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          {/* Resend */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-slate-500">
                Resend OTP in <span className="text-white font-mono font-bold">{timer}s</span>
              </p>
            ) : (
              <button onClick={resend} disabled={resending}
                className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1.5 mx-auto">
                <RotateCcw size={13} /> {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mx-auto transition-colors">
          <ArrowLeft size={14} /> Back to Register
        </button>
      </div>
    </div>
  )
}
