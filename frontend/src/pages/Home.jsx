import { Link } from 'react-router-dom'
import { BookOpen, Brain, Zap, Globe, ArrowRight, Star, Map, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: Globe,  color: 'text-brand-400',   bg: 'bg-brand-500/10',   title: 'AI Course Finder',       desc: 'Describe what you want to learn — get 6 curated courses from Udemy, Coursera, YouTube, NPTEL instantly.'        },
  { icon: Map,    color: 'text-violet-400',  bg: 'bg-violet-500/10',  title: 'Career Roadmap',         desc: 'Get a full step-by-step roadmap for any career — phases, projects, certifications and estimated timeline.'    },
  { icon: Wrench, color: 'text-amber-400',   bg: 'bg-amber-500/10',   title: 'Project Recommender',    desc: 'Get 9 hands-on project ideas (Beginner → Advanced) tailored to your target job role to build your portfolio.' },
  { icon: Brain,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Instant AI Quizzes',     desc: 'Generate MCQ quizzes on any engineering topic. Timed, graded with A-F, and detailed answer explanations.'     },
]

const stats = [
  { label: 'Platforms Covered', value: '20+'  },
  { label: 'Career Paths',      value: '50+'  },
  { label: 'Project Ideas',     value: '∞'    },
  { label: 'Students Helped',   value: '5K+'  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-14 space-y-28">

      {/* Hero */}
      <section className="text-center space-y-7 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-slate-400 border border-white/10">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          AI-Powered Learning for Engineering Students
        </div>

        <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight">
          Your AI Learning<br />
          <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Genie 🧞
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PathGenie finds the best online courses, builds your career roadmap,
          suggests hands-on projects, and tests your knowledge — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/roadmap" className="btn-primary text-base px-7 py-3.5">
            <Map size={18} /> Get Career Roadmap <ArrowRight size={16} />
          </Link>
          <Link to="/projects" className="btn-ghost text-base px-7 py-3.5">
            <Wrench size={18} /> Project Ideas
          </Link>
          <Link to="/courses" className="btn-ghost text-base px-7 py-3.5">
            <BookOpen size={18} /> Find Courses
          </Link>
        </div>

        {!user && (
          <p className="text-sm text-slate-500">
            <Link to="/register" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
              Create a free account
            </Link>{' '}to save your progress
          </p>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="card text-center space-y-1 animate-slide-up hover:border-white/[0.14] transition-all"
               style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-3xl font-black bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              {s.value}
            </p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black text-center">Everything You Need to Excel</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className="card space-y-3 hover:border-white/[0.14] transition-all duration-300 animate-slide-up"
                 style={{ animationDelay: `${i * 90}ms` }}>
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="font-bold text-white text-lg">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center space-y-5 border-brand-500/20 bg-gradient-to-br from-brand-600/10 to-violet-600/10">
        <div className="text-4xl">🧞</div>
        <h2 className="text-3xl font-black">Ready to Build Your Future?</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Get your career roadmap, find projects, discover courses, and test yourself — all for free.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/roadmap"  className="btn-primary px-7 py-3"><Map size={16} /> Get Roadmap</Link>
          <Link to="/projects" className="btn-ghost px-7 py-3"><Wrench size={16} /> Project Ideas</Link>
          <Link to="/courses"  className="btn-ghost px-7 py-3"><BookOpen size={16} /> Find Courses</Link>
        </div>
      </section>

    </div>
  )
}
