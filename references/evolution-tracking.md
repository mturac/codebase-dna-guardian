# DNA Evolution Tracking

How the Guardian tracks convention changes over time.

## The Problem

Codebases evolve. What was a HARD rule 6 months ago might be deprecated now.
A library the team adopted last sprint becomes the new standard. Without
tracking these changes, the DNA profile becomes a fossil — accurate at the
time of creation but increasingly disconnected from reality.

## History File

Every `/dna-diff` or `/dna-scan` (when updating an existing profile) appends
an entry to `.claude/dna-history.md`:

```markdown
# DNA Evolution History

## 2026-05-28 — Scan Update
- Trigger: Manual re-scan after major refactoring
- Added: N6 (.d.ts convention), A5 (zod validation)
- Changed: E2 (pino now standard), I1 (expanded aliases)
- Removed: D2 (moment.js gone)
- Score: 84% → 89%
- Files sampled: 22
- Git hash: a1b2c3d → f4e5d6c

## 2026-04-15 — Initial Scan
- Trigger: First /dna-scan
- Rules extracted: 24 (8 HARD, 11 SOFT, 5 PREF)
- Score: 84%
- Files sampled: 18
- Git hash: a1b2c3d
```

## Rule Lifecycle

Rules go through these states:

```
Detected → Confirmed → (optionally) Promoted → (optionally) Deprecated → Removed
```

- **Detected**: Found in sampling but only in 1-2 files. Assigned PREF tier.
- **Confirmed**: Validated across multiple files. Tier assigned based on impact.
- **Promoted**: Tier upgraded (PREF→SOFT or SOFT→HARD) because the team
  tightened the convention.
- **Deprecated**: Team consciously decided to move away from this pattern.
  Kept in DNA with a note: "Deprecated since [date], migrate to [new pattern]."
- **Removed**: Pattern no longer exists in codebase. Removed from active DNA,
  recorded in history.

## Conflict Resolution

When a re-scan detects a pattern that contradicts an existing rule:

1. Check how many files follow the old rule vs the new pattern
2. If old rule still majority: keep old, flag new pattern as "emerging"
3. If new pattern is majority: propose rule update, ask user to confirm
4. If roughly 50/50: flag as "architectural drift" — the team needs to decide

Never silently change a HARD rule. Always ask.

## Team Decision Logging

When a user manually edits `dna.md` or overrides a DNA rule, the Guardian
adds a history entry:

```markdown
## 2026-05-20 — Manual Override
- Rule A2: Downgraded from HARD to SOFT
- Reason: "Payment service needs direct DB access for performance, 
  repository pattern adds too much overhead for batch operations"
- Decision by: user override during code generation
```

This preserves the "why" behind exceptions — invaluable for future team
members who see the inconsistency and wonder if it's a bug or a feature.
