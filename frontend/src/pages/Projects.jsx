import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench, Sparkles, Clock, ChevronRight,
  BookOpen, Github, RotateCcw, Filter,
  CheckCircle, Layers
} from 'lucide-react'
import api from '../utils/api'
import Loader from '../components/Loader'

const SUGGESTIONS = [
  'Data Scientist',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Android Developer',
  'Cybersecurity Analyst',
  'Cloud Architect',
  'UI/UX Designer',
  'Blockchain Developer',
  'Embedded Systems Engineer',
]

const DIFFICULTY_STYLES = {
  Beginner: {
    badge:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/30',
    bg:     'bg-emerald-500/5',
    icon:   '🟢',
    dot:    'bg-emerald-500',
  },
  Intermediate: {
    badge:  'bg-brand-500/20 text-brand-300 border-brand-500/30',
    border: 'border-brand-500/30',
    bg:     'bg-brand-500/5',
    icon:   '📘',
    dot:    'bg-brand-500',
  },
  Advanced: {
    badge:  'bg-violet-500/20 text-violet-300 border-violet-500/30',
    border: 'border-violet-500/30',
    bg:     'bg-violet-500/5',
    icon:   '🚀',
    dot:    'bg-violet-500',
  },
}

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced']

function ProjectCard({ project, index }) {
  const style    = DIFFICULTY_STYLES[project.difficulty] || DIFFICULTY_STYLES.Beginner
  const searchUrl = `https://github.com/search?q=${encodeURIComponent(project.github_search)}&type=repositories`

  return (
    <div
      className={`card border ${style.border} ${style.bg} space-y-4 hover:border-white/20 transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{style.icon}</span>
            <span className={`badge border text-xs ${style.badge}`}>{project.difficulty}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={11} /> {project.duration}
            </span>
          </div>
          <h3 className="font-bold text-white text-base leading-snug">{project.name}</h3>
        </div>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Search on GitHub"
          className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <Github size={16} />
        </a>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>

      {/* Why it helps */}
      <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <p className="text-xs text-slate-500">
          <span className="text-slate-300 font-medium">💡 Why this helps: </span>
          {project.why_it_helps}
        </p>
      </div>

      {/* Tech stack */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech_stack.map(tech => (
            <span key={tech}
              className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 text-xs border border-brand-500/20 font-medium">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* What you learn */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">What You'll Learn</p>
        <div className="space-y-1.5">
          {project.what_you_learn.map(skill => (
            <div key={skill} className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle size={11} className="text-emerald-400 shrink-0" />
              {skill}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [goal,     setGoal]     = useState('')
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [filter,   setFilter]   = useState('All')
  const navigate                = useNavigate()

  const generate = async (e) => {
    e?.preventDefault()
    if (!goal.trim()) return
    setLoading(true); setError(''); setData(null); setFilter('All')
    try {
      const { data: res } = await api.post('/projects/recommend', { goal })
      setData(res)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setData(null); setGoal(''); setFilter('All') }

  const filteredProjects = data?.projects?.filter(p =>
    filter === 'All' ? true : p.difficulty === filter
  ) || []

  const countByLevel = (level) => data?.projects?.filter(p => p.difficulty === level).length || 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-400">
          <Sparkles size={12} className="text-amber-400" /> AI-Powered Project Recommender
        </span>
        <h1 className="text-4xl font-black">Project Ideas for Your Career</h1>
        <p className="text-slate-400">Enter your target role — get 9 hands-on projects to build your portfolio</p>
      </div>

      {/* Search form */}
      {!data && (
        <form onSubmit={generate} className="card space-y-5 animate-slide-up">
          <div className="relative">
            <Wrench size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              className="input pl-11"
              placeholder="e.g. Data Scientist, Full Stack Developer, DevOps Engineer..."
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading || !goal.trim()} className="btn-primary w-full py-3.5">
            <Wrench size={18} /> Get Project Ideas
          </button>

          {/* Suggestions */}
          <div className="pt-1 border-t border-white/[0.06]">
            <p className="text-xs text-slate-600 mb-2.5">Popular roles:</p>
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

      {loading && <Loader text="AI is generating project ideas for you..." />}

      {/* Results */}
      {data && (
        <div className="space-y-6 animate-fade-in">

          {/* Result header */}
          <div className="card bg-gradient-to-br from-amber-600/10 to-brand-600/10 border-amber-500/20 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-black text-white">{data.title} Projects</h2>
                <p className="text-slate-400 text-sm mt-1">9 curated projects to build your portfolio</p>
              </div>
              <button onClick={reset} className="btn-ghost text-sm py-2 px-3 shrink-0">
                <RotateCcw size={14} /> New Search
              </button>
            </div>

            {/* Level summary */}
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                const style = DIFFICULTY_STYLES[level]
                return (
                  <div key={level} className={`text-center py-3 rounded-xl border ${style.border} ${style.bg}`}>
                    <p className="text-lg font-black text-white">{countByLevel(level)}</p>
                    <p className={`text-xs font-medium ${style.badge.split(' ')[1]}`}>{level}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">Filter:</span>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  filter === f
                    ? f === 'All'          ? 'border-brand-500 bg-brand-600/20 text-brand-300'
                    : f === 'Beginner'     ? 'border-emerald-500 bg-emerald-600/15 text-emerald-300'
                    : f === 'Intermediate' ? 'border-brand-500 bg-brand-600/20 text-brand-300'
                    :                       'border-violet-500 bg-violet-600/15 text-violet-300'
                    : 'border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/20'
                }`}>
                {f === 'Beginner'     ? '🟢 '     : ''}
                {f === 'Intermediate' ? '📘 '     : ''}
                {f === 'Advanced'     ? '🚀 '     : ''}
                {f}
                {f !== 'All' && (
                  <span className="ml-1 opacity-60">({countByLevel(f)})</span>
                )}
              </button>
            ))}
          </div>

          {/* Project grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="card text-center space-y-4 border-brand-500/20 bg-gradient-to-br from-brand-600/10 to-violet-600/10">
            <h3 className="text-xl font-bold">Ready to Start Building? 🚀</h3>
            <p className="text-slate-400 text-sm">Find courses to learn the skills needed for these projects</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={() => navigate('/courses')} className="btn-primary px-6">
                <BookOpen size={16} /> Find Courses
              </button>
              <button onClick={() => navigate('/roadmap')} className="btn-ghost px-6">
                <Layers size={16} /> Get Roadmap
              </button>
              <button onClick={reset} className="btn-ghost px-6">
                <RotateCcw size={15} /> New Search
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
