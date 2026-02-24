interface Env { DB: D1Database; MASTER_KEY: string }

// GET /api/admin/events — superadmin: list ALL events with stats
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get('X-Master-Key') !== env.MASTER_KEY) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const rows = await env.DB.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM volunteers v WHERE v.event_id = e.id) as volunteer_count,
      (SELECT COUNT(*) FROM slots s JOIN days d ON d.id = s.day_id WHERE d.event_id = e.id) as slot_count,
      (SELECT COUNT(*) FROM registrations r JOIN volunteers v ON v.id = r.volunteer_id WHERE v.event_id = e.id) as registration_count
    FROM events e ORDER BY e.created_at DESC
  `).all()

  return Response.json({ events: rows.results })
}
