import { useCallback, useEffect, useRef, useState } from 'react'
import { commitJson, hasToken, type SyncState } from './github'
import { EMPTY_DATA, type Application, type Resume, type StatusId, type TrackerData } from '../data/types'

// Persistence model
// -----------------
// Unlike the sibling trackers, there is no external source of truth to pull from
// — YOU type the data. So the whole document (resumes + applications) lives in
// localStorage as the working copy, and can optionally be committed to the repo's
// applications.json via a PAT so it survives device switches.
//
// On load we fetch the repo copy (baseline) AND read localStorage, then keep
// whichever is newer: if you synced on another device, the repo's generatedAt is
// more recent than this browser's last local edit, so the repo copy wins.

const LS_KEY = 'launchpad-v2'
const LS_MTIME = 'launchpad-mtime-v2'
const base = import.meta.env.BASE_URL

// A monotonic-ish id without external deps. Random suffix avoids collisions when
// two are created in the same millisecond.
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function readLocal(): { data: TrackerData; mtime: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as TrackerData
    const mtime = Number(localStorage.getItem(LS_MTIME) || 0)
    return { data, mtime }
  } catch {
    return null
  }
}
function writeLocal(data: TrackerData) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
  localStorage.setItem(LS_MTIME, String(Date.now()))
}

export interface Store {
  loading: boolean
  resumes: Resume[]
  applications: Application[]
  // application mutations
  addApplication: (a: Partial<Application>) => void
  updateApplication: (id: string, patch: Partial<Application>) => void
  moveStatus: (id: string, status: StatusId) => void
  deleteApplication: (id: string) => void
  // resume mutations
  addResume: (name: string, url?: string) => void
  updateResume: (id: string, patch: Partial<Resume>) => void
  deleteResume: (id: string) => void
  resumeName: (id: string | null) => string
  // sync
  dirty: boolean
  lastSyncedAt: string | null
  syncState: SyncState
  syncNow: () => void
}

export function useStore(): Store {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TrackerData>(EMPTY_DATA)
  const [dirty, setDirty] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(hasToken() ? 'idle' : 'off')
  const timer = useRef<number>()

  // Load: reconcile repo baseline vs local working copy.
  useEffect(() => {
    let cancelled = false
    const local = readLocal()
    fetch(`${base}applications.json`)
      .then((r) => (r.ok ? (r.json() as Promise<TrackerData>) : null))
      .catch(() => null)
      .then((repo) => {
        if (cancelled) return
        const repoTime = repo?.generatedAt ? Date.parse(repo.generatedAt) : 0
        // Prefer the repo copy only when it's genuinely newer than local edits.
        if (repo && (!local || repoTime > local.mtime)) {
          setData({ resumes: repo.resumes || [], applications: repo.applications || [], generatedAt: repo.generatedAt })
          setLastSyncedAt(repo.generatedAt || null)
          writeLocal(repo)
          setDirty(false)
        } else if (local) {
          setData(local.data)
          setLastSyncedAt(local.data.generatedAt || null)
          setDirty(true) // local has unsynced edits relative to the repo
        } else if (repo) {
          setData({ resumes: repo.resumes || [], applications: repo.applications || [], generatedAt: repo.generatedAt })
          setLastSyncedAt(repo.generatedAt || null)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Any mutation goes through here: update state, persist locally, flag dirty.
  const mutate = useCallback((fn: (d: TrackerData) => TrackerData) => {
    setData((prev) => {
      const next = fn(prev)
      writeLocal(next)
      return next
    })
    setDirty(true)
  }, [])

  const addApplication = useCallback(
    (a: Partial<Application>) => {
      const now = new Date().toISOString()
      const status = (a.status || 'applied') as StatusId
      const app: Application = {
        id: uid('a'),
        company: a.company?.trim() || 'Untitled',
        role: a.role?.trim() || '',
        resumeId: a.resumeId ?? null,
        status,
        dateApplied: a.dateApplied ?? now.slice(0, 10),
        jobUrl: a.jobUrl || '',
        location: a.location || '',
        locationType: a.locationType || '',
        nextAction: a.nextAction || '',
        followUpDate: a.followUpDate ?? null,
        notes: a.notes || '',
        history: [{ status, at: now }],
        createdAt: now,
      }
      mutate((d) => ({ ...d, applications: [app, ...d.applications] }))
    },
    [mutate],
  )

  const updateApplication = useCallback(
    (id: string, patch: Partial<Application>) => {
      mutate((d) => ({
        ...d,
        applications: d.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }))
    },
    [mutate],
  )

  const moveStatus = useCallback(
    (id: string, status: StatusId) => {
      const now = new Date().toISOString()
      mutate((d) => ({
        ...d,
        applications: d.applications.map((a) =>
          a.id === id && a.status !== status
            ? { ...a, status, history: [...a.history, { status, at: now }] }
            : a,
        ),
      }))
    },
    [mutate],
  )

  const deleteApplication = useCallback(
    (id: string) => {
      mutate((d) => ({ ...d, applications: d.applications.filter((a) => a.id !== id) }))
    },
    [mutate],
  )

  const addResume = useCallback(
    (name: string, url?: string) => {
      const clean = name.trim()
      if (!clean) return
      mutate((d) => ({ ...d, resumes: [...d.resumes, { id: uid('r'), name: clean, url: url?.trim() || undefined }] }))
    },
    [mutate],
  )

  const updateResume = useCallback(
    (id: string, patch: Partial<Resume>) => {
      mutate((d) => ({ ...d, resumes: d.resumes.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
    },
    [mutate],
  )

  // Removing a resume unlinks it from any application that referenced it.
  const deleteResume = useCallback(
    (id: string) => {
      mutate((d) => ({
        ...d,
        resumes: d.resumes.filter((r) => r.id !== id),
        applications: d.applications.map((a) => (a.resumeId === id ? { ...a, resumeId: null } : a)),
      }))
    },
    [mutate],
  )

  const resumeName = useCallback(
    (id: string | null) => (id ? data.resumes.find((r) => r.id === id)?.name || '—' : '—'),
    [data.resumes],
  )

  const syncNow = useCallback(() => {
    if (!hasToken()) return
    const now = new Date().toISOString()
    const payload: TrackerData = { ...data, generatedAt: now }
    setSyncState('saving')
    commitJson('public/applications.json', payload, 'Update job applications')
      .then(() => {
        writeLocal(payload)
        setData(payload)
        setLastSyncedAt(now)
        setDirty(false)
        setSyncState('saved')
      })
      .catch(() => setSyncState('error'))
  }, [data])

  // Debounced auto-commit whenever there are unsynced edits and a token exists.
  useEffect(() => {
    if (loading || !hasToken() || !dirty) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(syncNow, 3500)
    return () => window.clearTimeout(timer.current)
  }, [data, dirty, loading, syncNow])

  return {
    loading,
    resumes: data.resumes,
    applications: data.applications,
    addApplication,
    updateApplication,
    moveStatus,
    deleteApplication,
    addResume,
    updateResume,
    deleteResume,
    resumeName,
    dirty,
    lastSyncedAt,
    syncState,
    syncNow,
  }
}
