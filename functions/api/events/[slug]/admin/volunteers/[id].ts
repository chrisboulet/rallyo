interface Env { DB: D1Database }

// DELETE /api/events/:slug/admin/volunteers/:id
export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const volunteerId = parseInt(params.id as string)
  const db = env.DB

  const event = await db.prepare(`SELECT id, admin_password FROM events WHERE slug = ?`).bind(slug).first() as { id: number; admin_password: string } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (request.headers.get('X-Admin-Key') !== event.admin_password) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  // Verify volunteer belongs to this event
  const vol = await db.prepare(`SELECT id FROM volunteers WHERE id = ? AND event_id = ?`).bind(volunteerId, event.id).first()
  if (!vol) return Response.json({ error: 'Bénévole introuvable.' }, { status: 404 })

  // Delete registrations then volunteer (CASCADE should handle it, but be explicit)
  await db.prepare(`DELETE FROM registrations WHERE volunteer_id = ?`).bind(volunteerId).run()
  await db.prepare(`DELETE FROM volunteers WHERE id = ?`).bind(volunteerId).run()

  return Response.json({ ok: true })
}
