import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookOpen, SlidersHorizontal, Sparkles } from 'lucide-react'
import api from '../utils/api'
import CourseCard from '../components/CourseCard'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'

const SUGGESTIONS = [
  'Machine Learning with Python',
  'React full stack development',
  'Data Structures and Algorithms',
  'Computer Networks basics',
  'Operating Systems concepts',
  'AWS Cloud for beginners',
  'Digital Signal Processing',
  'Database Management Systems',
]

const MODES = [
  { value: 'both', label: 'All'     },
  { value: 'free', label: '✓ Free'  },
  { value: 'paid', label: '$ Paid'  },
]

export default function Courses() {
  const [prompt,       setPrompt]       = useState('')
  const [mode,         setMode]         = useState('both')
  const [courses,      setCourses]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [searched,     setSearched]     = useState('')
  const [bookmarkedMap,setBookmarkedMap]= useState({})
  const [searchParams]                  = useSearchParams()
  const { user }                        = useAuth()

  // Auto-search when coming from Roadmap
  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setPrompt(q)
  }, [searchParams])

  // Load existing bookmarks if logged in
  useEffect(() => {
    if (user) {
      api.get('/bookmarks/ids')
        .then(r => setBookmarkedMap(r.data.bookmarked || {}))
        .catch(() => {})
    }
  }, [user])

  const search = async (e) => {
    e?.preventDefault()
    if (!prompt.trim()) return
    setLoading(true); setError(''); setCourses([]); setSearched(prompt)
    try {
      const { data } = await api.post('/courses/search', { prompt, mode })
      setCourses(data.courses || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getModeStyle = (value) => {
    const isActive = mode === value
    if (!isActive) return 'border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/20'
    switch(value) {
      case 'both': return 'border-brand-500 bg-brand-600/20 text-brand-300'
      case 'free': return 'border-emerald-500 bg-emerald-600/15 text-emerald-300'
      case 'paid': return 'border-amber-500 bg-amber-600/15 text-amber-300'
      default:     return 'border-brand-500 bg-brand-600/20 text-brand-300'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-400">
          <Sparkles size={12} className="text-brand-400" /> Powered by Groq AI
        </span>
        <h1 className="text-4xl font-black">Find Your Next Course</h1>
        <p className="text-slate-400">Describe what you want to learn — AI finds the best resources</p>
      </div>

      {/* Search form */}
      <form onSubmit={search} className="card space-y-5 animate-slide-up">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="e.g. Machine Learning for beginners with Python..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">Filter:</span>
            {MODES.map(m => (
              <button
                type="button"
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${getModeStyle(m.value)}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading || !prompt.trim()} className="btn-primary sm:ml-auto">
            {loading ? 'Searching...' : <><Search size={15} /> Search Courses</>}
          </button>
        </div>

        {/* Suggestions */}
        <div className="pt-1 border-t border-white/[0.06]">
          <p className="text-xs text-slate-600 mb-2.5">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button type="button" key={s} onClick={() => setPrompt(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </form>

      {loading && <Loader text="AI is searching for the best courses for you..." />}

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 text-red-300 text-sm">⚠️ {error}</div>
      )}

      {courses.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-bold">{courses.length} courses</span> found for "{searched}"
            </p>
            {!user && (
              <p className="text-xs text-slate-500">
                <a href="/login" className="text-brand-400 hover:underline">Login</a> to bookmark courses
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c, i) => (
              <CourseCard
                key={i}
                course={c}
                index={i}
                isLoggedIn={!!user}
                initialBookmarked={!!bookmarkedMap[c.url]}
                initialBookmarkId={bookmarkedMap[c.url] || null}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <BookOpen size={52} className="mx-auto text-slate-800" />
          <p className="text-slate-600">Enter a topic above to discover courses</p>
        </div>
      )}
    </div>
  )
}
