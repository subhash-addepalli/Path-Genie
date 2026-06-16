import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Map, Brain,
  User, LogOut, LogIn, UserPlus, Menu, X, Wrench
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const publicLinks = [
  { to: '/courses',  label: 'Courses',  icon: BookOpen  },
  { to: '/roadmap',  label: 'Roadmap',  icon: Map       },
  { to: '/quiz',     label: 'Quiz',     icon: Brain     },
]

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses',   label: 'Courses',   icon: BookOpen        },
  { to: '/roadmap',   label: 'Roadmap',   icon: Map             },
  { to: '/projects',  label: 'Projects',  icon: Wrench          },
  { to: '/quiz',      label: 'Quiz',      icon: Brain           },
  { to: '/profile',   label: 'Profile',   icon: User            },
]

export default function Sidebar() {
  const { user, logout }    = useAuth()
  const loc                 = useLocation()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)

  const links    = user ? privateLinks : publicLinks
  const isActive = (to) => loc.pathname === to

  const handleLogout = () => { logout(); navigate('/'); setOpen(false) }

  const NavLinks = () => (
    <ul className="space-y-1">
      {links.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <Link to={to} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}>
            <Icon size={18} />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen glass border-r border-white/[0.08] fixed left-0 top-0 z-40">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">🧞</span>
            <div>
              <p className="font-black text-lg bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                PathGenie
              </p>
              <p className="text-xs text-slate-500">AI Learning Assistant</p>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6">
          <NavLinks />
        </nav>

        {/* User section */}
        <div className="px-4 py-5 border-t border-white/[0.06] space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-sm font-bold text-brand-300 shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login"    className="w-full btn-ghost text-sm py-2.5"><LogIn size={15} /> Login</Link>
              <Link to="/register" className="w-full btn-primary text-sm py-2.5"><UserPlus size={15} /> Sign Up Free</Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.08] h-14 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-black text-lg" onClick={() => setOpen(false)}>
          <span className="text-xl">🧞</span>
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            PathGenie
          </span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-white/10">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-72 min-h-screen glass border-r border-white/[0.08] flex flex-col animate-slide-up">
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <p className="font-black text-lg bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                🧞 PathGenie
              </p>
            </div>
            <nav className="flex-1 px-4 py-5"><NavLinks /></nav>
            <div className="px-4 py-5 border-t border-white/[0.06] space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-sm font-bold text-brand-300">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setOpen(false)} className="w-full btn-ghost text-sm py-2.5"><LogIn size={15} /> Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="w-full btn-primary text-sm py-2.5"><UserPlus size={15} /> Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
