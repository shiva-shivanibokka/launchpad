import type { Totals } from '../lib/analytics'
import { Card } from './ui'

// Headline numbers across the top: how many applied, response rate, who's live,
// offers, and how many closed out.
export default function StatTiles({ t }: { t: Totals }) {
  const tiles = [
    { label: 'Applied', value: String(t.total), sub: `${t.active} still active`, color: '#a78bfa' },
    { label: 'Response rate', value: `${t.responseRate}%`, sub: `${t.responded} responded`, color: '#5eead4' },
    { label: 'Interviewing', value: String(t.interviewing), sub: 'in process', color: '#fbbf24' },
    { label: 'Offers', value: String(t.offers), sub: `${t.accepted} accepted`, color: '#34d399' },
    { label: 'Closed', value: String(t.closed), sub: 'rejected / ghosted', color: '#fb7185' },
  ]
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
      {tiles.map((m) => (
        <Card key={m.label} className="p-7">
          <div className="font-mono text-[17px] font-semibold uppercase tracking-wide text-muted">{m.label}</div>
          <div className="mt-3 font-display text-[52px] font-extrabold leading-none sm:text-[60px]" style={{ color: m.color }}>
            {m.value}
          </div>
          <div className="mt-2.5 font-mono text-[16px] text-faint">{m.sub}</div>
        </Card>
      ))}
    </div>
  )
}
