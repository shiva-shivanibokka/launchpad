import type { Application, Resume } from '../data/types'
import { STATUS_MAP, STATUS_RANK } from '../data/statuses'

// Derived numbers for the stat tiles, the follow-up strip and the per-resume
// funnel. Kept as pure functions so the components stay presentational.

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return null
  return Math.floor((Date.now() - then) / 86_400_000)
}

// Days since the last status change — used to flag applications that have gone
// stale (sitting untouched in an active stage).
export function lastActivityDays(app: Application): number | null {
  const last = app.history[app.history.length - 1]
  return daysSince(last?.at)
}

const STALE_AFTER = 10
export function isStale(app: Application): boolean {
  if (['rejected', 'ghosted', 'accepted', 'wishlist'].includes(app.status)) return false
  const d = lastActivityDays(app)
  return d !== null && d >= STALE_AFTER
}

// Monday-anchored start of the week containing d.
function weekStart(d: Date): Date {
  const x = new Date(d)
  const dow = (x.getDay() + 6) % 7 // 0 = Monday
  x.setDate(x.getDate() - dow)
  x.setHours(0, 0, 0, 0)
  return x
}

export interface WeekBucket {
  label: string
  count: number
}

// How many applications were sent per week over the last `weeks` weeks — feeds
// the momentum strip so you can see your pace.
export function weeklyApplied(apps: Application[], weeks = 12): WeekBucket[] {
  const cur = weekStart(new Date())
  const buckets: { t: number; label: string; count: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const s = new Date(cur)
    s.setDate(s.getDate() - i * 7)
    buckets.push({ t: s.getTime(), label: `${s.getMonth() + 1}/${s.getDate()}`, count: 0 })
  }
  const byT = new Map(buckets.map((b) => [b.t, b]))
  for (const a of apps) {
    if (!a.dateApplied || a.status === 'wishlist') continue
    const d = new Date(`${a.dateApplied}T00:00:00`)
    if (Number.isNaN(d.getTime())) continue
    const b = byT.get(weekStart(d).getTime())
    if (b) b.count++
  }
  return buckets.map(({ label, count }) => ({ label, count }))
}

export interface Totals {
  total: number
  active: number // still in play (not rejected/ghosted/accepted)
  responded: number // reached screen or beyond at some point
  interviewing: number
  offers: number
  accepted: number
  closed: number // rejected + ghosted
  responseRate: number // responded / (applications that were actually sent)
}

// "Sent" = anything past wishlist. Response rate is measured against those.
export function computeTotals(apps: Application[]): Totals {
  let sent = 0
  let responded = 0
  let interviewing = 0
  let offers = 0
  let accepted = 0
  let closed = 0
  let active = 0
  for (const a of apps) {
    const everResponded = a.history.some((h) => STATUS_MAP[h.status]?.responded)
    if (a.status !== 'wishlist') sent++
    if (everResponded) responded++
    if (a.status === 'interviewing') interviewing++
    if (a.status === 'offer') offers++
    if (a.status === 'accepted') accepted++
    if (a.status === 'rejected' || a.status === 'ghosted') closed++
    if (!['rejected', 'ghosted', 'accepted'].includes(a.status)) active++
  }
  return {
    total: apps.length,
    active,
    responded,
    interviewing,
    offers,
    accepted,
    closed,
    responseRate: sent ? Math.round((responded / sent) * 100) : 0,
  }
}

// Applications whose follow-up date is today or past, or that have sat in a
// non-terminal stage a long time with no next action — the "nudge me" set.
export function needsFollowUp(apps: Application[]): Application[] {
  const today = new Date().toISOString().slice(0, 10)
  return apps
    .filter((a) => {
      if (['rejected', 'ghosted', 'accepted'].includes(a.status)) return false
      if (a.followUpDate && a.followUpDate <= today) return true
      // No follow-up set but applied and quiet for 14+ days.
      const d = daysSince(a.dateApplied)
      if (a.status === 'applied' && d !== null && d >= 14) return true
      return false
    })
    .sort((x, y) => (x.followUpDate || '9999').localeCompare(y.followUpDate || '9999'))
}

export interface ResumeStat {
  resume: Resume
  applied: number
  responded: number
  interviewed: number
  offers: number
  responseRate: number
}

// Per-resume funnel: how far did applications using each resume actually get.
export function resumeStats(apps: Application[], resumes: Resume[]): ResumeStat[] {
  const rows = resumes.map((resume) => {
    const used = apps.filter((a) => a.resumeId === resume.id && a.status !== 'wishlist')
    const responded = used.filter((a) => a.history.some((h) => STATUS_MAP[h.status]?.responded)).length
    const interviewed = used.filter((a) => STATUS_RANK[a.status] >= 3 || a.history.some((h) => STATUS_RANK[h.status] >= 3)).length
    const offers = used.filter((a) => STATUS_RANK[a.status] >= 4 || a.history.some((h) => STATUS_RANK[h.status] >= 4)).length
    return {
      resume,
      applied: used.length,
      responded,
      interviewed,
      offers,
      responseRate: used.length ? Math.round((responded / used.length) * 100) : 0,
    }
  })
  // Best-performing first (by response rate, then volume).
  return rows.sort((a, b) => b.responseRate - a.responseRate || b.applied - a.applied)
}
