import type { Resume } from '../data/types'
import { TextInput } from './ui'
import FancySelect from './FancySelect'

export interface FilterState {
  q: string
  resumeId: string
  locationType: string
}

export const EMPTY_FILTERS: FilterState = { q: '', resumeId: '', locationType: '' }

// Board filters: free-text search over company/role, plus résumé and location-type
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
        className="!w-[220px]"
      />
      <div className="w-[190px]">
        <FancySelect
          ariaLabel="Filter by résumé"
          value={filters.resumeId || undefined}
          onChange={(v) => setFilters({ ...filters, resumeId: v || '' })}
          placeholder="All résumés"
          includeClear
          clearLabel="All résumés"
          options={resumes.map((r) => ({ value: r.id, label: r.name, color: '#a78bfa' }))}
        />
      </div>
      <div className="w-[160px]">
        <FancySelect
          ariaLabel="Filter by location"
          value={filters.locationType || undefined}
          onChange={(v) => setFilters({ ...filters, locationType: v || '' })}
          placeholder="All locations"
          includeClear
          clearLabel="All locations"
          options={[
            { value: 'Remote', label: 'Remote', color: '#5eead4' },
            { value: 'Hybrid', label: 'Hybrid', color: '#5eead4' },
            { value: 'Onsite', label: 'Onsite', color: '#5eead4' },
          ]}
        />
      </div>
      {(filters.q || filters.resumeId || filters.locationType) && (
        <button onClick={() => setFilters(EMPTY_FILTERS)} className="font-mono text-[14.5px] text-faint hover:text-ink">
          clear · {count} shown
        </button>
      )}
    </div>
  )
}
