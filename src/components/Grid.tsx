import { EventData, Slot } from '../types'

interface Props { data: EventData; onRefresh: () => void }

export default function Grid({ data, onRefresh }: Props) {
  const { days, slots } = data

  const slotsByDay = (dayId: number) => slots.filter(s => s.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order)

  const statusColor = (s: Slot) => {
    const c = s.volunteers.length
    if (s.max_volunteers > 0 && c >= s.max_volunteers) return 'bg-blue-900/40 border-blue-800'
    if (c === 0) return 'bg-red-900/40 border-red-800'
    if (c < s.min_volunteers) return 'bg-yellow-900/40 border-yellow-800'
    return 'bg-green-900/40 border-green-800'
  }

  const statusDot = (s: Slot) => {
    const c = s.volunteers.length
    if (s.max_volunteers > 0 && c >= s.max_volunteers) return '🔵'
    if (c === 0) return '🔴'
    if (c < s.min_volunteers) return '🟡'
    return '🟢'
  }

  // Get unique slot labels across all days
  const allSlotLabels = [...new Set(slots.map(s => s.label))]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Horaire des bénévoles</h2>
        <button onClick={onRefresh} className="btn-ghost text-sm">🔄 Rafraîchir</button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-sm text-zinc-400">
        <span>🟢 Min atteint</span>
        <span>🟡 Sous le min</span>
        <span>🔴 Aucun</span>
        <span>🔵 Complet</span>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-zinc-500 font-medium w-32">Plage</th>
              {days.map(d => (
                <th key={d.id} className="text-center py-2 px-2 text-zinc-300 font-semibold">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSlotLabels.map(label => (
              <tr key={label}>
                <td className="py-2 pr-3 font-medium text-zinc-300 align-top">{label}</td>
                {days.map(day => {
                  const slot = slotsByDay(day.id).find(s => s.label === label)
                  if (!slot) return <td key={day.id} className="py-1 px-1"><div className="border rounded-lg p-2 min-h-[60px] bg-zinc-900/50 border-zinc-800 flex items-center justify-center text-zinc-700 text-xs">—</div></td>
                  return (
                    <td key={day.id} className="py-1 px-1">
                      <div className={`border rounded-lg p-2 min-h-[60px] ${statusColor(slot)}`}>
                        <div className="text-xs font-bold mb-1">
                          {statusDot(slot)} {slot.volunteers.length}/{slot.max_volunteers}
                        </div>
                        <div className="text-[10px] text-zinc-500 mb-1">{slot.start_time} – {slot.end_time}</div>
                        {slot.volunteers.map(name => (
                          <div key={name} className="text-xs text-zinc-300 truncate">{name}</div>
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {days.map(day => (
          <div key={day.id} className="card">
            <h3 className="font-bold text-ctq-blue mb-3">{day.label}</h3>
            <div className="space-y-2">
              {slotsByDay(day.id).map(slot => (
                <div key={slot.id} className={`border rounded-lg p-2 ${statusColor(slot)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-sm">{slot.label}</span>
                      <span className="text-xs text-zinc-500 ml-2">{slot.start_time} – {slot.end_time}</span>
                    </div>
                    <span className="text-xs font-bold">{statusDot(slot)} {slot.volunteers.length}/{slot.max_volunteers}</span>
                  </div>
                  {slot.volunteers.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {slot.volunteers.map(name => (
                        <span key={name} className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">{name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
