import { weeklyApplied } from '../lib/analytics'
import type { Store } from '../lib/store'
import { Card, SectionTitle } from './ui'

// A compact strip of how many applications you sent each week over the last ~12
// weeks — a quick read on your pace. Bars scale to the busiest week.
export default function Momentum({ store }: { store: Store }) {
  const weeks = weeklyApplied(store.applications, 12)
  const max = Math.max(1, ...weeks.map((w) => w.count))
  const total = weeks.reduce((n, w) => n + w.count, 0)
  if (total === 0) return null

  return (
    <Card className="p-5">
      <SectionTitle
        icon="📈"
        title="Momentum"
        right={<span className="font-mono text-[15.5px] text-muted">{total} in last 12 wks</span>}
      />
      <div className="flex items-end gap-2.5" style={{ height: 120 }}>
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5" title={`Week of ${w.label}: ${w.count}`}>
            <span className="font-mono text-[13.5px] text-faint">{w.count || ''}</span>
            <div
              className="w-full rounded-t-md transition-[height] duration-500"
              style={{
                height: `${(w.count / max) * 84 + (w.count ? 6 : 2)}px`,
                background: w.count
                  ? 'linear-gradient(180deg, #a78bfa, #34d399)'
                  : 'rgba(255,255,255,0.06)',
              }}
            />
            <span className="font-mono text-[13px] text-faint">{w.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
