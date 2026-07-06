import type { StatusId } from './types'

// The pipeline. `pipeline: true` stages are the ordered kanban columns you move
// an application forward through; the terminal states (rejected / ghosted) sit
// apart because an application can drop out from any stage.

export interface StatusMeta {
  id: StatusId
  label: string
  color: string
  pipeline: boolean // part of the forward kanban flow
  /** Counts as a positive response (they engaged beyond the application). */
  responded: boolean
}

export const STATUSES: StatusMeta[] = [
  { id: 'wishlist', label: 'Wishlist', color: '#94a3b8', pipeline: true, responded: false },
  { id: 'applied', label: 'Applied', color: '#a78bfa', pipeline: true, responded: false },
  { id: 'screen', label: 'OA / Screen', color: '#60a5fa', pipeline: true, responded: true },
  { id: 'interviewing', label: 'Interviewing', color: '#fbbf24', pipeline: true, responded: true },
  { id: 'offer', label: 'Offer', color: '#34d399', pipeline: true, responded: true },
  { id: 'accepted', label: 'Accepted', color: '#2dd4bf', pipeline: true, responded: true },
  { id: 'rejected', label: 'Rejected', color: '#fb7185', pipeline: false, responded: false },
  { id: 'ghosted', label: 'Ghosted', color: '#6b7280', pipeline: false, responded: false },
]

export const STATUS_MAP: Record<StatusId, StatusMeta> = Object.fromEntries(
  STATUSES.map((s) => [s.id, s]),
) as Record<StatusId, StatusMeta>

export const PIPELINE_STATUSES = STATUSES.filter((s) => s.pipeline)
export const TERMINAL_STATUSES = STATUSES.filter((s) => !s.pipeline)

// Ordered ids of the forward pipeline — drives the ◀ / ▶ quick-move arrows.
export const PIPELINE_ORDER: StatusId[] = PIPELINE_STATUSES.map((s) => s.id)

// Ordered rank so "furthest stage reached" analytics can compare applications.
export const STATUS_RANK: Record<StatusId, number> = {
  wishlist: 0,
  applied: 1,
  screen: 2,
  interviewing: 3,
  offer: 4,
  accepted: 5,
  rejected: -1,
  ghosted: -1,
}
