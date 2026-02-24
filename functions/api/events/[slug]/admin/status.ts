interface Env { DB: D1Database }

// PUT /api/events/:slug/admin/status — toggle open/closed
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const db = env.DB

  const event = await db.prepare(`SELECT id, admin_password, status FROM events WHERE slug = ?`).bind(slug).first() as { id: number; admin_password: string; status: string } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (request.headers.get('X-Admin-Key') !== event.admin_password) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json() as { status: string }
  if (!['open', 'closed', 'draft'].includes(body.status)) return Response.json({ error: 'Status invalide.' }, { status: 400 })

  await db.prepare(`UPDATE events SET status = ? WHERE id = ?`).bind(body.status, event.id).run()
  return Response.json({ ok: true, status: body.status })
}
