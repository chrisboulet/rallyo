interface Env { DB: D1Database }

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let token = ''
  for (let i = 0; i < 8; i++) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

// POST /api/events/:slug/register
export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const db = env.DB

  const event = await db.prepare(`SELECT id, status FROM events WHERE slug = ?`).bind(slug).first() as { id: number; status: string } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (event.status === 'closed') return Response.json({ error: 'Les inscriptions sont fermées.' }, { status: 403 })

  const body = await request.json() as { name: string; email?: string; phone?: string; slot_ids: number[] }
  if (!body.name?.trim()) return Response.json({ error: 'Le nom est requis.' }, { status: 400 })
  if (!body.slot_ids?.length) return Response.json({ error: 'Sélectionne au moins une plage.' }, { status: 400 })

  // Check max not exceeded for each slot
  for (const slotId of body.slot_ids) {
    const slot = await db.prepare(
      `SELECT s.max_volunteers, (SELECT COUNT(*) FROM registrations WHERE slot_id = s.id) as current_count
       FROM slots s JOIN days d ON d.id = s.day_id WHERE s.id = ? AND d.event_id = ?`
    ).bind(slotId, event.id).first() as { max_volunteers: number; current_count: number } | null
    if (slot && slot.max_volunteers > 0 && slot.current_count >= slot.max_volunteers) {
      return Response.json({ error: `Une plage est déjà complète. Rafraîchis la page.` }, { status: 409 })
    }
  }

  const token = generateToken()
  const result = await db.prepare(
    `INSERT INTO volunteers (event_id, name, email, phone, token) VALUES (?, ?, ?, ?, ?)`
  ).bind(event.id, body.name.trim(), body.email || null, body.phone || null, token).run()

  const volunteerId = result.meta.last_row_id
  const stmts = body.slot_ids.map(slotId =>
    db.prepare(`INSERT OR IGNORE INTO registrations (volunteer_id, slot_id) VALUES (?, ?)`).bind(volunteerId, slotId)
  )
  await db.batch(stmts)

  return Response.json({ token, name: body.name.trim() })
}
