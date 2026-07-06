import { resumeStats } from '../lib/analytics'
import type { Store } from '../lib/store'
import { Card, ProgressBar, SectionTitle } from './ui'

// The payoff of the managed resume list: which resume version actually gets
// responses. A funnel per resume — applied → responded → interviewed → offers.
export default function ResumeAnalytics({ store }: { store: Store }) {
  const rows = resumeStats(store.applications, store.resumes)
  const hasData = rows.some((r) => r.applied > 0)

  return (
    <Card className="p-6">
      <SectionTitle icon="📊" title="Resume analytics" />
      {!hasData ? (
        <p className="font-sans text-[18px] leading-relaxed text-muted">
          Once you log applications and tag which resume you used, this shows which version pulls the best response rate.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="font-mono text-[13px] uppercase tracking-wide text-faint">
                <th className="pb-2 pr-3 font-medium">Resume</th>
                <th className="pb-2 px-3 font-medium">Applied</th>
                <th className="pb-2 px-3 font-medium">Responded</th>
                <th className="pb-2 px-3 font-medium">Interviewed</th>
                <th className="pb-2 px-3 font-medium">Offers</th>
                <th className="pb-2 pl-3 font-medium">Response rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.resume.id} className="border-t border-white/8">
                  <td className="py-2.5 pr-3">
                    <span className="font-sans text-[16px] font-semibold text-ink">{r.resume.name}</span>
                    {i === 0 && r.applied > 0 && (
                      <span className="ml-2 rounded-full border border-accent-emerald/40 bg-accent-emerald/10 px-2 py-0.5 font-mono text-[10.5px] font-bold text-accent-emerald">
                        best
                      </span>
                    )}
                  </td>
                  <td className="px-3 font-mono text-[16px] text-subtle">{r.applied}</td>
                  <td className="px-3 font-mono text-[16px] text-subtle">{r.responded}</td>
                  <td className="px-3 font-mono text-[16px] text-subtle">{r.interviewed}</td>
                  <td className="px-3 font-mono text-[16px] text-subtle">{r.offers}</td>
                  <td className="min-w-[140px] py-2.5 pl-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 font-mono text-[13px] font-bold text-accent-mint">{r.responseRate}%</span>
                      <div className="flex-1">
                        <ProgressBar value={r.responseRate} total={100} color="#5eead4" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
