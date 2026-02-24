import { useState } from 'react'

interface SlotDef { label: string; start_time: string; end_time: string; min_volunteers: number; max_volunteers: number }
interface DayDef { date: string; label: string; slots: SlotDef[] }

const DEFAULT_SLOTS: SlotDef[] = [
  { label: 'Matin', start_time: '9h', end_time: '13h', min_volunteers: 3, max_volunteers: 4 },
  { label: 'Après-midi', start_time: '13h', end_time: '17h', min_volunteers: 3, max_volunteers: 4 },
  { label: 'Soir', start_time: '17h', end_time: '21h', min_volunteers: 3, max_volunteers: 4 },
]

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
}

function generateDays(startDate: string, endDate: string): DayDef[] {
  const days: DayDef[] = []
  const start = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')
  const cur = new Date(start)
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10)
    days.push({ date: iso, label: formatDateLabel(iso), slots: DEFAULT_SLOTS.map(s => ({ ...s })) })
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export default function CreateEvent() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [days, setDays] = useState<DayDef[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdSlug, setCreatedSlug] = useState('')

  const updateName = (v: string) => {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const goStep2 = () => {
    if (!name.trim()) { setError('Le nom est requis.'); return }
    if (!startDate || !endDate) { setError('Les dates sont requises.'); return }
    if (endDate < startDate) { setError('La date de fin doit être après le début.'); return }
    if (!adminPassword) { setError('Le mot de passe admin est requis.'); return }
    // Count days
    const diff = (new Date(endDate + 'T12:00:00').getTime() - new Date(startDate + 'T12:00:00').getTime()) / 86400000 + 1
    if (diff > 30) { setError('Maximum 30 jours.'); return }
    setError('')
    setDays(generateDays(startDate, endDate))
    setStep(2)
  }

  const updateSlot = (dayIdx: number, slotIdx: number, field: keyof SlotDef, value: string | number) => {
    setDays(prev => {
      const next = [...prev]
      next[dayIdx] = { ...next[dayIdx], slots: [...next[dayIdx].slots] }
      next[dayIdx].slots[slotIdx] = { ...next[dayIdx].slots[slotIdx], [field]: value }
      return next
    })
  }

  const addSlot = (dayIdx: number) => {
    setDays(prev => {
      const next = [...prev]
      next[dayIdx] = { ...next[dayIdx], slots: [...next[dayIdx].slots, { label: 'Nouveau', start_time: '9h', end_time: '12h', min_volunteers: 2, max_volunteers: 4 }] }
      return next
    })
  }

  const removeSlot = (dayIdx: number, slotIdx: number) => {
    setDays(prev => {
      const next = [...prev]
      next[dayIdx] = { ...next[dayIdx], slots: next[dayIdx].slots.filter((_, i) => i !== slotIdx) }
      return next
    })
  }

  const copyFirstDayToAll = () => {
    if (days.length < 2) return
    const firstSlots = days[0].slots
    setDays(prev => prev.map((d, i) => i === 0 ? d : { ...d, slots: firstSlots.map(s => ({ ...s })) }))
  }

  const submit = async () => {
    // Validate at least 1 slot per day
    for (const d of days) {
      if (d.slots.length === 0) { setError(`${d.label} n'a aucune plage.`); return }
    }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': 'rallyo-master-2026' },
        body: JSON.stringify({
          name: name.trim(), slug: slug || slugify(name), description, org_name: orgName,
          admin_password: adminPassword, days,
        }),
      })
      const data = await res.json() as { ok?: boolean; slug?: string; error?: string }
      if (data.error) { setError(data.error); return }
      setCreatedSlug(data.slug!)
      setStep(3)
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  // Step 3: Success
  if (step === 3 && createdSlug) {
    const url = `${window.location.origin}/${createdSlug}`
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-zinc-800 py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="font-black text-xl tracking-tight">Rallyo</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="card max-w-lg w-full text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black mb-2 text-green-400">Événement créé!</h2>
            <p className="text-zinc-400 mb-6"><strong className="text-white">{name}</strong> est prêt à recevoir des bénévoles.</p>
            <div className="bg-zinc-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-zinc-400 mb-1">Lien public (à partager):</p>
              <a href={`/${createdSlug}`} className="text-lg font-mono text-ctq-blue break-all hover:underline">{url}</a>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-zinc-400 mb-1">Mot de passe admin:</p>
              <p className="text-lg font-mono text-ctq-blue">{adminPassword}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <a href={`/${createdSlug}`} className="btn-tesla">📅 Voir l'événement</a>
              <a href="/" className="btn-ghost">← Accueil</a>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 hover:opacity-80">
              <span className="text-2xl">📅</span>
              <span className="font-black text-xl tracking-tight">Rallyo</span>
            </a>
          </div>
          <div className="text-sm text-zinc-500">Étape {step}/2</div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-black">🚀 Créer un événement</h1>

            <div className="card space-y-4">
              <h3 className="font-semibold text-zinc-300">Informations générales</h3>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nom de l'événement *</label>
                <input className="input" placeholder="Ex: Festival du Lac 2026" value={name} onChange={e => updateName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">URL personnalisée</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">rallyo.pages.dev/</span>
                  <input className="input flex-1" placeholder="festival-du-lac-2026" value={slug}
                    onChange={e => { setSlug(slugify(e.target.value)); setSlugManual(true) }} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Organisation (optionnel)</label>
                <input className="input" placeholder="Ex: Association du Lac" value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description (optionnel)</label>
                <textarea className="input min-h-[80px]" placeholder="Décrivez votre événement..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-semibold text-zinc-300">Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Date de début *</label>
                  <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Date de fin *</label>
                  <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-semibold text-zinc-300">Sécurité admin</h3>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Mot de passe admin *</label>
                <input className="input" type="text" placeholder="Ex: monmotdepasse2026" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                <p className="text-xs text-zinc-600 mt-1">Pour accéder à la gestion des bénévoles. Partagez-le uniquement avec les organisateurs.</p>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={goStep2} className="btn-tesla w-full text-base py-3">Suivant → Configurer les plages horaires</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black">📋 Plages horaires</h1>
              <button onClick={() => setStep(1)} className="btn-ghost text-sm">← Retour</button>
            </div>

            <div className="card">
              <p className="text-sm text-zinc-400 mb-3">Configurez les plages pour chaque jour. Par défaut: 3 plages (Matin, Après-midi, Soir).</p>
              {days.length > 1 && (
                <button onClick={copyFirstDayToAll} className="btn-ghost text-sm mb-3">📋 Copier les plages du premier jour sur tous les jours</button>
              )}
            </div>

            {days.map((day, di) => (
              <div key={day.date} className="card">
                <h3 className="font-bold text-ctq-blue mb-3">{day.label}</h3>
                <div className="space-y-2">
                  {day.slots.map((slot, si) => (
                    <div key={si} className="flex flex-wrap items-center gap-2 bg-zinc-800 rounded-lg p-2">
                      <input className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm w-28 text-zinc-200 focus:outline-none focus:border-ctq-blue"
                        value={slot.label} onChange={e => updateSlot(di, si, 'label', e.target.value)} placeholder="Nom" />
                      <input className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm w-16 text-zinc-200 focus:outline-none focus:border-ctq-blue"
                        value={slot.start_time} onChange={e => updateSlot(di, si, 'start_time', e.target.value)} placeholder="Début" />
                      <span className="text-zinc-500 text-sm">→</span>
                      <input className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm w-16 text-zinc-200 focus:outline-none focus:border-ctq-blue"
                        value={slot.end_time} onChange={e => updateSlot(di, si, 'end_time', e.target.value)} placeholder="Fin" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-500">Min</span>
                        <input type="number" min={0} max={20} className="bg-zinc-700 border border-zinc-600 rounded px-1 py-1 text-sm w-10 text-center text-zinc-200 focus:outline-none focus:border-ctq-blue"
                          value={slot.min_volunteers} onChange={e => updateSlot(di, si, 'min_volunteers', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-500">Max</span>
                        <input type="number" min={0} max={20} className="bg-zinc-700 border border-zinc-600 rounded px-1 py-1 text-sm w-10 text-center text-zinc-200 focus:outline-none focus:border-ctq-blue"
                          value={slot.max_volunteers} onChange={e => updateSlot(di, si, 'max_volunteers', parseInt(e.target.value) || 0)} />
                      </div>
                      <button onClick={() => removeSlot(di, si)} className="text-red-400 hover:text-red-300 text-sm ml-auto">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addSlot(di)} className="text-sm text-ctq-blue hover:underline">+ Ajouter une plage</button>
                </div>
              </div>
            ))}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={submit} disabled={loading} className="btn-tesla w-full text-base py-3 disabled:opacity-50">
              {loading ? 'Création en cours...' : '🎉 Créer l\'événement'}
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 py-3 text-center text-xs text-zinc-600">
        Rallyo — Gratuit et open source
      </footer>
    </div>
  )
}
