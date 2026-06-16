import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Brain, TrendingUp, Target,
  BookOpen, CheckCircle, XCircle, Clock,
  Map, Bookmark, Star, User, Wrench
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

const GRADE_COLOR = {
  A: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  F: 'text-red-400 bg-red-500/15 border-red-500/30',
}

const GRADE_BG = {
  A: 'bg-emerald-500', B: 'bg-blue-500',
  C: 'bg-amber-500',  D: 'bg-orange-500', F: 'bg-red-500',
}

const PHASE_STYLES = {
  1: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Beginner'     },
  2: { color: 'text-brand-400',   bg: 'bg-brand-500',   label: 'Intermediate' },
  3: { color: 'text-violet-400',  bg: 'bg-violet-500',  label: 'Advanced'     },
}

export default function Dashboard() {
  const [stats,     setStats]     = useState(null)
  const [history,   setHistory]   = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [roadmaps,  setRoadmaps]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const { user }                  = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [statsRes, historyRes, bookmarksRes, roadmapsRes] = await Promise.all([
        api.get('/progress/quiz/stats'),
        api.get('/progress/quiz/history'),
        api.get('/bookmarks/list'),
        api.get('/roadmap/my-roadmaps'),
      ])
      setStats(statsRes.data)
      setHistory(historyRes.data.history  || [])
      setBookmarks(bookmarksRes.data.bookmarks || [])
      setRoadmaps(roadmapsRes.data.roadmaps    || [])
    } catch {}
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Loader text="Loading your dashboard..." />
    </div>
  )

  const totalGrades = stats ? Object.values(stats.grade_counts).reduce((a,b) => a+b, 0) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Welcome header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl font-black">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            {user?.name?.split(' ')[0]}!
          </span>{' '}👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your learning progress overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Taken',   value: stats?.total_quizzes || 0,    icon: Brain,    color: 'text-brand-400',   bg: 'bg-brand-500/10'   },
          { label: 'Avg Score',       value: `${stats?.avg_percentage || 0}%`, icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Saved Courses',   value: bookmarks.length,              icon: Bookmark, color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
          { label: 'Active Roadmaps', value: roadmaps.length,               icon: Map,      color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
        ].map((s, i) => (
          <div key={s.label} className="card text-center space-y-2 animate-slide-up hover:border-white/[0.14] transition-all"
               style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active Roadmaps */}
      {roadmaps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Map size={20} className="text-violet-400" /> Active Roadmaps
            </h3>
            <button onClick={() => navigate('/profile')} className="text-xs text-brand-400 hover:underline">
              View all →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {roadmaps.slice(0, 4).map((r, i) => {
              const allTopics       = r.roadmap_data?.phases?.flatMap(p => p.topics) || []
              const completedTopics = r.completed_topics || []
              const pct             = allTopics.length > 0
                ? Math.round((completedTopics.length / allTopics.length) * 100) : 0
              const ps              = PHASE_STYLES[r.current_phase] || PHASE_STYLES[1]

              return (
                <div key={r.id} className="card hover:border-white/[0.14] transition-all space-y-3 animate-slide-up"
                     style={{ animationDelay: `${i * 70}ms` }}>
                  <div>
                    <h4 className="font-bold text-white text-sm">{r.roadmap_data?.title || r.goal}</h4>
                    <p className={`text-xs mt-0.5 ${ps.color}`}>📍 Phase {r.current_phase} — {ps.label}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span className="text-white font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full ${ps.bg} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button onClick={() => navigate('/roadmap', { state: { savedRoadmap: r } })}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Continue learning →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quiz stats */}
      {stats?.total_quizzes > 0 && (
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Grade distribution */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-400" /> Grade Distribution
            </h3>
            <div className="space-y-3">
              {['A','B','C','D','F'].map(grade => {
                const count = stats.grade_counts[grade] || 0
                const pct   = totalGrades > 0 ? (count / totalGrades) * 100 : 0
                return (
                  <div key={grade} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold ${GRADE_COLOR[grade]}`}>
                      {grade}
                    </span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full ${GRADE_BG[grade]} rounded-full transition-all duration-700`}
                           style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Topic analysis */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Star size={18} className="text-amber-400" /> Topic Analysis
            </h3>
            {stats.strong_topics?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">💪 Strong Topics</p>
                <div className="flex flex-wrap gap-2">
                  {stats.strong_topics.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                      <CheckCircle size={10} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {stats.weak_topics?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">⚠️ Needs Work</p>
                <div className="flex flex-wrap gap-2">
                  {stats.weak_topics.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                      <XCircle size={10} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!stats.strong_topics?.length && !stats.weak_topics?.length && (
              <p className="text-slate-500 text-sm">Take more quizzes to see topic analysis!</p>
            )}
          </div>
        </div>
      )}

      {/* Recent quiz history */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-brand-400" /> Recent Quizzes
          </h3>
          <div className="space-y-3">
            {history.slice(0, 5).map((h, i) => (
              <div key={h.id} className="card flex items-center justify-between gap-4 py-4 hover:border-white/[0.14] transition-all animate-slide-up"
                   style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-black ${GRADE_COLOR[h.grade]}`}>
                    {h.grade}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-sm">{h.topic}</p>
                    <p className="text-xs text-slate-500 capitalize">{h.difficulty} · {new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white">{h.percentage}%</p>
                  <p className="text-xs text-slate-500">{h.score}/{h.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats?.total_quizzes === 0 && roadmaps.length === 0 && bookmarks.length === 0 && (
        <div className="card text-center space-y-5 py-16 border-dashed">
          <div className="text-5xl">🧞</div>
          <div>
            <h3 className="text-xl font-bold text-white">Let's get started!</h3>
            <p className="text-slate-500 text-sm mt-1">Search courses, generate a roadmap, or take a quiz</p>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/courses')}  className="btn-primary px-6"><BookOpen size={15} /> Find Courses</button>
            <button onClick={() => navigate('/roadmap')}  className="btn-ghost px-6"><Map size={15} /> Get Roadmap</button>
            <button onClick={() => navigate('/projects')} className="btn-ghost px-6"><Wrench size={15} /> Projects</button>
            <button onClick={() => navigate('/quiz')}     className="btn-ghost px-6"><Brain size={15} /> Take Quiz</button>
          </div>
        </div>
      )}

      {/* CTA */}
      {(stats?.total_quizzes > 0 || roadmaps.length > 0) && (
        <div className="card text-center space-y-4 border-brand-500/20 bg-gradient-to-br from-brand-600/10 to-violet-600/10">
          <h3 className="text-xl font-bold">Keep the momentum going! 🚀</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/quiz')}    className="btn-primary px-6"><Brain size={16} /> New Quiz</button>
            <button onClick={() => navigate('/courses')} className="btn-ghost px-6"><BookOpen size={16} /> Find Courses</button>
            <button onClick={() => navigate('/roadmap')} className="btn-ghost px-6"><Map size={16} /> Roadmap</button>
          </div>
        </div>
      )}
    </div>
  )
}
