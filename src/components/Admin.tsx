import { useState } from 'react'
import { EventData, Volunteer } from '../types'

interface Props { data: EventData; onRefresh: () => void }

export default function Admin({ data, onRefresh }: Props) {
  const { event, days, slots } = data
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showConfig, setShowConfig] = useState(false)

  const slotsByDay = (dayId: number) => slots.filter(s => s.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order)
  const allSlotLabels = [...new Set(slots.map(s => s.label))]

  const fetchVolunteers = async (pwd: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/events/${event.slug}/admin`, { headers: { 'X-Admin-Key': pwd } })
      const d = await res.json() as { volunteers?: Volunteer[]; error?: string }
      if (d.error) { setError('Mot de passe incorrect.'); return }
      setVolunteers(d.volunteers ?? []); setAuthed(true)
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  const deleteVolunteer = async (v: Volunteer) => {
    if (!confirm(`Supprimer ${v.name} et toutes ses inscriptions?`)) return
    await fetch(`/api/events/${event.slug}/admin/volunteers/${v.id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Key': password },
    })
    await fetchVolunteers(password)
    onRefresh()
  }

  const toggleReg = async (v: Volunteer, slotId: number) => {
    const has = v.slot_ids.includes(slotId)
    await fetch(`/api/events/${event.slug}/admin/registrations`, {
      method: has ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': password },
      body: JSON.stringify({ volunteer_id: v.id, slot_id: slotId }),
    })
    await fetchVolunteers(password)
    onRefresh()
  }

  const updateSlotConfig = async (slotId: number, field: 'min_volunteers' | 'max_volunteers', value: number) => {
    await fetch(`/api/events/${event.slug}/admin/slots`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': password },
      body: JSON.stringify({ slot_id: slotId, [field]: value }),
    })
    onRefresh()
  }

  const exportCSV = () => {
    const rows = [['Nom', 'Email', 'Téléphone', 'Token', 'Jour', 'Plage', 'Heures']]
    for (const v of volunteers) {
      if (v.slot_ids.length === 0) rows.push([v.name, v.email || '', v.phone || '', v.token, '', '', ''])
      else for (const sid of v.slot_ids) {
        const slot = slots.find(s => s.id === sid)
        const day = days.find(d => d.id === slot?.day_id)
        rows.push([v.name, v.email || '', v.phone || '', v.token, day?.label ?? '', slot?.label ?? '', slot ? `${slot.start_time}–${slot.end_time}` : ''])
      }
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `benevoles-${event.slug}.csv`; a.click()
  }

  // Coverage
  const coverage: Record<number, number> = {}
  for (const v of volunteers) for (const sid of v.slot_ids) coverage[sid] = (coverage[sid] || 0) + 1

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto">
        <h2 className="text-lg font-bold mb-4">🔒 Administration</h2>
        <div className="card space-y-3">
          <p className="text-sm text-zinc-400">Accès réservé aux organisateurs.</p>
          <input className="input" type="password" placeholder="Mot de passe admin" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchVolunteers(password)} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={() => fetchVolunteers(password)} disabled={loading} className="btn-tesla w-full disabled:opacity-50">
            {loading ? 'Connexion...' : '🔓 Accéder'}
          </button>
        </div>
      </div>
    )
  }

  const filtered = volunteers.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">🔒 Admin — {volunteers.length} bénévoles</h2>
        <div className="flex gap-2">
          <button onClick={async () => {
            const newStatus = event.status === 'open' ? 'closed' : 'open'
            await fetch(`/api/events/${event.slug}/admin/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'X-Admin-Key': password },
              body: JSON.stringify({ status: newStatus }),
            })
            onRefresh()
          }} className={`btn-ghost text-sm ${event.status === 'closed' ? 'text-red-400' : 'text-green-400'}`}>
            {event.status === 'open' ? '🟢 Ouvert' : '🔴 Fermé'}
          </button>
          <button onClick={() => setShowConfig(!showConfig)} className={`btn-ghost text-sm ${showConfig ? 'ring-1 ring-ctq-blue' : ''}`}>⚙️ Config</button>
          <button onClick={exportCSV} className="btn-ghost text-sm">📥 CSV</button>
          <button onClick={() => { fetchVolunteers(password); onRefresh() }} className="btn-ghost text-sm">🔄</button>
          <button onClick={() => setAuthed(false)} className="btn-ghost text-sm">←</button>
        </div>
      </div>

      {/* Coverage */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-3 text-sm">Couverture par plage</h3>
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="text-left pr-3 py-1 text-zinc-500"></th>
              {days.map(d => <th key={d.id} className="px-2 py-1 text-zinc-400 text-center">{d.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {allSlotLabels.map(label => (
              <tr key={label}>
                <td className="pr-3 py-1 text-zinc-400 font-medium">{label}</td>
                {days.map(day => {
                  const slot = slotsByDay(day.id).find(s => s.label === label)
                  if (!slot) return <td key={day.id} className="px-1 py-0.5 text-center text-zinc-700">—</td>
                  const count = coverage[slot.id] || 0
                  const color = count === 0 ? 'bg-red-900/50 text-red-300' : count < slot.min_volunteers ? 'bg-yellow-900/50 text-yellow-300' : count >= slot.max_volunteers && slot.max_volunteers > 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'
                  return <td key={day.id} className="px-1 py-0.5 text-center"><span className={`inline-block px-2 py-0.5 rounded font-bold ${color}`}>{count}/{slot.max_volunteers}</span></td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Config */}
      {showConfig && (
        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-3 text-sm">⚙️ Min / Max bénévoles par plage</h3>
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left pr-3 py-1 text-zinc-500"></th>
                {days.map(d => <th key={d.id} className="px-2 py-1 text-zinc-400 text-center">{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {allSlotLabels.map(label => (
                <tr key={label}>
                  <td className="pr-3 py-2 text-zinc-400 font-medium">{label}</td>
                  {days.map(day => {
                    const slot = slotsByDay(day.id).find(s => s.label === label)
                    if (!slot) return <td key={day.id} className="text-center text-zinc-700">—</td>
                    return (
                      <td key={day.id} className="px-1 py-1">
                        <div className="flex flex-col gap-1 items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500 text-[10px] w-6">Min</span>
                            <input type="number" min={0} max={20} value={slot.min_volunteers}
                              onChange={e => updateSlotConfig(slot.id, 'min_volunteers', parseInt(e.target.value) || 0)}
                              className="w-10 bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-center text-xs text-zinc-200 focus:outline-none focus:border-ctq-blue" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500 text-[10px] w-6">Max</span>
                            <input type="number" min={0} max={20} value={slot.max_volunteers}
                              onChange={e => updateSlotConfig(slot.id, 'max_volunteers', parseInt(e.target.value) || 0)}
                              className="w-10 bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-center text-xs text-zinc-200 focus:outline-none focus:border-ctq-blue" />
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-zinc-600 mt-2">Sauvegarde automatique. Max=0 = illimité.</p>
        </div>
      )}

      {/* Volunteers */}
      <div>
        <input className="input mb-3" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-semibold">{v.name}</span>
                  <span className="ml-2 font-mono text-xs text-ctq-blue">{v.token}</span>
                  {v.email && <span className="ml-2 text-xs text-zinc-500">{v.email}</span>}
                  {v.phone && <span className="ml-2 text-xs text-zinc-500">{v.phone}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{v.slot_ids.length} plage{v.slot_ids.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => deleteVolunteer(v)} className="text-xs text-red-500 hover:text-red-400" title="Supprimer">🗑️</button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                {days.map(day => (
                  <div key={day.id} className="space-y-1">
                    <div className="text-[10px] text-center text-zinc-500 font-semibold">{day.label}</div>
                    {slotsByDay(day.id).map(slot => {
                      const has = v.slot_ids.includes(slot.id)
                      return (
                        <button key={slot.id} onClick={() => toggleReg(v, slot.id)}
                          className={`w-full text-[10px] rounded px-1 py-1 border transition-all ${
                            has ? 'bg-ctq-blue/80 border-ctq-blue text-white hover:bg-blue-900' : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-ctq-blue hover:text-zinc-400'
                          }`}>
                          {slot.start_time}–{slot.end_time}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-zinc-500 text-center py-8">Aucun bénévole trouvé.</p>}
        </div>
      </div>
    </div>
  )
}
