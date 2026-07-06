import type { Application } from '../data/types'
import { PIPELINE_ORDER } from '../data/statuses'
import type { Store } from '../lib/store'
import { daysSince, isStale, lastActivityDays } from '../lib/analytics'
import { Pill } from './ui'

// One application on the board. Draggable between columns, and the whole card is
// clickable to edit. Quick ◀ / ▶ arrows move it along the pipeline without
// dragging. Surfaces the resume used (as a link when the resume has a file URL),
// location, days since applied, a notes preview, and follow-up / stale warnings.
export default function AppCard({
  app,
  store,
  onEdit,
}: {
  app: Application
  store: Store
  onEdit: (a: Application) => void
}) {
  const d = daysSince(app.dateApplied)
  const today = new Date().toISOString().slice(0, 10)
  const active = !['rejected', 'ghosted', 'accepted'].includes(app.status)
  const overdue = !!app.followUpDate && app.followUpDate <= today && active
  const stale = isStale(app) && !overdue
  const staleDays = stale ? lastActivityDays(app) : null

  const resume = app.resumeId ? store.resumes.find((r) => r.id === app.resumeId) : undefined
  const notePreview = app.notes?.trim().split('\n')[0] || ''

  const idx = PIPELINE_ORDER.indexOf(app.status)
  const canBack = idx > 0
  const canFwd = idx >= 0 && idx < PIPELINE_ORDER.length - 1
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const move = (e: React.MouseEvent, to: number) => {
    e.stopPropagation()
    store.moveStatus(app.id, PIPELINE_ORDER[to])
  }

  const border = overdue
    ? 'border-accent-amber/50'
    : stale
      ? 'border-accent-blue/40 shadow-[0_0_18px_-6px_rgba(96,165,250,0.55)]'
      : 'border-white/10'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', app.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => onEdit(app)}
      className={`group cursor-pointer rounded-xl border bg-white/[0.03] p-3.5 transition hover:border-white/25 hover:bg-white/[0.055] ${border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display text-[19px] font-bold leading-tight text-ink">{app.company}</div>
          {app.role && <div className="mt-0.5 truncate font-sans text-[16.5px] text-muted">{app.role}</div>}
        </div>
        <span className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[16.5px] text-faint opacity-60 transition group-hover:opacity-100" title="Edit">
          ✎
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {resume &&
          (resume.url ? (
            <a href={resume.url} target="_blank" rel="noreferrer" onClick={stop} title="Open resume file">
              <Pill color="#a78bfa">{resume.name} ↗</Pill>
            </a>
          ) : (
            <Pill color="#a78bfa">{resume.name}</Pill>
          ))}
        {app.locationType && <Pill color="#5eead4">{app.locationType}</Pill>}
        {d !== null && app.status !== 'wishlist' && (
          <span className="font-mono text-[16.5px] text-faint">{d === 0 ? 'today' : `${d}d ago`}</span>
        )}
      </div>

      {notePreview && (
        <div className="mt-2 truncate font-sans text-[16.5px] italic text-faint" title={app.notes}>
          “{notePreview}”
        </div>
      )}

      {overdue && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 font-mono text-[16px] text-accent-amber">
          ⚠ follow up{app.nextAction ? `: ${app.nextAction}` : ''}
        </div>
      )}
      {stale && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-accent-blue/30 bg-accent-blue/10 px-2.5 py-1 font-mono text-[16px] text-accent-blue">
          ○ stale · quiet {staleDays}d
        </div>
      )}

      {/* quick-move arrows — only for pipeline stages */}
      {idx >= 0 && (canBack || canFwd) && (
        <div className="mt-2.5 flex items-center justify-end gap-1.5 opacity-60 transition group-hover:opacity-100">
          <button
            onClick={(e) => move(e, idx - 1)}
            disabled={!canBack}
            title="Move back a stage"
            className="rounded-md border border-white/12 px-2.5 py-0.5 font-mono text-[16.5px] text-muted transition hover:text-ink disabled:opacity-30"
          >
            ◀
          </button>
          <button
            onClick={(e) => move(e, idx + 1)}
            disabled={!canFwd}
            title="Move forward a stage"
            className="rounded-md border border-white/12 px-2.5 py-0.5 font-mono text-[16.5px] text-muted transition hover:text-ink disabled:opacity-30"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  )
}
