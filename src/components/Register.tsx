import { useState } from 'react'
import { EventData } from '../types'

interface Props { data: EventData; onDone: () => void }

export default function Register({ data, onDone }: Props) {
  const { event, days, slots } = data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const slotsByDay = (dayId: number) => slots.filter(s => s.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order)

  const toggleSlot = (slotId: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slotId)) next.delete(slotId)
      else next.add(slotId)
      return next
    })
  }

  const isFull = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId)
    return slot && slot.max_volunteers > 0 && slot.volunteers.length >= slot.max_volunteers
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis.'); return }
    if (selected.size === 0) { setError('Sélectionne au moins une plage.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`/api/events/${event.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, phone, slot_ids: Array.from(selected) }),
      })
      const d = await res.json() as { token?: string; error?: string }
      if (d.error) { setError(d.error); return }
      setToken(d.token!)
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  if (token) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-400 mb-2">Inscription confirmée!</h2>
          <p className="text-zinc-400 mb-4">Merci <strong className="text-white">{name}</strong>! Tu es inscrit(e) pour {selected.size} plage{selected.size > 1 ? 's' : ''}.</p>
          <div className="bg-zinc-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-zinc-400 mb-1">Ton code personnel (pour modifier ton horaire):</p>
            <p className="text-3xl font-mono font-black text-ctq-blue tracking-widest">{token}</p>
            <p className="text-xs text-zinc-500 mt-2">Note bien ce code — il ne sera pas envoyé par email.</p>
          </div>
          <button onClick={onDone} className="btn-tesla">Voir l'horaire</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">✋ S'inscrire comme bénévole</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-3">
          <h3 className="font-semibold text-zinc-300">Tes informations</h3>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nom complet *</label>
            <input className="input" placeholder="Ex: Marie Tremblay" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Téléphone (optionnel)</label>
              <input className="input" type="tel" placeholder="418 555-1234" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email (optionnel)</label>
              <input className="input" type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-zinc-300 mb-3">Tes disponibilités</h3>
          <p className="text-sm text-zinc-500 mb-4">Coche les plages où tu peux être présent(e).</p>
          <div className="space-y-3">
            {days.map(day => {
              const daySlots = slotsByDay(day.id)
              return (
                <div key={day.id}>
                  <div className="text-sm font-semibold text-ctq-blue mb-1">{day.label}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {daySlots.map(slot => {
                      const full = !!isFull(slot.id) && !selected.has(slot.id)
                      return (
                        <button key={slot.id} type="button" disabled={full}
                          onClick={() => !full && toggleSlot(slot.id)}
                          className={`p-2 rounded-lg border text-center text-xs transition-all ${
                            full ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : selected.has(slot.id) ? 'bg-ctq-blue border-ctq-blue-dark text-white font-bold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-ctq-blue'
                          }`}>
                          <div>{full ? '🔵 Complet' : slot.label}</div>
                          <div className="text-[10px] opacity-70">{slot.start_time} – {slot.end_time}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {selected.size > 0 && <p className="mt-3 text-sm text-green-400 font-medium">✓ {selected.size} plage{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}</p>}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-tesla w-full text-base py-3 disabled:opacity-50">
          {loading ? 'Inscription en cours...' : '✋ Confirmer mon inscription'}
        </button>
      </form>
    </div>
  )
}
