# Launchpad — Audit Follow-up Plan

One `needs-plan` item surfaced by the audit. It is an **addition** (new tests), so it is written here for review rather than auto-applied. Everything else the audit found was either auto-fixed (trivial dead code) or an intentional design choice.

## Task 1 — Unit tests for the store reconciliation + analytics

**Why it matters:** `store.ts`'s load-time reconciliation (repo-vs-local "newer wins") and the pure functions in `analytics.ts` (`computeTotals`, `resumeStats`, `needsFollowUp`, `weeklyApplied`, `isStale`) encode the app's actual business rules. A silent regression here (e.g. response-rate dividing by the wrong denominator, or a stale-detection off-by-one) would be invisible in the UI until the numbers are wrong. These functions are pure and DOM-free, so they're cheap to test.

**Files:**
- Add `vitest` (+ `@testing-library` not required — no DOM needed) to `devDependencies`.
- New `src/lib/analytics.test.ts`:
  - `computeTotals`: response rate is `responded / sent` where `sent = status ≠ wishlist`; an app that reached `interviewing` then `rejected` still counts as responded (via history).
  - `resumeStats`: an app that reached offer then was rejected still credits its resume with the interview + offer; wishlist apps are excluded from the denominator.
  - `needsFollowUp`: returns apps with a past `followUpDate`, or `applied` + 14 days quiet; excludes terminal/accepted.
  - `weeklyApplied`: buckets by Monday-anchored week; wishlist and null-date apps excluded.
  - `isStale`: true only for active apps whose last history entry is ≥10 days old.
- New `src/lib/store.test.ts` (extract the reconciliation decision into a small pure helper first so it can be tested without React):
  - repo newer than local → adopt repo.
  - local newer (unsynced edits) → keep local, mark dirty.
  - no local → adopt repo baseline.
- Add `"test": "vitest run"` to `package.json` scripts.
- Optionally add a `test` step to `.github/workflows/deploy.yml` before `build`.

**Verification:** `npm test` passes; `npm run build` still green.

**Risk:** low — purely additive (new files + devDeps). No application logic changes. The one refactor (extracting the reconciliation helper out of the `useEffect`) should be behavior-preserving and is the only edit that touches existing code.
