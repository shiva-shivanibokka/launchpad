import { useState } from 'react'
import { getToken, setToken, verifyToken } from '../lib/github'
import type { Store } from '../lib/store'
import { Button } from './ui'

// Optional: paste a fine-grained GitHub PAT (Contents: read/write on
// launchpad) to persist your applications across devices. Stored only in
// this browser. Without it, everything still works — it just lives locally.
export default function SyncSettings({ store }: { store: Store }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState(getToken())
  const [msg, setMsg] = useState('')

  const save = async () => {
    setMsg('Checking…')
    const res = await verifyToken(val)
    setMsg(res.message)
    if (res.ok) {
      setToken(val)
      store.syncNow()
    }
  }

  const label =
    store.syncState === 'saving'
      ? 'saving…'
      : store.syncState === 'saved'
        ? 'saved ✓'
        : store.syncState === 'error'
          ? 'sync error'
          : store.syncState === 'off'
            ? 'local only'
            : store.dirty
              ? 'unsaved changes'
              : 'idle'

  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" onClick={() => store.syncNow()} disabled={store.syncState === 'off'} title="Commit to GitHub now">
        {store.syncState === 'saving' ? '⟳ Syncing…' : '⬆ Sync'}
      </Button>
      <div className="relative">
        <Button onClick={() => setOpen((o) => !o)} title="Token & sync settings">
          ⚙ {label}
        </Button>
        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-[320px] rounded-xl border border-white/10 bg-card/95 p-3 text-left backdrop-blur-md">
            <p className="mb-2 text-[13px] leading-relaxed text-muted">
              Optional. A fine-grained PAT (Contents: read/write on <span className="text-subtle">launchpad</span>) saves
              your applications across devices. Stored only in this browser, never committed.
            </p>
            <input
              type="password"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="github_pat_…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[13.5px] text-ink outline-none focus:border-accent-teal/60"
            />
            <div className="mt-2 flex items-center gap-2">
              <Button variant="primary" onClick={save}>
                Save &amp; sync
              </Button>
              <Button
                onClick={() => {
                  setToken('')
                  setVal('')
                  setMsg('cleared')
                }}
              >
                Clear
              </Button>
              {msg && <span className="font-mono text-[12.5px] text-faint">{msg}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
