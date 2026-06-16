export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-brand-900" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-violet-500 animate-spin"
             style={{ animationDuration: '0.7s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-slate-400 text-sm animate-pulse">{text}</p>
    </div>
  )
}
