interface Env { DB: D1Database; MASTER_KEY: string }

// PUT /api/admin/events/:id — superadmin: update event
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  if (request.headers.get('X-Master-Key') !== env.MASTER_KEY) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const id = parseInt(params.id as string)
  const body = await request.json() as { status?: string; admin_password?: string; name?: string }

  const updates: string[] = []
  const values: (string | number)[] = []

  if (body.status) { updates.push('status = ?'); values.push(body.status) }
  if (body.admin_password) { updates.push('admin_password = ?'); values.push(body.admin_password) }
  if (body.name) { updates.push('name = ?'); values.push(body.name) }

  if (updates.length === 0) return Response.json({ error: 'Rien à modifier.' }, { status: 400 })

  values.push(id)
  await env.DB.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()

  return Response.json({ ok: true })
}

// DELETE /api/admin/events/:id — superadmin: delete event + all data
export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  if (request.headers.get('X-Master-Key') !== env.MASTER_KEY) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const id = parseInt(params.id as string)
  const db = env.DB

  // CASCADE should handle children, but be explicit
  await db.batch([
    db.prepare(`DELETE FROM registrations WHERE volunteer_id IN (SELECT id FROM volunteers WHERE event_id = ?)`).bind(id),
    db.prepare(`DELETE FROM volunteers WHERE event_id = ?`).bind(id),
    db.prepare(`DELETE FROM slots WHERE day_id IN (SELECT id FROM days WHERE event_id = ?)`).bind(id),
    db.prepare(`DELETE FROM days WHERE event_id = ?`).bind(id),
    db.prepare(`DELETE FROM events WHERE id = ?`).bind(id),
  ])

  return Response.json({ ok: true })
}
