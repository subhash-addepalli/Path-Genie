import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Calendar, Edit2, Lock, Trash2,
  CheckCircle, BookOpen, Map, Eye, EyeOff,
  Bookmark, BookmarkCheck, ExternalLink, Star
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

const TABS = [
  { id: 'info',      label: 'Profile Info', icon: User     },
  { id: 'courses',   label: 'My Courses',   icon: Bookmark },
  { id: 'roadmaps',  label: 'My Roadmaps',  icon: Map      },
]

const GRADE_COLOR = {
  A: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  F: 'text-red-400 bg-red-500/15 border-red-500/30',
}

const PHASE_STYLES = {
  1: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Beginner'     },
  2: { color: 'text-brand-400',   bg: 'bg-brand-500',   label: 'Intermediate' },
  3: { color: 'text-violet-400',  bg: 'bg-violet-500',  label: 'Advanced'     },
}

export default function Profile() {
  const { user, logout }      = useAuth()
  const navigate              = useNavigate()
  const [tab,       setTab]   = useState('info')
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [roadmaps,  setRoadmaps]  = useState([])

  // Edit name state
  const [editingName, setEditingName] = useState(false)
  const [newName,     setNewName]     = useState(user?.name || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg,     setNameMsg]     = useState('')

  // Change password state
  const [showPwd,      setShowPwd]      = useState(false)
  const [currentPwd,   setCurrentPwd]   = useState('')
  const [newPwd,       setNewPwd]       = useState('')
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [pwdLoading,   setPwdLoading]   = useState(false)
  const [pwdMsg,       setPwdMsg]       = useState('')

  // Delete account state
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleteLoading,setDeleteLoading]= useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    try {
      const [statsRes, bookmarksRes, roadmapsRes] = await Promise.all([
        api.get('/progress/quiz/stats'),
        api.get('/bookmarks/list'),
        api.get('/roadmap/my-roadmaps'),
      ])
      setStats(statsRes.data)
      setBookmarks(bookmarksRes.data.bookmarks || [])
      setRoadmaps(roadmapsRes.data.roadmaps   || [])
    } catch {}
    finally { setLoading(false) }
  }

  const saveName = async () => {
    if (!newName.trim()) return
    setNameLoading(true); setNameMsg('')
    try {
      await api.put('/auth/update-name', { name: newName })
      setNameMsg('✅ Name updated!')
      setEditingName(false)
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('cg_user') || '{}')
      userData.name  = newName
      localStorage.setItem('cg_user', JSON.stringify(userData))
    } catch (err) {
      setNameMsg('❌ ' + (err.response?.data?.detail || 'Failed to update'))
    } finally { setNameLoading(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwdLoading(true); setPwdMsg('')
    try {
      await api.put('/auth/change-password', {
        current_password: currentPwd,
        new_password:     newPwd,
      })
      setPwdMsg('✅ Password changed successfully!')
      setCurrentPwd(''); setNewPwd(''); setShowPwd(false)
    } catch (err) {
      setPwdMsg('❌ ' + (err.response?.data?.detail || 'Failed to change password'))
    } finally { setPwdLoading(false) }
  }

  const deleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await api.delete('/auth/delete-account')
      logout()
      navigate('/')
    } catch { setDeleteLoading(false) }
  }

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/bookmarks/remove/${id}`)
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch {}
  }

  const deleteRoadmap = async (id) => {
    try {
      await api.delete(`/roadmap/delete/${id}`)
      setRoadmaps(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const openRoadmap = (r) => {
    navigate('/roadmap', { state: { savedRoadmap: r } })
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10"><Loader text="Loading profile..." /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl font-black">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account and saved content</p>
      </div>

      {/* User hero card */}
      <div className="card bg-gradient-to-br from-brand-600/10 to-violet-600/10 border-brand-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-brand-600/30 border-2 border-brand-500/40 flex items-center justify-center text-3xl font-black text-brand-300 shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-2xl font-black text-white">{user?.name}</h2>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <Mail size={14} /> {user?.email}
          </p>
          {stats && (
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-400" />
                {stats.total_quizzes} quizzes taken
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <BookOpen size={12} className="text-brand-400" />
                {bookmarks.length} courses saved
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Map size={12} className="text-violet-400" />
                {roadmaps.length} roadmaps saved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t.id
                ? 'border-brand-500 text-brand-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            <t.icon size={15} /> {t.label}
            {t.id === 'courses'  && bookmarks.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs">{bookmarks.length}</span>
            )}
            {t.id === 'roadmaps' && roadmaps.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">{roadmaps.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile Info ── */}
      {tab === 'info' && (
        <div className="space-y-4 animate-fade-in">

          {/* Edit Name */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2"><Edit2 size={16} className="text-brand-400" /> Full Name</h3>
              {!editingName && (
                <button onClick={() => { setEditingName(true); setNewName(user?.name || '') }}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Edit</button>
              )}
            </div>
            {editingName ? (
              <div className="space-y-3">
                <input className="input" value={newName} onChange={e => setNewName(e.target.value)} />
                {nameMsg && <p className="text-sm text-slate-400">{nameMsg}</p>}
                <div className="flex gap-2">
                  <button onClick={saveName} disabled={nameLoading} className="btn-primary text-sm py-2 px-4">
                    {nameLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingName(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-white font-medium">{user?.name}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="card space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2"><Mail size={16} className="text-brand-400" /> Email Address</h3>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-xs text-slate-600">Email cannot be changed</p>
          </div>

          {/* Change Password */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2"><Lock size={16} className="text-brand-400" /> Password</h3>
              <button onClick={() => setShowPwd(!showPwd)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                {showPwd ? 'Cancel' : 'Change'}
              </button>
            </div>
            {showPwd && (
              <form onSubmit={changePassword} className="space-y-3">
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} className="input pr-11"
                    placeholder="Current password" value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)} required />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} className="input pr-11"
                    placeholder="New password (min 6 chars)" value={newPwd}
                    onChange={e => setNewPwd(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwdMsg && <p className="text-sm text-slate-400">{pwdMsg}</p>}
                <button type="submit" disabled={pwdLoading} className="btn-primary text-sm py-2 px-4">
                  {pwdLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>

          {/* Delete Account */}
          <div className="card space-y-4 border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-red-400 flex items-center gap-2"><Trash2 size={16} /> Delete Account</h3>
                <p className="text-xs text-slate-500 mt-1">This will permanently delete all your data</p>
              </div>
              <button onClick={() => setShowDelete(!showDelete)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                {showDelete ? 'Cancel' : 'Delete'}
              </button>
            </div>
            {showDelete && (
              <div className="space-y-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">⚠️ Are you sure? This cannot be undone. All your quizzes, bookmarks and roadmaps will be deleted.</p>
                <button onClick={deleteAccount} disabled={deleteLoading} className="btn-danger text-sm py-2 px-4">
                  <Trash2 size={14} /> {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: My Courses ── */}
      {tab === 'courses' && (
        <div className="space-y-4 animate-fade-in">
          {bookmarks.length === 0 ? (
            <div className="card text-center py-16 space-y-3 border-dashed">
              <Bookmark size={48} className="mx-auto text-slate-700" />
              <h3 className="font-bold text-white">No saved courses yet</h3>
              <p className="text-slate-500 text-sm">Click the bookmark icon on any course to save it</p>
              <button onClick={() => navigate('/courses')} className="btn-primary mx-auto px-6">
                <BookOpen size={15} /> Find Courses
              </button>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-bold">{bookmarks.length}</span> saved courses
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {bookmarks.map((b, i) => (
                  <div key={b.id} className="card hover:border-white/[0.15] transition-all space-y-3 animate-slide-up"
                       style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm leading-snug">{b.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="badge bg-white/[0.06] text-slate-400 text-xs">{b.platform}</span>
                          <span className={`badge text-xs ${b.mode === 'free' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                            {b.mode === 'free' ? '✓ Free' : b.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <a href={b.url} target="_blank" rel="noopener noreferrer"
                           className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                          <ExternalLink size={15} />
                        </a>
                        <button onClick={() => removeBookmark(b.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {b.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 border-t border-white/[0.06]">
                      {b.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" /> {b.rating}
                        </span>
                      )}
                      <span>{b.level}</span>
                      <span className="ml-auto">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: My Roadmaps ── */}
      {tab === 'roadmaps' && (
        <div className="space-y-4 animate-fade-in">
          {roadmaps.length === 0 ? (
            <div className="card text-center py-16 space-y-3 border-dashed">
              <Map size={48} className="mx-auto text-slate-700" />
              <h3 className="font-bold text-white">No saved roadmaps yet</h3>
              <p className="text-slate-500 text-sm">Generate a career roadmap and click Save to bookmark it</p>
              <button onClick={() => navigate('/roadmap')} className="btn-primary mx-auto px-6">
                <Map size={15} /> Create Roadmap
              </button>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-bold">{roadmaps.length}</span> saved roadmaps
              </p>
              <div className="space-y-4">
                {roadmaps.map((r, i) => {
                  const allTopics       = r.roadmap_data?.phases?.flatMap(p => p.topics) || []
                  const completedTopics = r.completed_topics || []
                  const progressPct     = allTopics.length > 0
                    ? Math.round((completedTopics.length / allTopics.length) * 100) : 0
                  const phaseStyle      = PHASE_STYLES[r.current_phase] || PHASE_STYLES[1]

                  return (
                    <div key={r.id} className="card hover:border-white/[0.15] transition-all space-y-4 animate-slide-up"
                         style={{ animationDelay: `${i * 70}ms` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold text-white">{r.roadmap_data?.title || r.goal}</h4>
                          <p className="text-xs text-slate-500 truncate">{r.goal}</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className={`badge text-xs ${phaseStyle.color} bg-white/[0.06]`}>
                              📍 Phase {r.current_phase} — {phaseStyle.label}
                            </span>
                            <span className="badge text-xs bg-white/[0.06] text-slate-400">
                              {completedTopics.length}/{allTopics.length} topics done
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => navigate('/roadmap', { state: { savedRoadmap: r } })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                            title="Open roadmap">
                            <ExternalLink size={15} />
                          </button>
                          <button onClick={() => deleteRoadmap(r.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete roadmap">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span className="text-white font-medium">{progressPct}%</span>
                        </div>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className={`h-full ${phaseStyle.bg} rounded-full transition-all duration-500`}
                               style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Saved on {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
