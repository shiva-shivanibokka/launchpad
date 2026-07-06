import { useMemo, useState } from 'react'
import FireflyBackground from './components/FireflyBackground'
import Header from './components/Header'
import StatTiles from './components/StatTiles'
import Momentum from './components/Momentum'
import Board from './components/Board'
import Filters, { EMPTY_FILTERS, type FilterState } from './components/Filters'
import FollowUps from './components/FollowUps'
import ManageResumes from './components/ManageResumes'
import ResumeAnalytics from './components/ResumeAnalytics'
import AppForm from './components/AppForm'
import FancySelect from './components/FancySelect'
import { Card, SectionTitle } from './components/ui'
import { computeTotals } from './lib/analytics'
import { useStore } from './lib/store'
import type { Application } from './data/types'

export default function App() {
  const store = useStore()
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'followup'>('recent')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)

  const totals = useMemo(() => computeTotals(store.applications), [store.applications])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const list = store.applications.filter((a) => {
      if (filters.resumeId && a.resumeId !== filters.resumeId) return false
      if (filters.locationType && a.locationType !== filters.locationType) return false
      if (q && !(`${a.company} ${a.role}`.toLowerCase().includes(q))) return false
      return true
    })
    const key = (a: Application) => a.dateApplied || a.createdAt.slice(0, 10)
    const sorted = [...list]
    if (sortBy === 'recent') sorted.sort((a, b) => key(b).localeCompare(key(a)))
    else if (sortBy === 'oldest') sorted.sort((a, b) => key(a).localeCompare(key(b)))
    else sorted.sort((a, b) => (a.followUpDate || '9999').localeCompare(b.followUpDate || '9999'))
    return sorted
  }, [store.applications, filters, sortBy])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (a: Application) => {
    setEditing(a)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen">
      <FireflyBackground />
      <Header store={store} onAdd={openAdd} />

      <main className="mx-auto w-full max-w-[2400px] space-y-6 px-6 pb-24 pt-2 md:px-16 lg:px-48">
        {store.loading ? (
          <div className="grid place-items-center py-32 font-mono text-muted">loading…</div>
        ) : (
          <>
            <StatTiles t={totals} />

            <Momentum store={store} />

            <section id="followups" className="scroll-mt-28">
              <FollowUps store={store} onEdit={openEdit} />
            </section>

            <section id="board" className="scroll-mt-28">
              <Card className="p-6">
                <SectionTitle
                  icon="🗂️"
                  title="Pipeline"
                  right={
                    <div className="flex flex-wrap items-center gap-2">
                      <Filters filters={filters} setFilters={setFilters} resumes={store.resumes} count={filtered.length} />
                      <div className="w-[190px]">
                        <FancySelect
                          ariaLabel="Sort applications"
                          value={sortBy}
                          onChange={(v) => v && setSortBy(v as typeof sortBy)}
                          options={[
                            { value: 'recent', label: 'Newest applied' },
                            { value: 'oldest', label: 'Oldest applied' },
                            { value: 'followup', label: 'Follow-up due' },
                          ]}
                        />
                      </div>
                    </div>
                  }
                />
                {store.applications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/12 px-4 py-12 text-center">
                    <p className="font-display text-[20px] font-bold text-ink">No applications yet</p>
                    <p className="mx-auto mt-1.5 max-w-xl font-sans text-[18.5px] leading-relaxed text-muted">
                      Hit <span className="text-accent-violet">＋ Add application</span> to log your first one. Drag cards
                      between columns to move them through the pipeline.
                    </p>
                  </div>
                ) : (
                  <Board store={store} apps={filtered} onEdit={openEdit} />
                )}
              </Card>
            </section>

            <section id="resumes" className="scroll-mt-28">
              <ManageResumes store={store} />
            </section>

            <section id="analytics" className="scroll-mt-28">
              <ResumeAnalytics store={store} />
            </section>

            <footer className="pt-4 text-center font-mono text-[18.5px] text-faint">
              Launchpad · your data lives in this browser{store.syncState === 'off' ? ' (add a token in ⚙ to sync across devices)' : ', synced to GitHub'} · 🎯
            </footer>
          </>
        )}
      </main>

      {formOpen && <AppForm store={store} editing={editing} onClose={() => setFormOpen(false)} />}
    </div>
  )
}
