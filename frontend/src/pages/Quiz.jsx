import { useState, useEffect, useRef } from 'react'
import { Brain, Clock, CheckCircle, XCircle, Sparkles, RotateCcw, Trophy, ChevronRight, ChevronLeft } from 'lucide-react'
import api from '../utils/api'
import Loader from '../components/Loader'

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   cls: 'border-emerald-500 bg-emerald-600/15 text-emerald-300' },
  { value: 'medium', label: 'Medium', cls: 'border-amber-500 bg-amber-600/15 text-amber-300' },
  { value: 'hard',   label: 'Hard',   cls: 'border-red-500 bg-red-600/15 text-red-300' },
]
const Q_COUNTS = [5, 10, 15, 20]
const GRADE_COLOR = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }

function Timer({ totalSeconds, onExpire }) {
  const [left, setLeft] = useState(totalSeconds)
  const timerRef = useRef()

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); onExpire(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const pct   = (left / totalSeconds) * 100
  const color = pct > 50 ? 'text-emerald-400' : pct > 20 ? 'text-amber-400' : 'text-red-400 animate-pulse'
  const mm    = String(Math.floor(left / 60)).padStart(2, '0')
  const ss    = String(left % 60).padStart(2, '0')

  return (
    <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${color}`}>
      <Clock size={17} /> {mm}:{ss}
    </div>
  )
}

export default function Quiz() {
  const [topic,      setTopic]      = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQ,       setNumQ]       = useState(10)
  const [phase,      setPhase]      = useState('setup')   // setup|loading|taking|result
  const [quiz,       setQuiz]       = useState(null)
  const [answers,    setAnswers]    = useState({})
  const [current,    setCurrent]    = useState(0)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState('')

  const generate = async (e) => {
    e?.preventDefault()
    if (!topic.trim()) return
    setPhase('loading'); setError('')
    try {
      const { data } = await api.post('/quiz/generate', { topic, difficulty, num_questions: numQ })
      setQuiz(data); setAnswers({}); setCurrent(0); setPhase('taking')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz.'); setPhase('setup')
    }
  }

  const select = (qid, opt) => setAnswers(p => ({ ...p, [String(qid)]: opt }))

  const submit = async () => {
    try {
      const { data } = await api.post('/quiz/submit', {
        quiz_id: quiz.quiz_id, answers, questions: quiz._answers,
      })
      setResult(data); setPhase('result')
      // Save to history if logged in
      const token = localStorage.getItem('cg_token')
      if (token) {
        api.post('/progress/quiz/save', {
          topic: quiz.topic, difficulty: quiz.difficulty,
          score: data.score, total: data.total,
          percentage: data.percentage, grade: data.grade,
        }).catch(() => {})
      }
    } catch { setError('Failed to submit. Please try again.') }
  }

  const reset = () => { setPhase('setup'); setQuiz(null); setResult(null); setError('') }

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-400">
          <Sparkles size={12} className="text-violet-400" /> AI-Generated MCQ Quiz
        </span>
        <h1 className="text-4xl font-black">Test Your Knowledge</h1>
        <p className="text-slate-400">Enter any topic — get an instant personalized quiz</p>
      </div>

      <form onSubmit={generate} className="card space-y-6 animate-slide-up">
        <div>
          <label className="label">Topic / Subject</label>
          <input className="input" placeholder="e.g. Operating Systems, Thermodynamics, OOP in Java..."
            value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button type="button" key={d.value} onClick={() => setDifficulty(d.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm border font-medium transition-all ${
                    difficulty === d.value ? d.cls : 'border-white/[0.08] text-slate-500 hover:text-slate-300'
                  }`}>{d.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Questions</label>
            <div className="flex gap-2">
              {Q_COUNTS.map(n => (
                <button type="button" key={n} onClick={() => setNumQ(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm border font-medium transition-all ${
                    numQ === n ? 'border-brand-500 bg-brand-600/20 text-brand-300' : 'border-white/[0.08] text-slate-500 hover:text-slate-300'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}

        <button type="submit" disabled={!topic.trim()} className="btn-primary w-full py-3.5">
          <Brain size={18} /> Generate Quiz
        </button>
      </form>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[['MCQ Format','4 options each'],['Timed','90s per question'],['Explained','Learn from answers']].map(([t,d]) => (
          <div key={t} className="card py-4 space-y-1">
            <p className="font-semibold text-sm">{t}</p>
            <p className="text-xs text-slate-500">{d}</p>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Loader text="AI is crafting your personalized quiz..." />
    </div>
  )

  // ── Taking ─────────────────────────────────────────────────────────────────
  if (phase === 'taking' && quiz) {
    const q       = quiz.questions[current]
    const total   = quiz.questions.length
    const answered = Object.keys(answers).length

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5 animate-fade-in">
        {/* Header bar */}
        <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">{quiz.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Question {current + 1} of {total} · {answered} answered
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-300"
                   style={{ width: `${((current + 1) / total) * 100}%` }} />
            </div>
            <Timer totalSeconds={quiz.time_limit} onExpire={submit} />
          </div>
        </div>

        {/* Question */}
        <div className="card space-y-5 animate-slide-up">
          <p className="text-lg font-semibold leading-relaxed">{q.question}</p>
          <div className="space-y-3">
            {Object.entries(q.options).map(([key, text]) => {
              const sel = answers[String(q.id)] === key
              return (
                <button key={key} onClick={() => select(q.id, key)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-3 ${
                    sel
                      ? 'border-brand-500 bg-brand-600/20 text-white'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}>
                  <span className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                    sel ? 'border-brand-400 bg-brand-500 text-white' : 'border-white/20 text-slate-500'
                  }`}>{key}</span>
                  <span className="text-sm leading-relaxed">{text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Nav row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 flex-wrap max-w-[60%]">
            {quiz.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  i === current          ? 'bg-brand-600 text-white' :
                  answers[String(i)]     ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                                           'bg-white/[0.05] text-slate-500 hover:bg-white/[0.10]'
                }`}>{i + 1}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {current > 0 && (
              <button onClick={() => setCurrent(p => p - 1)} className="btn-ghost text-sm py-2 px-3">
                <ChevronLeft size={15} /> Prev
              </button>
            )}
            {current < total - 1
              ? <button onClick={() => setCurrent(p => p + 1)} className="btn-primary text-sm py-2 px-4">
                  Next <ChevronRight size={15} />
                </button>
              : <button onClick={submit} className="btn-primary text-sm py-2 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25">
                  Submit Quiz ✓
                </button>
            }
          </div>
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="card text-center space-y-4 border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-brand-600/10">
        <Trophy size={52} className="mx-auto text-amber-400" />
        <h2 className="text-3xl font-black">Quiz Complete!</h2>
        <div className={`text-8xl font-black ${GRADE_COLOR[result.grade]}`}>{result.grade}</div>
        <p className="text-2xl font-bold text-white">{result.percentage}%</p>
        <p className="text-slate-400">{result.score} correct out of {result.total} questions</p>
        <button onClick={reset} className="btn-primary mx-auto px-8">
          <RotateCcw size={15} /> Try Another Quiz
        </button>
      </div>

      <h3 className="text-xl font-bold">Detailed Results</h3>
      <div className="space-y-3">
        {result.results.map((r, i) => (
          <div key={i} className={`card border ${r.is_correct ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
            <div className="flex gap-3">
              {r.is_correct
                ? <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                : <XCircle    size={20} className="text-red-400 shrink-0 mt-0.5" />}
              <div className="space-y-2 flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{i + 1}. {r.question}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-white/[0.05] text-slate-400">
                    Your answer: <span className={r.is_correct ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {r.user_answer || 'Skipped'}
                    </span>
                  </span>
                  {!r.is_correct && (
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
                      Correct: <span className="font-medium">{r.correct_answer}</span>
                    </span>
                  )}
                </div>
                {r.explanation && (
                  <p className="text-xs text-slate-500 leading-relaxed border-t border-white/[0.05] pt-2">{r.explanation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return null
}
