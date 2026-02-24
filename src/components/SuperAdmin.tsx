import { useState } from 'react'

interface EventRow {
  id: number; name: string; slug: string; org_name: string; status: string;
  admin_password: string; start_date: string; end_date: string; created_at: string;
  volunteer_count: number; slot_count: number; registration_count: number
}

export default function SuperAdmin() {
  const [masterKey, setMasterKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchEvents = async (key: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/events', { headers: { 'X-Master-Key': key } })
      const d = await res.json() as { events?: EventRow[]; error?: string }
      if (d.error) { setError('Clé invalide.'); return }
      setEvents(d.events ?? []); setAuthed(true)
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  const updateEvent = async (id: number, data: Record<string, string>) => {
    await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': masterKey },
      body: JSON.stringify(data),
    })
    await fetchEvents(masterKey)
  }

  const deleteEvent = async (ev: EventRow) => {
    if (!confirm(`⚠️ Supprimer "${ev.name}" et TOUTES ses données (${ev.volunteer_count} bénévoles, ${ev.registration_count} inscriptions)?`)) return
    await fetch(`/api/admin/events/${ev.id}`, {
      method: 'DELETE',
      headers: { 'X-Master-Key': masterKey },
    })
    await fetchEvents(masterKey)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-zinc-800 py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="text-2xl">📅</span>
              <span className="font-black text-xl tracking-tight">Rallyo</span>
            </a>
            <span className="text-zinc-600 ml-2">/ Super Admin</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="card max-w-sm w-full space-y-3">
            <h2 className="text-lg font-bold">🔐 Super Administration</h2>
            <p className="text-sm text-zinc-400">Accès avec la clé master.</p>
            <input className="input" type="password" placeholder="Master key" value={masterKey}
              onChange={e => setMasterKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchEvents(masterKey)} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={() => fetchEvents(masterKey)} disabled={loading} className="btn-tesla w-full disabled:opacity-50">
              {loading ? 'Connexion...' : '🔓 Accéder'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="text-2xl">📅</span>
              <span className="font-black text-xl tracking-tight">Rallyo</span>
            </a>
            <span className="text-zinc-600 ml-2">/ Super Admin</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchEvents(masterKey)} className="btn-ghost text-sm">🔄</button>
            <a href="/create" className="btn-ghost text-sm">+ Créer</a>
            <button onClick={() => setAuthed(false)} className="btn-ghost text-sm">←</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <h2 className="text-lg font-bold mb-4">📊 {events.length} événement{events.length !== 1 ? 's' : ''}</h2>

        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <a href={`/${ev.slug}`} className="font-bold text-ctq-blue hover:underline">{ev.name}</a>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      ev.status === 'open' ? 'bg-green-900/50 text-green-400' : ev.status === 'closed' ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>{ev.status}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {ev.org_name && `${ev.org_name} · `}
                    {ev.start_date} → {ev.end_date} · Créé {ev.created_at?.slice(0, 10)}
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{ev.volunteer_count}</div>
                    <div className="text-[10px] text-zinc-500">bénévoles</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{ev.slot_count}</div>
                    <div className="text-[10px] text-zinc-500">plages</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{ev.registration_count}</div>
                    <div className="text-[10px] text-zinc-500">inscriptions</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-zinc-800 rounded px-2 py-1 font-mono text-zinc-400">/{ev.slug}</span>
                <span className="bg-zinc-800 rounded px-2 py-1 text-zinc-500">mdp: <span className="text-zinc-300">{ev.admin_password}</span></span>
                <button onClick={() => updateEvent(ev.id, { status: ev.status === 'open' ? 'closed' : 'open' })}
                  className="bg-zinc-800 rounded px-2 py-1 text-zinc-400 hover:text-white transition-colors">
                  {ev.status === 'open' ? '🔒 Fermer' : '🔓 Ouvrir'}
                </button>
                <button onClick={() => deleteEvent(ev)} className="bg-zinc-800 rounded px-2 py-1 text-red-500 hover:text-red-400 transition-colors">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center text-zinc-500 py-12">
              <p className="text-4xl mb-3">📭</p>
              <p>Aucun événement. <a href="/create" className="text-ctq-blue hover:underline">Créer le premier!</a></p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-3 text-center text-xs text-zinc-600">
        Rallyo Super Admin — Master key requise
      </footer>
    </div>
  )
}
