interface Env { DB: D1Database; MASTER_KEY: string }

// POST /api/events/create — create a new event with days and slots
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const masterKey = request.headers.get('X-Master-Key')
  if (masterKey !== env.MASTER_KEY) return Response.json({ error: 'Non autorisé.' }, { status: 401 })

  const db = env.DB
  const body = await request.json() as {
    name: string
    slug: string
    description?: string
    org_name?: string
    logo_url?: string
    accent_color?: string
    admin_password: string
    days: {
      date: string
      label: string
      slots: { label: string; start_time: string; end_time: string; min_volunteers?: number; max_volunteers?: number }[]
    }[]
  }

  // Create event
  const result = await db.prepare(
    `INSERT INTO events (name, slug, description, org_name, logo_url, accent_color, start_date, end_date, admin_password, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`
  ).bind(
    body.name, body.slug, body.description ?? '', body.org_name ?? '', body.logo_url ?? '',
    body.accent_color ?? '#2B6CA3',
    body.days[0]?.date ?? '', body.days[body.days.length - 1]?.date ?? '',
    body.admin_password
  ).run()

  const eventId = result.meta.last_row_id

  // Create days and slots
  for (let di = 0; di < body.days.length; di++) {
    const day = body.days[di]
    const dayResult = await db.prepare(
      `INSERT INTO days (event_id, date, label, sort_order) VALUES (?, ?, ?, ?)`
    ).bind(eventId, day.date, day.label, di).run()
    const dayId = dayResult.meta.last_row_id

    for (let si = 0; si < day.slots.length; si++) {
      const slot = day.slots[si]
      await db.prepare(
        `INSERT INTO slots (day_id, label, start_time, end_time, min_volunteers, max_volunteers, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(dayId, slot.label, slot.start_time, slot.end_time, slot.min_volunteers ?? 3, slot.max_volunteers ?? 4, si).run()
    }
  }

  return Response.json({ ok: true, event_id: eventId, slug: body.slug })
}
