interface Env { DB: D1Database }

// GET /api/events/:slug/volunteer/:token
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = params.slug as string
  const token = (params.token as string).toUpperCase()
  const db = env.DB

  const event = await db.prepare(`SELECT id FROM events WHERE slug = ?`).bind(slug).first() as { id: number } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  const volunteer = await db.prepare(
    `SELECT id, name, email, phone FROM volunteers WHERE event_id = ? AND token = ?`
  ).bind(event.id, token).first()
  if (!volunteer) return Response.json({ error: 'Code introuvable.' }, { status: 404 })

  const regs = await db.prepare(
    `SELECT r.slot_id FROM registrations r WHERE r.volunteer_id = ?`
  ).bind(volunteer.id).all()

  return Response.json({ volunteer, slot_ids: (regs.results as { slot_id: number }[]).map(r => r.slot_id) })
}

// PUT /api/events/:slug/volunteer/:token — update slots
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const token = (params.token as string).toUpperCase()
  const db = env.DB

  const event = await db.prepare(`SELECT id FROM events WHERE slug = ?`).bind(slug).first() as { id: number } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  const volunteer = await db.prepare(
    `SELECT id FROM volunteers WHERE event_id = ? AND token = ?`
  ).bind(event.id, token).first() as { id: number } | null
  if (!volunteer) return Response.json({ error: 'Code introuvable.' }, { status: 404 })

  const body = await request.json() as { slot_ids: number[] }
  await db.prepare(`DELETE FROM registrations WHERE volunteer_id = ?`).bind(volunteer.id).run()

  if (body.slot_ids?.length) {
    const stmts = body.slot_ids.map(slotId =>
      db.prepare(`INSERT INTO registrations (volunteer_id, slot_id) VALUES (?, ?)`).bind(volunteer.id, slotId)
    )
    await db.batch(stmts)
  }

  return Response.json({ ok: true })
}
