import { useState } from 'react'
import type { Store } from '../lib/store'
import { Button, Card, SectionTitle, TextInput } from './ui'

// Manage the named resume versions that the "resume used" dropdown reads from.
// Each has a name and an optional link to the actual file (Drive / GitHub / etc.).
export default function ManageResumes({ store }: { store: Store }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  const add = () => {
    if (!name.trim()) return
    store.addResume(name, url)
    setName('')
    setUrl('')
  }

  return (
    <Card className="p-6">
      <SectionTitle icon="📄" title="Resumes" />
      <p className="mb-4 font-sans text-[15px] leading-relaxed text-muted">
        Name each tailored resume version. The <span className="text-subtle">resume used</span> dropdown on every application
        reads from this list — that's what powers the per-resume analytics below.
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <span className="mb-1 block font-mono text-[12px] uppercase tracking-wide text-muted">Resume name</span>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="AI Engineer — v3" onKeyDown={(e) => e.key === 'Enter' && add()} />
        </div>
        <div className="min-w-[180px] flex-1">
          <span className="mb-1 block font-mono text-[12px] uppercase tracking-wide text-muted">Link (optional)</span>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" onKeyDown={(e) => e.key === 'Enter' && add()} />
        </div>
        <Button variant="primary" onClick={add} disabled={!name.trim()}>
          ＋ Add
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {store.resumes.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center font-mono text-[12.5px] text-faint">
            No resumes yet — add your first version above.
          </div>
        )}
        {store.resumes.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <input
              value={r.name}
              onChange={(e) => store.updateResume(r.id, { name: e.target.value })}
              className="min-w-0 flex-1 bg-transparent font-sans text-[14px] font-semibold text-ink outline-none"
            />
            <input
              value={r.url || ''}
              onChange={(e) => store.updateResume(r.id, { url: e.target.value || undefined })}
              placeholder="add link…"
              className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-muted outline-none"
            />
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[12px] text-accent-mint hover:bg-white/5">
                open ↗
              </a>
            )}
            <button
              onClick={() => store.deleteResume(r.id)}
              className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[12px] text-faint hover:border-accent-rose/40 hover:text-accent-rose"
              title="Remove (unlinks it from applications)"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
