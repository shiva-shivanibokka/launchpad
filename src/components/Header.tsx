import type { Store } from '../lib/store'
import SyncSettings from './SyncSettings'
import { Button } from './ui'

// Sticky header: big Unbounded wordmark, a one-line synced status, the jump-nav
// pills, the "Add application" button and the sync/settings actions.
export default function Header({ store, onAdd }: { store: Store; onAdd: () => void }) {
  const synced = store.lastSyncedAt
    ? new Date(store.lastSyncedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'not yet'

  return (
    <header className="sticky top-0 z-20">
      <div className="bg-gradient-to-b from-canvas/95 via-canvas/80 to-canvas/25 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 pt-4 pb-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent-violet/30 bg-accent-violet/10 text-[32px] shadow-glow">
            🎯
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-accent-violet via-accent-mint to-accent-emerald bg-clip-text font-display text-[32px] font-extrabold leading-none tracking-tight text-transparent sm:text-[38px]">
              LAUNCHPAD
            </h1>
            <p className="mt-1 font-mono text-[14px] text-muted">Job-application tracker · synced {synced}</p>
          </div>
          <div className="ml-auto hidden lg:block">
            <SyncSettings store={store} />
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 pb-3.5">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              ['board', 'Board'],
              ['followups', 'Follow-ups'],
              ['resumes', 'Resumes'],
              ['analytics', 'Resume analytics'],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="whitespace-nowrap rounded-full border border-white/10 bg-canvas/50 px-4 py-1.5 font-mono text-[13.5px] font-bold text-muted backdrop-blur-sm transition hover:border-accent-violet/40 hover:bg-accent-violet/20 hover:text-ink"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button variant="primary" onClick={onAdd}>
              ＋ Add application
            </Button>
            <div className="lg:hidden">
              <SyncSettings store={store} />
            </div>
          </div>
        </div>
      </div>
      <div className="h-6 bg-gradient-to-b from-canvas/25 to-transparent" />
    </header>
  )
}
