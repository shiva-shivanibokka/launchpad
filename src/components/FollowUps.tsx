import type { Application } from '../data/types'
import { STATUS_MAP } from '../data/statuses'
import { daysSince, needsFollowUp } from '../lib/analytics'
import type { Store } from '../lib/store'
import { Card, Pill, SectionTitle } from './ui'

// The "nudge me" surface: applications with a due follow-up date, or that have
// been sitting in Applied with no response for 2+ weeks.
export default function FollowUps({ store, onEdit }: { store: Store; onEdit: (a: Application) => void }) {
  const due = needsFollowUp(store.applications)
  if (due.length === 0) return null

  return (
    <Card className="border-accent-amber/25 p-5">
      <SectionTitle
        icon="⏰"
        title="Needs follow-up"
        right={<Pill color="#fbbf24">{due.length}</Pill>}
      />
      <div className="flex flex-col gap-2">
        {due.map((a) => {
          const d = daysSince(a.dateApplied)
          const s = STATUS_MAP[a.status]
          return (
            <button
              key={a.id}
              onClick={() => onEdit(a)}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-accent-amber/40"
            >
              <div className="min-w-0">
                <span className="font-display text-[15.5px] font-bold text-ink">{a.company}</span>
                {a.role && <span className="ml-2 font-sans text-[13.5px] text-muted">{a.role}</span>}
                <div className="mt-0.5 font-mono text-[13px] text-faint">
                  {a.nextAction || 'follow up'}
                  {a.followUpDate ? ` · due ${a.followUpDate}` : d !== null ? ` · quiet ${d}d` : ''}
                </div>
              </div>
              <Pill color={s.color}>{s.label}</Pill>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
