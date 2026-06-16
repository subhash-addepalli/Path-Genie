import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Map, Sparkles, Clock, DollarSign, TrendingUp,
  ChevronRight, BookOpen, Wrench, Trophy, Briefcase,
  CheckCircle, Star, ArrowRight, RotateCcw, Bookmark,
  BookmarkCheck, Trash2
} from 'lucide-react'
import api from '../utils/api'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'

const SUGGESTIONS = [
  'I want to become a Data Scientist',
  'I want to become a Full Stack Developer',
  'I want to become a DevOps Engineer',
  'I want to become a Machine Learning Engineer',
  'I want to become a Cybersecurity Analyst',
  'I want to become a Cloud Architect',
  'I want to become an Android Developer',
  'I want to become a UI/UX Designer',
]

const PHASE_STYLES = {
  Beginner:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300', icon: '🌱' },
  Intermediate: { bg: 'bg-brand-500/10',   border: 'border-brand-500/30',   badge: 'bg-brand-500/20 text-brand-300',   icon: '📘' },
  Advanced:     { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  badge: 'bg-violet-500/20 text-violet-300', icon: '🚀' },
}

const DEMAND_COLOR = {
  High:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Low:    'bg-red-500/20 text-red-300 border-red-500/30',
}

const DIFF_COLOR = {
  Beginner:     'bg-emerald-500/15 text-emerald-400',
  Intermediate: 'bg-amber-500/15 text-amber-400',
  Advanced:     'bg-red-500/15 text-red-400',
}

const PHASE_BG = {
  1: 'bg-emerald-500',
  2: 'bg-brand-500',
  3: 'bg-violet-500',
}

export default function Roadmap() {
  const [goal,         setGoal]         = useState('')
  const [roadmap,      setRoadmap]       = useState(null)
  const [loading,      setLoading]       = useState(false)
  const [error,        setError]         = useState('')
  const [saved,        setSaved]         = useState(false)
  const [savedId,      setSavedId]       = useState(null)
  const [saving,       setSaving]        = useState(false)
  const [currentPhase, setCurrentPhase]  = useState(1)
  const [doneTopics,   setDoneTopics]    = useState([])
  const { user }                         = useAuth()
  const navigate                         = useNavigate()
  const location                         = useLocation()

  // ── Load saved roadmap if coming from Profile/Dashboard ──
  useEffect(() => {
    const saved = location.state?.savedRoadmap
    if (saved) {
      setRoadmap(saved.roadmap_data)
      setGoal(saved.goal)
      setSaved(true)
      setSavedId(saved.id)
      setCurrentPhase(saved.current_phase || 1)
      setDoneTopics(saved.completed_topics || [])
      // Clear location state so refresh doesn't reload
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const generate = async (e) => {
    e?.preventDefault()
    if (!goal.trim()) return
    setLoading(true); setError('')
    setRoadmap(null); setSaved(false)
    setSavedId(null); setCurrentPhase(1); setDoneTopics([])
    try {
      const { data } = await api.post('/roadmap/generate', { goal })
      setRoadmap(data.roadmap)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate roadmap.')
    } finally {
      setLoading(false)
    }
  }

  const saveRoadmap = async () => {
    if (!user) { navigate('/login'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/roadmap/save', {
        goal,
        roadmap_data: roadmap
      })
      setSaved(true)
      setSavedId(data.id)
    } catch (err) {
      // Already saved
      if (err.response?.status === 400) {
        // Fetch the existing saved roadmap id
        try {
          const { data } = await api.get('/roadmap/my-roadmaps')
          const existing = data.roadmaps.find(r => r.goal === goal)
          if (existing) {
            setSaved(true)
            setSavedId(existing.id)
            setCurrentPhase(existing.current_phase || 1)
            setDoneTopics(existing.completed_topics || [])
          }
        } catch {}
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteRoadmap = async () => {
    if (!savedId) return
    try {
      await api.delete(`/roadmap/delete/${savedId}`)
      setSaved(false)
      setSavedId(null)
      setDoneTopics([])
      setCurrentPhase(1)
    } catch {}
  }

  const updateProgress = async (phase, topics) => {
    if (!savedId) return
    try {
      await api.put(`/roadmap/update-progress/${savedId}`, {
        current_phase:    phase,
        completed_topics: topics,
      })
    } catch {}
  }

  const toggleTopic = (topic) => {
    const updated = doneTopics.includes(topic)
      ? doneTopics.filter(t => t !== topic)
      : [...doneTopics, topic]
    setDoneTopics(updated)
    updateProgress(currentPhase, updated)
  }

  const changePhase = (phase) => {
    setCurrentPhase(phase)
    updateProgress(phase, doneTopics)
  }

  const findCourses = (topic) => navigate(`/courses?search=${encodeURIComponent(topic)}`)
  const reset = () => {
    setRoadmap(null); setGoal('')
    setSaved(false); setSavedId(null)
    setDoneTopics([]); setCurrentPhase(1)
  }

  const allTopics   = roadmap?.phases?.flatMap(p => p.topics) || []
  const progressPct = allTopics.length > 0
    ? Math.round((doneTopics.length / allTopics.length) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-400">
          <Sparkles size={12} className="text-violet-400" /> AI-Powered Career Roadmap
        </span>
        <h1 className="text-4xl font-black">Plan Your Career Path</h1>
        <p className="text-slate-400">Tell us your dream career — get a complete step-by-step roadmap</p>
      </div>

      {/* Search form — hide when roadmap is loaded */}
      {!roadmap && (
        <form onSubmit={generate} className="card space-y-5 animate-slide-up">
          <div className="relative">
            <Map size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input className="input pl-11"
              placeholder="e.g. I want to become a Data Scientist..."
              value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}
          <button type="submit" disabled={loading || !goal.trim()} className="btn-primary w-full py-3.5">
            <Map size={18} /> Generate My Roadmap
          </button>
          <div className="pt-1 border-t border-white/[0.06]">
            <p className="text-xs text-slate-600 mb-2.5">Try these career goals:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button type="button" key={s} onClick={() => setGoal(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {loading && <Loader text="AI is building your personalized career roadmap..." />}

      {/* Roadmap Result */}
      {roadmap && (
        <div className="space-y-8 animate-fade-in">

          {/* Hero card */}
          <div className="card border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-brand-600/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white">{roadmap.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{roadmap.summary}</p>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {/* Save / Delete */}
                {user && !saved && (
                  <button onClick={saveRoadmap} disabled={saving}
                    className="btn-ghost text-sm py-2 px-3">
                    <Bookmark size={15} />
                    {saving ? 'Saving...' : 'Save Roadmap'}
                  </button>
                )}
                {user && saved && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                      <BookmarkCheck size={15} /> Saved
                    </span>
                    <button onClick={deleteRoadmap} className="btn-danger text-sm py-2 px-3">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                )}
                <button onClick={reset} className="btn-ghost text-sm py-2 px-3">
                  <RotateCcw size={14} /> New
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05]">
                <Clock size={15} className="text-brand-400" />
                <span className="text-sm text-white font-semibold">{roadmap.total_timeline}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05]">
                <DollarSign size={15} className="text-emerald-400" />
                <span className="text-sm text-white font-semibold">{roadmap.avg_salary}</span>
              </div>
              <span className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${DEMAND_COLOR[roadmap.demand] || DEMAND_COLOR.Medium}`}>
                <TrendingUp size={14} /> {roadmap.demand} Demand
              </span>
            </div>

            {/* Overall progress bar — only when saved */}
            {saved && allTopics.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Overall Progress</span>
                  <span className="text-white font-bold">{progressPct}% — {doneTopics.length}/{allTopics.length} topics</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-500"
                       style={{ width: `${progressPct}%` }} />
                </div>
                {progressPct === 100 && (
                  <p className="text-center text-emerald-400 text-sm font-bold">🎉 Roadmap Complete!</p>
                )}
              </div>
            )}

            {/* Job roles */}
            {roadmap.job_roles?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {roadmap.job_roles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-300 text-sm border border-white/[0.08]">
                    <Briefcase size={12} className="text-brand-400" /> {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Phase selector — only when saved */}
          {saved && (
            <div className="card space-y-3">
              <p className="text-sm font-semibold text-slate-300">
                📍 Mark your current phase — tick topics as you complete them
              </p>
              <div className="flex gap-3 flex-wrap">
                {roadmap.phases?.map(p => {
                  const style = PHASE_STYLES[p.level] || PHASE_STYLES.Beginner
                  return (
                    <button key={p.phase} onClick={() => changePhase(p.phase)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        currentPhase === p.phase
                          ? `${style.border} ${style.badge}`
                          : 'border-white/[0.08] text-slate-500 hover:text-slate-300'
                      }`}>
                      {style.icon} Phase {p.phase} — {p.level}
                      {currentPhase === p.phase && (
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Login prompt to save */}
          {!user && (
            <div className="card border-brand-500/20 bg-brand-500/5 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-slate-300 text-sm">
                <span className="text-white font-semibold">Login to save this roadmap</span> and track your progress topic by topic
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm py-2 px-4 shrink-0">
                Login to Save
              </button>
            </div>
          )}

          {/* Learning Phases */}
          <div>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Map size={20} className="text-brand-400" /> Learning Phases
            </h3>
            <div className="space-y-4">
              {roadmap.phases?.map((phase, i) => {
                const style    = PHASE_STYLES[phase.level] || PHASE_STYLES.Beginner
                const isActive = saved && currentPhase === phase.phase

                // Per-phase progress
                const phaseDone = phase.topics.filter(t => doneTopics.includes(t)).length
                const phasePct  = Math.round((phaseDone / phase.topics.length) * 100)

                return (
                  <div key={i}
                    className={`card border ${style.border} ${style.bg} space-y-4 animate-slide-up ${isActive ? 'ring-2 ring-brand-500/30' : ''}`}
                    style={{ animationDelay: `${i * 100}ms` }}>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-white text-lg">Phase {phase.phase}</h4>
                            <span className={`badge ${style.badge}`}>{phase.level}</span>
                            {isActive && (
                              <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 animate-pulse">
                                📍 In Progress
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {phase.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {saved && (
                          <span className="text-xs text-slate-400 font-medium">
                            {phaseDone}/{phase.topics.length} done
                          </span>
                        )}
                        <button onClick={() => findCourses(phase.topics[0])}
                          className="btn-ghost text-sm py-2 px-3 shrink-0">
                          <BookOpen size={14} /> Courses <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Phase progress bar — only when saved */}
                    {saved && (
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${PHASE_BG[phase.phase] || 'bg-brand-500'} rounded-full transition-all duration-500`}
                             style={{ width: `${phasePct}%` }} />
                      </div>
                    )}

                    <p className="text-sm text-slate-400 leading-relaxed">{phase.description}</p>

                    {/* Topics */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {saved ? '✅ Click topics to mark as done' : 'Topics to Learn'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {phase.topics.map(topic => {
                          const isDone = doneTopics.includes(topic)
                          return saved ? (
                            <button key={topic} onClick={() => toggleTopic(topic)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border-white/[0.08] hover:border-white/20'
                              }`}>
                              {isDone
                                ? <CheckCircle size={12} className="shrink-0" />
                                : <ChevronRight size={12} className="shrink-0" />
                              }
                              <span className={isDone ? 'line-through opacity-70' : ''}>{topic}</span>
                            </button>
                          ) : (
                            <button key={topic} onClick={() => findCourses(topic)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-sm border border-white/[0.08] transition-all group">
                              {topic}
                              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Skills */}
                    {phase.skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills You'll Gain</p>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.map(skill => (
                            <span key={skill} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-400 text-xs border border-white/[0.06]">
                              <CheckCircle size={10} className="text-emerald-400" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Projects */}
          {roadmap.projects?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Wrench size={20} className="text-amber-400" /> Recommended Projects
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {roadmap.projects.map((project, i) => (
                  <div key={i} className="card hover:border-white/[0.15] transition-all space-y-3 animate-slide-up"
                       style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white">{project.name}</h4>
                      <span className={`badge shrink-0 ${DIFF_COLOR[project.difficulty] || DIFF_COLOR.Beginner}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{project.description}</p>
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                        {project.tech_stack.map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 text-xs border border-brand-500/20">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {roadmap.certifications?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" /> Recommended Certifications
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {roadmap.certifications.map((cert, i) => (
                  <a key={i} href={cert.url} target="_blank" rel="noopener noreferrer"
                     className="card hover:border-white/[0.15] transition-all space-y-2 group animate-slide-up"
                     style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white group-hover:text-brand-300 transition-colors">{cert.name}</h4>
                      <span className={`badge shrink-0 ${DIFF_COLOR[cert.level] || DIFF_COLOR.Beginner}`}>{cert.level}</span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Star size={11} className="text-amber-400" /> {cert.provider}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {roadmap.tools?.length > 0 && (
            <div className="card space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Wrench size={18} className="text-brand-400" /> Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {roadmap.tools.map(tool => (
                  <span key={tool} className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 text-sm border border-white/[0.08]">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="card text-center space-y-4 border-brand-500/20 bg-gradient-to-br from-brand-600/10 to-violet-600/10">
            <h3 className="text-xl font-bold">Ready to Start Learning? 🚀</h3>
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={() => navigate('/courses')} className="btn-primary px-6">
                <BookOpen size={16} /> Find Courses
              </button>
              <button onClick={() => navigate('/quiz')} className="btn-ghost px-6">Take a Quiz</button>
              <button onClick={reset} className="btn-ghost px-6"><RotateCcw size={15} /> New Roadmap</button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
