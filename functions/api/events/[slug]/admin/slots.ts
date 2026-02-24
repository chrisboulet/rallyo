interface Env { DB: D1Database }

function checkAuth(request: Request, password: string): boolean {
  return request.headers.get('X-Admin-Key') === password
}

// PUT /api/events/:slug/admin/slots — update slot min/max
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const db = env.DB

  const event = await db.prepare(`SELECT id, admin_password FROM events WHERE slug = ?`).bind(slug).first() as { id: number; admin_password: string } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (!checkAuth(request, event.admin_password)) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json() as { slot_id: number; min_volunteers?: number; max_volunteers?: number }

  // Verify slot belongs to this event
  const slot = await db.prepare(
    `SELECT s.id FROM slots s JOIN days d ON d.id = s.day_id WHERE s.id = ? AND d.event_id = ?`
  ).bind(body.slot_id, event.id).first()
  if (!slot) return Response.json({ error: 'Plage introuvable.' }, { status: 404 })

  if (body.min_volunteers !== undefined) {
    await db.prepare(`UPDATE slots SET min_volunteers = ? WHERE id = ?`).bind(body.min_volunteers, body.slot_id).run()
  }
  if (body.max_volunteers !== undefined) {
    await db.prepare(`UPDATE slots SET max_volunteers = ? WHERE id = ?`).bind(body.max_volunteers, body.slot_id).run()
  }

  return Response.json({ ok: true })
}
