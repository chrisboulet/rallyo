import { useState } from 'react'
import { EventData } from '../types'

interface Props { data: EventData }

export default function MySchedule({ data }: Props) {
  const { event, days, slots } = data
  const [token, setToken] = useState('')
  const [volunteer, setVolunteer] = useState<{ id: number; name: string } | null>(null)
  const [mySlotIds, setMySlotIds] = useState<number[]>([])
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const slotsByDay = (dayId: number) => slots.filter(s => s.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order)

  const lookup = async () => {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/events/${event.slug}/volunteer/${token.trim().toUpperCase()}`)
      const d = await res.json() as { volunteer?: { id: number; name: string }; slot_ids?: number[]; error?: string }
      if (d.error) { setError(d.error); return }
      setVolunteer(d.volunteer!)
      setMySlotIds(d.slot_ids ?? [])
      setSelected(new Set(d.slot_ids ?? []))
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  const toggleSlot = (slotId: number) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(slotId)) n.delete(slotId); else n.add(slotId); return n })
  }

  const saveChanges = async () => {
    setLoading(true); setSaved(false)
    try {
      await fetch(`/api/events/${event.slug}/volunteer/${token.trim().toUpperCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_ids: Array.from(selected) }),
      })
      setSaved(true); setEditing(false); setMySlotIds(Array.from(selected))
    } catch { setError('Erreur.') }
    finally { setLoading(false) }
  }

  if (!volunteer) {
    return (
      <div className="max-w-sm mx-auto">
        <h2 className="text-lg font-bold mb-4">👤 Mon horaire</h2>
        <div className="card space-y-3">
          <p className="text-sm text-zinc-400">Entre ton code personnel pour voir ou modifier tes disponibilités.</p>
          <input className="input font-mono text-lg tracking-widest uppercase" placeholder="Ex: AB3X7K2M" value={token}
            onChange={e => setToken(e.target.value.toUpperCase())} maxLength={8} onKeyDown={e => e.key === 'Enter' && lookup()} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={lookup} disabled={loading} className="btn-tesla w-full disabled:opacity-50">
            {loading ? 'Recherche...' : '🔍 Trouver mon horaire'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">{volunteer.name}</h2>
          <p className="text-sm text-zinc-500">Code: <span className="font-mono text-ctq-blue">{token.toUpperCase()}</span></p>
        </div>
        <button onClick={() => { setVolunteer(null); setToken('') }} className="btn-ghost text-sm">← Retour</button>
      </div>

      {saved && <div className="card bg-green-900/30 border-green-800 text-green-400 text-sm mb-4">✅ Disponibilités mises à jour!</div>}

      {!editing ? (
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Tes plages ({mySlotIds.length})</h3>
            <button onClick={() => setEditing(true)} className="btn-ghost text-sm">✏️ Modifier</button>
          </div>
          {mySlotIds.length === 0 ? (
            <p className="text-zinc-500 text-sm">Aucune plage inscrite.</p>
          ) : (
            <div className="space-y-1">
              {mySlotIds.map(slotId => {
                const slot = slots.find(s => s.id === slotId)
                const day = days.find(d => d.id === slot?.day_id)
                if (!slot || !day) return null
                return (
                  <div key={slotId} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-ctq-blue inline-block"></span>
                    <span className="text-zinc-300">{day.label}</span>
                    <span className="text-zinc-500">—</span>
                    <span className="text-zinc-400">{slot.label} ({slot.start_time} – {slot.end_time})</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h3 className="font-semibold mb-3">Modifier mes disponibilités</h3>
          <div className="space-y-3 mb-4">
            {days.map(day => (
              <div key={day.id}>
                <div className="text-sm font-semibold text-ctq-blue mb-1">{day.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  {slotsByDay(day.id).map(slot => (
                    <button key={slot.id} type="button" onClick={() => toggleSlot(slot.id)}
                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                        selected.has(slot.id) ? 'bg-ctq-blue border-ctq-blue-dark text-white font-bold' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-ctq-blue'
                      }`}>
                      <div>{slot.label}</div>
                      <div className="text-[10px] opacity-70">{slot.start_time} – {slot.end_time}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <div className="flex gap-3">
            <button onClick={saveChanges} disabled={loading} className="btn-tesla flex-1 disabled:opacity-50">{loading ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
            <button onClick={() => { setEditing(false); setSelected(new Set(mySlotIds)) }} className="btn-ghost">Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}
