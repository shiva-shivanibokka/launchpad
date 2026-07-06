import type { Resume } from '../data/types'
import { Select, TextInput } from './ui'

export interface FilterState {
  q: string
  resumeId: string
  locationType: string
}

export const EMPTY_FILTERS: FilterState = { q: '', resumeId: '', locationType: '' }

// Board filters: free-text search over company/role, plus resume and location-type
// dropdowns. Purely presentational — App owns the state and does the filtering.
export default function Filters({
  filters,
  setFilters,
  resumes,
  count,
}: {
  filters: FilterState
  setFilters: (f: FilterState) => void
  resumes: Resume[]
  count: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TextInput
        value={filters.q}
        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        placeholder="Search company or role…"
        className="w-[220px]"
      />
      <Select value={filters.resumeId} onChange={(e) => setFilters({ ...filters, resumeId: e.target.value })} className="w-[190px]">
        <option value="">All resumes</option>
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      <Select value={filters.locationType} onChange={(e) => setFilters({ ...filters, locationType: e.target.value })} className="w-[150px]">
        <option value="">All locations</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Onsite">Onsite</option>
      </Select>
      {(filters.q || filters.resumeId || filters.locationType) && (
        <button onClick={() => setFilters(EMPTY_FILTERS)} className="font-mono text-[12.5px] text-faint hover:text-ink">
          clear · {count} shown
        </button>
      )}
    </div>
  )
}
