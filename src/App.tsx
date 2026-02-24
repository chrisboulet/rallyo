import { useState, useEffect } from 'react'
import { EventData } from './types'
import Grid from './components/Grid'
import Register from './components/Register'
import MySchedule from './components/MySchedule'
import Admin from './components/Admin'
import Landing from './components/Landing'
import CreateEvent from './components/CreateEvent'

type View = 'grid' | 'register' | 'my' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('grid')
  const [data, setData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Extract slug from URL path
  // slug = first path segment (e.g. /salon-auto-2026 → "salon-auto-2026")
  const slug = window.location.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')[0] || ''

  const fetchEvent = async () => {
    if (!slug) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${slug}`)
      if (!res.ok) { setError('Événement introuvable.'); return }
      const d = await res.json() as EventData
      setData(d)
    } catch {
      setError('Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvent() }, [slug])

  // Special routes
  if (!slug) return <Landing />
  if (slug === 'create') return <CreateEvent />

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">📅</div>
        <div>Chargement...</div>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center max-w-sm">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-lg font-bold text-red-400 mb-2">{error || 'Erreur'}</h2>
        <a href="/" className="text-ctq-blue hover:underline text-sm">← Retour à l'accueil</a>
      </div>
    </div>
  )

  const tabs: { key: View; label: string; emoji: string }[] = [
    { key: 'grid', label: 'Horaire', emoji: '📅' },
    { key: 'register', label: 'S\'inscrire', emoji: '✋' },
    { key: 'my', label: 'Mon horaire', emoji: '👤' },
    { key: 'admin', label: 'Admin', emoji: '🔒' },
  ]

  const { event } = data

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {event.logo_url && <img src={event.logo_url} alt={event.org_name} className="w-10 h-10 rounded-full" />}
          <div>
            <div className="font-bold text-sm leading-tight">{event.name}</div>
            <div className="text-xs text-zinc-500 leading-tight">
              {event.org_name && `${event.org_name} · `}
              {event.start_date} – {event.end_date}
            </div>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 pb-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                view === tab.key
                  ? 'bg-ctq-blue text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {view === 'grid' && <Grid data={data} onRefresh={fetchEvent} />}
        {view === 'register' && <Register data={data} onDone={() => { fetchEvent(); setView('grid') }} />}
        {view === 'my' && <MySchedule data={data} />}
        {view === 'admin' && <Admin data={data} onRefresh={fetchEvent} />}
      </main>

      <footer className="border-t border-zinc-800 py-3 text-center text-xs text-zinc-600">
        Propulsé par <a href="/" className="text-ctq-blue hover:underline">Rallyo</a> — Planification bénévoles pour OBNL
      </footer>
    </div>
  )
}
