interface Env { DB: D1Database }

// GET /api/events/:slug — public event info + full grid
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = params.slug as string
  const db = env.DB

  const event = await db.prepare(
    `SELECT id, name, slug, description, org_name, logo_url, accent_color, start_date, end_date, status FROM events WHERE slug = ?`
  ).bind(slug).first()
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Fetch days + slots + registrations
  const days = await db.prepare(
    `SELECT d.id, d.date, d.label, d.sort_order FROM days d WHERE d.event_id = ? ORDER BY d.sort_order, d.date`
  ).bind(event.id).all()

  const slots = await db.prepare(
    `SELECT s.id, s.day_id, s.label, s.start_time, s.end_time, s.min_volunteers, s.max_volunteers, s.sort_order
     FROM slots s JOIN days d ON d.id = s.day_id WHERE d.event_id = ? ORDER BY s.sort_order`
  ).bind(event.id).all()

  const regs = await db.prepare(
    `SELECT r.slot_id, v.name FROM registrations r
     JOIN volunteers v ON v.id = r.volunteer_id
     JOIN slots s ON s.id = r.slot_id
     JOIN days d ON d.id = s.day_id
     WHERE d.event_id = ?
     ORDER BY v.name`
  ).bind(event.id).all()

  // Group registrations by slot_id
  const regsBySlot: Record<number, string[]> = {}
  for (const r of regs.results as { slot_id: number; name: string }[]) {
    if (!regsBySlot[r.slot_id]) regsBySlot[r.slot_id] = []
    regsBySlot[r.slot_id].push(r.name)
  }

  return Response.json({
    event,
    days: days.results,
    slots: (slots.results as { id: number; day_id: number; label: string; start_time: string; end_time: string; min_volunteers: number; max_volunteers: number; sort_order: number }[]).map(s => ({
      ...s,
      volunteers: regsBySlot[s.id] ?? [],
    })),
  })
}
