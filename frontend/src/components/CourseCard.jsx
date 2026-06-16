import { Star, Clock, ExternalLink, User, Tag, Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import api from '../utils/api'

const platformColor = {
  'Udemy':              'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Coursera':           'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'YouTube':            'bg-red-500/15 text-red-300 border-red-500/30',
  'Khan Academy':       'bg-green-500/15 text-green-300 border-green-500/30',
  'freeCodeCamp':       'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'NPTEL':              'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'MIT OpenCourseWare': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'edX':                'bg-pink-500/15 text-pink-300 border-pink-500/30',
}

const levelColor = {
  'Beginner':     'bg-green-500/10 text-green-400',
  'Intermediate': 'bg-yellow-500/10 text-yellow-400',
  'Advanced':     'bg-red-500/10 text-red-400',
}

export default function CourseCard({ course, index, initialBookmarked = false, initialBookmarkId = null, isLoggedIn = false }) {
  const [bookmarked,  setBookmarked]  = useState(initialBookmarked)
  const [bookmarkId,  setBookmarkId]  = useState(initialBookmarkId)
  const [loading,     setLoading]     = useState(false)

  const pc   = platformColor[course.platform] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  const lc   = levelColor[course.level]       || 'bg-slate-500/10 text-slate-400'
  const free = course.mode === 'free' || course.price?.toLowerCase() === 'free'

  const toggleBookmark = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { window.location.href = '/login'; return }
    setLoading(true)
    try {
      if (bookmarked && bookmarkId) {
        await api.delete(`/bookmarks/remove/${bookmarkId}`)
        setBookmarked(false)
        setBookmarkId(null)
      } else {
        const { data } = await api.post('/bookmarks/add', {
          title:       course.title,
          platform:    course.platform,
          url:         course.url,
          price:       course.price,
          level:       course.level,
          rating:      course.rating,
          description: course.description,
          mode:        course.mode,
          instructor:  course.instructor,
        })
        setBookmarked(true)
        setBookmarkId(data.id)
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setBookmarked(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col gap-4 hover:border-white/[0.15] transition-all duration-300 animate-slide-up group"
         style={{ animationDelay: `${index * 70}ms` }}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className={`badge border ${pc}`}>{course.platform}</span>
          <span className={`badge ${lc}`}>{course.level}</span>
          <span className={`badge ${free ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
            {free ? '✓ Free' : course.price}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Bookmark button */}
          <button onClick={toggleBookmark} disabled={loading}
            title={bookmarked ? "Remove bookmark" : "Save course"}
            className={`p-1.5 rounded-lg transition-all ${
              bookmarked
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
            }`}>
            {bookmarked
              ? <BookmarkCheck size={16} />
              : <Bookmark size={16} />
            }
          </button>
          {/* External link */}
          <a href={course.url} target="_blank" rel="noopener noreferrer"
             className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="font-bold text-white leading-snug mb-1.5 group-hover:text-brand-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{course.description}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-slate-300 font-medium">{course.rating}</span>
        </span>
        {course.duration && (
          <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
        )}
        {course.instructor && (
          <span className="flex items-center gap-1"><User size={12} />{course.instructor}</span>
        )}
      </div>

      {/* Tags */}
      {course.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.06]">
          {course.tags.slice(0, 4).map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-500">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
