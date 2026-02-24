interface Env { DB: D1Database }

// GET /api/events — list public (open) events
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare(
    `SELECT e.name, e.slug, e.org_name, e.start_date, e.end_date,
       (SELECT COUNT(*) FROM volunteers v WHERE v.event_id = e.id) as volunteer_count,
       (SELECT COUNT(*) FROM slots s JOIN days d ON d.id = s.day_id WHERE d.event_id = e.id) as slot_count
     FROM events e WHERE e.status = 'open' ORDER BY e.start_date DESC LIMIT 20`
  ).all()

  return Response.json({ events: rows.results })
}
