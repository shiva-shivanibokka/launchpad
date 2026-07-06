# Launchpad — Repo Bug Audit

Whole-codebase audit of the `launchpad` job-application tracker (React 18 + TypeScript strict + Vite). Scope: everything under `src/` plus config. No known starting symptom — this was a from-scratch sweep.

**Headline:** the codebase is clean. Three trivial dead-code items were auto-fixed; no behavior-changing bugs were found. Two low-priority observations are noted for future work.

---

## Phase 0 — Map

- **Entry point:** `main.tsx` → `App.tsx`. Single-page app, no server/API of its own.
- **State core:** `lib/store.ts` (`useStore` hook) owns the single `TrackerData` document (`{ resumes, applications }`). Every mutation writes to `localStorage` (`launchpad-v2`) and, if a token is set, debounce-commits to `public/applications.json` via `lib/github.ts` (GitHub Contents API).
- **Derived state:** `lib/analytics.ts` — pure functions (`computeTotals`, `resumeStats`, `needsFollowUp`, `weeklyApplied`, `isStale`). No side effects, DOM-free.
- **Pipeline contract:** `data/statuses.ts` (`STATUSES`, `STATUS_MAP`, `PIPELINE_ORDER`, `STATUS_RANK`) is the single source of truth for stages; consumed by `Board`, `AppCard`, `AppForm`, `FollowUps`, analytics.
- **Cross-file data type traced end-to-end:** `Application` — created in `store.addApplication` → mutated by `updateApplication`/`moveStatus` (history appended only on status change) → consumed by `Board`/`AppCard`/analytics. All call sites match the type (verified).
- **Shared/mutable state:** three `localStorage` keys (`launchpad-v2`, `launchpad-mtime-v2`, `launchpad-gh-token`). All reads/writes go through `store.ts` / `github.ts`; no stray access elsewhere.

## Stack idioms checked

TypeScript strict is on with `noUnusedLocals` + `noUnusedParameters` + `noFallthroughCasesInSwitch`, and `tsc -b` runs on every build **and in CI** — so unused imports/locals and switch fall-through are compile-time impossible here. React: keys present on all list renders; effect dependency arrays reviewed; no state mutated in place; no `dangerouslySetInnerHTML` (all user text goes through React's escaping — no XSS vector for the notes/company fields).

## Passes — results

- **Correctness / logic:** clean. Analytics funnel logic (`resumeStats`) correctly credits an application that *reached* interview/offer via its `history`, even after it later moved to a terminal state. `computeTotals` response-rate divides by applications actually sent (status ≠ wishlist), not the raw count.
- **Cross-file contracts:** clean. `Board` passes `col.id` (typed `StatusId`) into `store.moveStatus`; `FancySelect` `onChange` guards required selects (`v && setStatus(...)`).
- **Dead code / hygiene:** 3 findings — see auto-fixed below.
- **Error handling:** sync failures set `syncState='error'`, surfaced on the ⚙ button; `fetch` calls in `store`/`github` are guarded with `.catch`. Acceptable for a personal tool.
- **Security:** the optional PAT lives only in `localStorage`, is used client-side against the GitHub API, and is never committed or placed in a URL. No secrets in the repo. `robots noindex` set.
- **Concurrency:** the only "concurrency" is the debounced sync + a 409-retry in `commitJson` (re-reads SHA and retries once) — correct.
- **Performance:** derived values memoized in `App` (`useMemo`); the canvas background caps DPR at 2 and honors `prefers-reduced-motion`. No hot-path issues at this data scale.
- **Production-readiness:** CI builds + deploys with `concurrency` + 3× `deploy-pages` retry. Fine.

## Auto-fixed (trivial-safe — zero call sites, no behavior change)

1. **`src/components/ui.tsx`** — removed the unused native `Select` wrapper. Every dropdown was migrated to the custom `FancySelect`; the export had no importers.
2. **`src/lib/store.ts`** — removed the unused `resumeName` store method (interface + implementation + return). `AppCard` reads the resume object directly now; nothing called it.
3. **`src/index.css`** — removed the now-dead `select` / `select option` color-scheme rules (no native `<select>` remains). Kept the `input[type='date']` dark rule, which is still used by the form.

Build re-verified green after removal (`tsc -b && vite build`, 0 errors).

## Observations (low priority — not bugs)

- **No automated tests.** The reconciliation logic in `store.ts` and the pure functions in `analytics.ts` are the highest-value things to cover and are written to be unit-testable (pure, DOM-free). Captured as a task in `PLAN.md`. Already on the README roadmap.
- **Sync is last-write-wins by design.** On load, `store.ts` adopts whichever copy (repo vs. local) is newer by timestamp; unsynced local edits on device A could be overwritten if device B synced more recently. This is an intentional simplification for a single-user tool (documented in the code and README), not a defect. Left as-is.

**Nothing else was flagged.** No padding — the modules not listed above (`Header`, `StatTiles`, `Momentum`, `Filters`, `usePopover`, `FireflyBackground`, `usePrefersReducedMotion`, `data/types.ts`) were read and are clean.
