import { useState } from 'react'
import type { Application, LocationType, StatusId } from '../data/types'
import { STATUSES } from '../data/statuses'
import type { Store } from '../lib/store'
import { Button, Field, Select, TextArea, TextInput } from './ui'

// Modal to add a new application or edit an existing one. `editing` is the
// application being edited, or null when adding.
export default function AppForm({
  store,
  editing,
  onClose,
}: {
  store: Store
  editing: Application | null
  onClose: () => void
}) {
  const [company, setCompany] = useState(editing?.company || '')
  const [role, setRole] = useState(editing?.role || '')
  const [resumeId, setResumeId] = useState<string>(editing?.resumeId || '')
  const [status, setStatus] = useState<StatusId>(editing?.status || 'applied')
  const [dateApplied, setDateApplied] = useState(editing?.dateApplied || new Date().toISOString().slice(0, 10))
  const [jobUrl, setJobUrl] = useState(editing?.jobUrl || '')
  const [location, setLocation] = useState(editing?.location || '')
  const [locationType, setLocationType] = useState<LocationType>(editing?.locationType || '')
  const [nextAction, setNextAction] = useState(editing?.nextAction || '')
  const [followUpDate, setFollowUpDate] = useState(editing?.followUpDate || '')
  const [notes, setNotes] = useState(editing?.notes || '')

  const save = () => {
    const patch = {
      company,
      role,
      resumeId: resumeId || null,
      status,
      dateApplied: dateApplied || null,
      jobUrl,
      location,
      locationType,
      nextAction,
      followUpDate: followUpDate || null,
      notes,
    }
    if (editing) store.updateApplication(editing.id, patch)
    else store.addApplication(patch)
    onClose()
  }

  const remove = () => {
    if (editing && confirm(`Delete ${editing.company}? This can't be undone.`)) {
      store.deleteApplication(editing.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/12 bg-card/95 p-6 shadow-card backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-[22px] font-extrabold uppercase tracking-tight text-ink">
            {editing ? 'Edit application' : 'Add application'}
          </h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 font-mono text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Company *">
              <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Anthropic" autoFocus />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Role">
              <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="ML Engineer" />
            </Field>
          </div>
          <Field label="Resume used">
            <Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
              <option value="">— none —</option>
              {store.resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as StatusId)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date applied">
            <TextInput type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
          </Field>
          <Field label="Location type">
            <Select value={locationType} onChange={(e) => setLocationType(e.target.value as LocationType)}>
              <option value="">—</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Location">
              <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco / Remote" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Job posting link">
              <TextInput value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Next action">
            <TextInput value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Follow up / prep OA" />
          </Field>
          <Field label="Follow up by">
            <TextInput type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recruiter name, referral, comp, impressions…" />
            </Field>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>{editing && <Button variant="danger" onClick={remove}>Delete</Button>}</div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!company.trim()}>
              {editing ? 'Save changes' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
