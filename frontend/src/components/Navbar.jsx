import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen, Brain, Map, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const publicLinks = [
  { to: '/',        label: 'Home',    icon: Sparkles       },
  { to: '/courses', label: 'Courses', icon: BookOpen       },
  { to: '/roadmap', label: 'Roadmap', icon: Map            },
  { to: '/quiz',    label: 'Quiz',    icon: Brain          },
]

export default function Navbar() {
  const { user, logout }    = useAuth()
  const loc                 = useLocation()
  const navigate            = useNavigate()
  const [menuOpen, setMenu] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setMenu(false) }
  const active = (to) => loc.pathname === to

  const navLinks = user
    ? [...publicLinks, { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
    : publicLinks

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl" onClick={() => setMenu(false)}>
          <span className="text-2xl">🧞</span>
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            PathGenie
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active(to) ? 'bg-brand-600/25 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-xs font-bold text-brand-300">
                  {user.name[0].toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-3">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setMenu(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.08] px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenu(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active(to) ? 'bg-brand-600/25 text-brand-400' : 'text-slate-300 hover:bg-white/[0.06]'
              }`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/[0.08] space-y-2">
            {user ? (
              <button onClick={handleLogout} className="w-full btn-ghost text-sm py-3">
                <LogOut size={15} /> Logout ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMenu(false)} className="w-full btn-ghost text-sm py-3">Login</Link>
                <Link to="/register" onClick={() => setMenu(false)} className="w-full btn-primary text-sm py-3">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
