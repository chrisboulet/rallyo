interface Env { DB: D1Database }

function checkAuth(request: Request, password: string): boolean {
  return request.headers.get('X-Admin-Key') === password
}

async function getEvent(db: D1Database, slug: string) {
  return db.prepare(`SELECT id, admin_password FROM events WHERE slug = ?`).bind(slug).first() as Promise<{ id: number; admin_password: string } | null>
}

// POST /api/events/:slug/admin/registrations — add
export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const event = await getEvent(env.DB, params.slug as string)
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (!checkAuth(request, event.admin_password)) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json() as { volunteer_id: number; slot_id: number }
  await env.DB.prepare(`INSERT OR IGNORE INTO registrations (volunteer_id, slot_id) VALUES (?, ?)`).bind(body.volunteer_id, body.slot_id).run()
  return Response.json({ ok: true })
}

// DELETE /api/events/:slug/admin/registrations — remove
export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const event = await getEvent(env.DB, params.slug as string)
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (!checkAuth(request, event.admin_password)) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json() as { volunteer_id: number; slot_id: number }
  await env.DB.prepare(`DELETE FROM registrations WHERE volunteer_id = ? AND slot_id = ?`).bind(body.volunteer_id, body.slot_id).run()
  return Response.json({ ok: true })
}
