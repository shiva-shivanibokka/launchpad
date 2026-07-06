// The whole tracker is two lists: the resume versions you maintain, and the
// applications you've logged. Everything is user-entered — there is no external
// source to sync from (unlike the sibling trackers that pull from LeetCode /
// GitHub). Persistence is localStorage + an optional commit to applications.json.

export type StatusId =
  | 'wishlist'
  | 'applied'
  | 'screen'
  | 'interviewing'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'ghosted'

export type LocationType = '' | 'Remote' | 'Hybrid' | 'Onsite'

export interface Resume {
  id: string
  name: string
  /** Optional link to the actual file (Google Drive / GitHub / etc.). */
  url?: string
}

export interface StatusChange {
  status: StatusId
  at: string // ISO timestamp
}

export interface Application {
  id: string
  company: string
  role: string
  resumeId: string | null
  status: StatusId
  dateApplied: string | null // ISO yyyy-mm-dd
  jobUrl?: string
  location?: string
  locationType?: LocationType
  nextAction?: string
  followUpDate?: string | null // ISO yyyy-mm-dd
  notes?: string
  history: StatusChange[]
  createdAt: string // ISO timestamp
}

export interface TrackerData {
  resumes: Resume[]
  applications: Application[]
  /** Set at each sync/commit — used to decide if the repo copy is newer. */
  generatedAt?: string
}

export const EMPTY_DATA: TrackerData = { resumes: [], applications: [] }
