import { useState } from 'react'
import type { Application, StatusId } from '../data/types'
import { PIPELINE_STATUSES, TERMINAL_STATUSES } from '../data/statuses'
import type { Store } from '../lib/store'
import AppCard from './AppCard'
import { Dot } from './ui'

// The kanban board. Pipeline columns first (the forward flow), then the two
// terminal columns. Drag a card onto a column to move its status; cards are
// pre-filtered and pre-sorted by the parent. Columns can be collapsed to a thin
// strip — Rejected and Ghosted start collapsed so the active pipeline dominates.
export default function Board({
  store,
  apps,
  onEdit,
}: {
  store: Store
  apps: Application[]
  onEdit: (a: Application) => void
}) {
  const [over, setOver] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(['rejected', 'ghosted']))
  const columns = [...PIPELINE_STATUSES, ...TERMINAL_STATUSES]

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const dropProps = (id: StatusId) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setOver(id)
    },
    onDragLeave: () => setOver((o) => (o === id ? null : o)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      const dragId = e.dataTransfer.getData('text/plain')
      if (dragId) store.moveStatus(dragId, id)
      setOver(null)
    },
  })

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => {
        const items = apps.filter((a) => a.status === col.id)
        const isCollapsed = collapsed.has(col.id)

        if (isCollapsed) {
          return (
            <button
              key={col.id}
              {...dropProps(col.id)}
              onClick={() => toggle(col.id)}
              title={`Expand ${col.label}`}
              className={`flex w-[56px] shrink-0 flex-col items-center gap-3 rounded-2xl border bg-card/40 py-3 backdrop-blur-md transition ${
                over === col.id ? 'border-accent-violet/60 bg-accent-violet/5' : 'border-white/10 hover:border-white/25'
              }`}
            >
              <Dot color={col.color} />
              <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[13px]" style={{ color: col.color }}>
                {items.length}
              </span>
              <span
                className="mt-1 font-mono text-[14px] font-bold uppercase tracking-wide [writing-mode:vertical-rl]"
                style={{ color: col.color }}
              >
                {col.label}
              </span>
            </button>
          )
        }

        return (
          <div
            key={col.id}
            {...dropProps(col.id)}
            className={`flex w-[300px] shrink-0 flex-col rounded-2xl border bg-card/40 p-3 backdrop-blur-md transition ${
              over === col.id ? 'border-accent-violet/60 bg-accent-violet/5' : 'border-white/10'
            }`}
          >
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 font-mono text-[14.5px] font-bold uppercase tracking-wide" style={{ color: col.color }}>
                <Dot color={col.color} />
                {col.label}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[13px] text-faint">{items.length}</span>
                <button
                  onClick={() => toggle(col.id)}
                  title={`Collapse ${col.label}`}
                  className="rounded-md border border-white/10 px-2 font-mono text-[14px] text-faint hover:text-ink"
                >
                  –
                </button>
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {items.map((a) => (
                <AppCard key={a.id} app={a} store={store} onEdit={onEdit} />
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 px-2 py-5 text-center font-mono text-[13px] text-faint">
                  drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
