interface Env { DB: D1Database }

function checkAuth(request: Request, password: string): boolean {
  return request.headers.get('X-Admin-Key') === password
}

// GET /api/events/:slug/admin — all volunteers with their slot_ids
export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string
  const db = env.DB

  const event = await db.prepare(`SELECT id, admin_password FROM events WHERE slug = ?`).bind(slug).first() as { id: number; admin_password: string } | null
  if (!event) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (!checkAuth(request, event.admin_password)) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const volunteers = await db.prepare(
    `SELECT id, name, email, phone, token, created_at FROM volunteers WHERE event_id = ? ORDER BY name`
  ).bind(event.id).all()

  const regs = await db.prepare(
    `SELECT r.volunteer_id, r.slot_id FROM registrations r
     JOIN volunteers v ON v.id = r.volunteer_id WHERE v.event_id = ?`
  ).bind(event.id).all()

  const regsByVol: Record<number, number[]> = {}
  for (const r of regs.results as { volunteer_id: number; slot_id: number }[]) {
    if (!regsByVol[r.volunteer_id]) regsByVol[r.volunteer_id] = []
    regsByVol[r.volunteer_id].push(r.slot_id)
  }

  return Response.json({
    volunteers: (volunteers.results as { id: number; name: string; email: string; phone: string; token: string; created_at: string }[]).map(v => ({
      ...v,
      slot_ids: regsByVol[v.id] ?? [],
    })),
  })
}
