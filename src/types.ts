export interface Event {
  id: number
  name: string
  slug: string
  description: string
  org_name: string
  logo_url: string
  accent_color: string
  start_date: string
  end_date: string
  status: string
}

export interface Day {
  id: number
  date: string
  label: string
  sort_order: number
}

export interface Slot {
  id: number
  day_id: number
  label: string
  start_time: string
  end_time: string
  min_volunteers: number
  max_volunteers: number
  sort_order: number
  volunteers: string[] // populated by API
}

export interface Volunteer {
  id: number
  name: string
  email: string
  phone: string
  token: string
  created_at: string
  slot_ids: number[]
}

export interface EventData {
  event: Event
  days: Day[]
  slots: Slot[]
}
