---
name: codebase-dna-guardian
description: "Senior Architect Guardian that extracts and enforces a codebase's tribal knowledge — unwritten naming conventions, architectural patterns, error handling strategies, import styles, and dependency choices. Use this skill whenever working in an existing codebase and the user asks to scan project conventions, check code against project standards, refactor for consistency, generate a DNA health report, onboard a new developer, or when Claude Code is about to write new code in a project with an existing .claude/dna.md file. Also trigger when the user says 'dna scan', 'check my code style', 'project conventions', 'architectural consistency', 'tribal knowledge', 'what patterns does this project use', 'why is this codebase inconsistent', 'onboard me to this project', 'codebase health check', or references code review against unwritten team rules. Even if the user does not name this skill explicitly, trigger it whenever Claude Code is generating new code in a project that has a .claude/dna.md or .claude/dna/ directory — the DNA must be consulted before writing."
---

# Codebase DNA Guardian

A Senior Architect Guardian that extracts and enforces the tribal knowledge
embedded in a codebase. Every mature project has unwritten rules — naming
conventions, error handling patterns, import styles, folder structures, test
strategies — that only experienced team members know. This skill captures
those rules as a machine-readable DNA profile and enforces them continuously.

---

## Why this exists

New code in an existing project should look like it was written by the team's
most consistent, experienced developer. Not by a generalist AI that introduces
"better" patterns from other projects. The cost of inconsistency is real:
cognitive load, review friction, onboarding time, subtle bugs from mixed
conventions. This skill prevents that.

---

## Core principles

1. **DNA First, Code Second.** Before writing any new code in a project with
   a DNA profile, read it. If the new code would contradict it, explain the
   conflict and propose a DNA-compliant alternative.

2. **Mimic, Don't Innovate.** When adding features, mimic existing patterns.
   Do not introduce patterns from other projects unless the user explicitly
   asks for a migration.

3. **Severity-Aware Intervention.** Not every convention is equally important.
   See the severity tiers below — hard rules get proactive intervention, soft
   conventions get a footnote, preferences get silently applied.

4. **Incremental Scanning.** Real codebases are too large to read entirely.
   The scan strategy samples representative files, not everything.

5. **Hierarchical DNA.** Monorepos and multi-service projects have root-level
   DNA (shared conventions) and per-service DNA (overrides). The skill
   supports this natively.

---

## Severity tiers

Every DNA rule has one of three severity levels. This determines how the
Guardian intervenes:

| Tier | Name | Intervention | Example |
|------|------|-------------|---------|
| 🔴 | **HARD** | Stop and explain before writing violating code. Ask user to confirm if they want to proceed anyway. | "No raw SQL in controllers — use Repository pattern" |
| 🟡 | **SOFT** | Write DNA-compliant code, add a footnote at the end explaining the convention followed. | "File naming is kebab-case per DNA" |
| 🟢 | **PREF** | Silently apply the convention. No mention unless user asks. | "Team prefers dayjs over moment" |

When generating DNA, assign a tier to every rule. When uncertain, default
to SOFT — it informs without blocking.

---

## Commands

### `/dna-scan` — Extract project DNA

Performs an incremental scan of the codebase and generates a DNA profile.

**Phase 1: Skeleton Discovery (fast, no file reading)**

Run these commands to build a structural map without reading file contents:

```bash
# Project root structure (2 levels)
find . -maxdepth 2 -type f \( -name "*.json" -o -name "*.toml" -o -name "*.yaml" -o -name "*.yml" -o -name "*.lock" \) | head -30

# Framework detection
cat package.json 2>/dev/null | head -40
cat tsconfig.json 2>/dev/null
cat pyproject.toml 2>/dev/null
cat go.mod 2>/dev/null
cat Cargo.toml 2>/dev/null

# Folder structure
find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/__pycache__/*' | head -60

# File naming patterns (just names, not contents)
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) 2>/dev/null | head -80
```

From this, determine:
- Language and framework
- Monorepo vs single project
- Folder philosophy (feature-based, layer-based, domain-driven)
- File naming convention (from file names alone)

**Phase 2: Representative Sampling (targeted file reading)**

Do NOT read 100 files. Instead, sample strategically:

1. **Config files** (3-5): `tsconfig.json`, `eslint*`, `prettier*`, `.editorconfig`, framework config
2. **Entry points** (2-3): `main.ts`, `app.ts`, `index.ts`, `server.ts`
3. **One complete vertical slice** (4-6 files): Pick one feature and read its controller/route → service → repository/model → test → types. This reveals the full architectural pattern.
4. **Error handling samples** (2-3): Search for `catch`, `Error`, `throw`, `Result` patterns
5. **Test files** (2-3): Reveal test framework, naming, mocking strategy
6. **Shared utilities** (2-3): `src/lib/`, `src/utils/`, `src/common/` — reveals helper patterns

Total: ~15-20 files max. Enough to extract DNA without hitting context limits.

**Phase 3: Pattern Extraction**

From the sampled files, extract DNA markers in these categories:

- **A. Naming**: File naming, component naming, variable casing, constant casing, type/interface naming
- **B. Architecture**: Folder structure, layer separation, state management, data access pattern, auth pattern
- **C. Error Handling**: Custom error classes, Result pattern vs try/catch, error boundaries, logging library
- **D. Testing**: Framework, file naming/location, mocking strategy, assertion style
- **E. Dependencies**: Actually used vs installed, competing libraries, wrapper patterns
- **F. Imports**: Absolute vs relative, path aliases, barrel files, import ordering
- **G. API Contracts**: Response envelope shape, pagination pattern, validation approach, status code usage
- **H. Async Patterns**: Promise vs async/await, concurrency control, queue/job patterns

**Phase 4: Generate DNA Profile**

Write the DNA profile to `.claude/dna.md` (single project) or `.claude/dna/root.md` + `.claude/dna/{service}.md` (monorepo). See `templates/dna-template.md` for the exact format.

Include in the DNA file:
- Scan metadata (date, files sampled, project hash)
- Each rule with: ID, severity tier, description, example, counter-example
- A `## Zombie Dependencies` section listing packages with no detectable imports (mark as "suspected" — verify with depcheck/knip)
- An `## Architectural Drift Zones` section listing areas of the codebase with internal inconsistency
- A `## Staleness` section with last scan date and invalidation hints

**Phase 5: Confidence Check**

After generating, do a quick validation — pick 2-3 files NOT in the sample
set and check if the extracted rules hold. If a rule contradicts >1 file,
downgrade it from HARD to SOFT or note it as "inconsistently applied."

---

### `/dna-check [path]` — Audit files against DNA

Read `.claude/dna.md`, then analyze the target file(s):

1. Load DNA rules
2. Read target file(s) — if a directory, sample up to 10 files
3. Check each rule against each file
4. Report violations grouped by severity

Output format:

```
DNA Audit: src/services/user-service.ts

🔴 HARD VIOLATIONS (fix before merge):
  Line 24: Direct HTTP call via axios — DNA-H3 requires apiClient wrapper
  → Replace with: import { apiClient } from '@/lib/api-client'

🟡 SOFT VIOLATIONS (convention drift):
  Line 1-5: Named export without barrel re-export — DNA-S7 prefers barrel files
  → Consider adding to src/services/index.ts

✅ 18 rules checked, 16 compliant
⏰ DNA last scanned: 12 days ago (consider re-scan if major changes landed)
```

---

### `/dna-refactor [path]` — Auto-fix violations

1. Load DNA, read target file(s)
2. Identify all violations
3. Show a summary of planned changes and ask for confirmation
4. Apply fixes preserving business logic
5. If files are renamed, update imports across the codebase
6. Re-run `/dna-check` to verify

Never apply refactoring without showing the plan first. Business logic
changes are never part of a DNA refactor — only structural/stylistic changes.

---

### `/dna-report` — Health dashboard

Generate a project-wide health summary:

```
Codebase DNA Health Report
Generated: 2026-05-28

Files sampled: 22 / 187 total
Rules extracted: 24 (8 HARD, 11 SOFT, 5 PREF)

Consistency Score: 84% (20/24 rules consistently followed)

🔴 HARD violations found: 3
  - 2x raw SQL in controller layer (DNA-H4)
  - 1x unhandled async error (DNA-H2)

🟡 SOFT drift detected: 6
  - 4x camelCase file names in src/services/ (DNA-S1 expects kebab-case)
  - 2x console.log instead of logger (DNA-S5)

🧟 Suspected zombie dependencies: (verify with depcheck/knip)
  - moment@2.29.4 — 0 imports found (team uses dayjs)
  - lodash@4.17.21 — only _.get used, consider optional chaining

⚠️ Architectural drift:
  - src/controllers/legacy/ uses callback pattern while rest uses async/await
  - src/services/payment.ts bypasses repository layer (direct Prisma calls)

Recommendations:
  1. Run /dna-refactor src/controllers/ for HARD violations
  2. Schedule depcheck audit for zombie dependencies
  3. Consider migrating legacy/ to async/await in next sprint
```

The score formula: `(rules_with_zero_violations / total_rules) * 100`.
This measures consistency, not quality. Transparent and reproducible.

---

### `/dna-preview` — Visual HTML report

Render the DNA profile as a styled HTML page, serve it locally, and
open it in the browser (or take a screenshot if running headlessly).

**Steps:**

1. Read `.claude/dna.md` (or `.claude/dna/root.md` + all service files for monorepos)
2. Convert markdown to HTML using the template below
3. Write to `/tmp/dna-preview-{project-slug}.html`
4. Serve: `python3 -m http.server 0 --directory /tmp &` — capture the port
5. Print the URL: `🌐 DNA Preview ready → http://localhost:{port}/dna-preview-{slug}.html`
6. If Playwright MCP is available: navigate to the URL and `browser_take_screenshot(fullPage=true)`

**HTML template** (write this, replacing `{MARKDOWN_CONTENT}` with the escaped DNA markdown):

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>🧬 DNA Report — {PROJECT_NAME}</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         max-width: 960px; margin: 0 auto; padding: 24px 32px;
         background: #0d1117; color: #c9d1d9; }
  h1 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 12px; }
  h2 { color: #79c0ff; margin-top: 32px; }
  h3 { color: #d2a8ff; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th { background: #161b22; color: #8b949e; text-align: left;
       padding: 8px 12px; border: 1px solid #30363d; }
  td { padding: 8px 12px; border: 1px solid #30363d; vertical-align: top; }
  tr:nth-child(even) td { background: #161b22; }
  code { background: #161b22; padding: 2px 6px; border-radius: 4px;
         font-family: 'SF Mono', monospace; font-size: 12px; color: #79c0ff; }
  pre { background: #161b22; padding: 16px; border-radius: 6px;
        overflow-x: auto; border: 1px solid #30363d; }
  pre code { background: none; padding: 0; color: #e6edf3; }
  blockquote { border-left: 3px solid #30363d; margin: 0;
               padding: 8px 16px; color: #8b949e; }
  hr { border: none; border-top: 1px solid #30363d; margin: 24px 0; }
  strong { color: #e6edf3; }
</style>
</head>
<body>
<div id="content"></div>
<script>
// Escape backticks and ${} before embedding: .replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${')
const md = `{MARKDOWN_CONTENT}`;
document.getElementById('content').innerHTML = marked.parse(md);
</script>
</body>
</html>
```

**Escaping the markdown for the JS template literal** (run via Python):
```python
with open('.claude/dna.md') as f: content = f.read()
escaped = content.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
# inject `escaped` into the template above
```

For monorepos: concatenate all `.claude/dna/*.md` files with `---` separators before rendering.

---

### `/dna-onboard` — New developer briefing

Generate a concise onboarding document from the DNA profile:

```
Welcome to [Project Name]

Here's what you need to know before writing your first line of code:

📁 Structure: Feature-based folders. Each feature has its own controller,
   service, repository, and test files.

📝 Naming: Files are kebab-case. Components are PascalCase. Variables are
   camelCase. Constants are SCREAMING_SNAKE.

🔌 API calls: Never use axios/fetch directly. Always go through
   src/lib/api-client.ts which handles auth, retries, and error wrapping.

❌ Error handling: All async functions must catch errors. Use the AppError
   class from src/lib/errors.ts, never throw raw strings.

🧪 Testing: Vitest, co-located with source files as *.spec.ts. Mock via
   vi.mock(), never jest.mock().

⚠️ Watch out for:
   - src/controllers/legacy/ — old callback style, don't copy this pattern
   - moment.js is installed but deprecated — use dayjs instead
```

This is the killer feature for teams. A new dev reads this and writes
DNA-compliant code from day one.

---

### `/dna-diff` — DNA Evolution Between Scans

Compare the current codebase against the existing DNA profile to see what
has evolved:

1. Load existing `.claude/dna.md` (or `.claude/dna/` hierarchy)
2. Re-scan the codebase using the same sampling strategy
3. Diff the old vs new DNA and categorize changes:

```
DNA Evolution Report (since 2026-04-15)

🆕 New Patterns Detected:
  + N6 (SOFT): Type files now use .d.ts suffix (seen in 4/5 sampled files)
  + A5 (PREF): Team adopted zod for runtime validation

🔄 Changed Patterns:
  ~ E2: Logging migrated from console.log → pino (was SOFT violation, now DNA)
  ~ I1: Path aliases expanded — @/services now exists alongside @/lib

🗑️ Deprecated Patterns:
  - D2: moment.js fully removed from codebase (was zombie, now gone)

📊 Consistency Score: 84% → 89% (+5)
```

4. **STOP. Present the diff report and ask for explicit confirmation.** Do not proceed to step 5 until the user responds with a clear YES (or equivalent affirmative). If the change affects any HARD-tier rule, call that out explicitly and require confirmation for each one.
5. Only after confirmed: overwrite the DNA profile, then append a changelog entry to `.claude/dna-history.md`:

```markdown
## 2026-05-28 — Scan Update
- Added: N6 (.d.ts convention), A5 (zod validation)
- Changed: E2 (pino now standard), I1 (expanded aliases)
- Removed: D2 (moment.js gone)
- Score: 84% → 89%
```

This creates an audit trail. When someone asks "why do we do X this way?"
the history shows when and why the convention was adopted.

---

### `/dna-guard [branch]` — Pre-Merge Gate

Check a branch's changes against DNA before merging:

1. Detect the default base branch: `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'` (fallback to `main` if unavailable). If `{branch}` is omitted or equals the base branch, abort with: "dna-guard requires a feature branch — cannot diff a branch against itself." Run `git diff {base}...{branch} --name-only` (three-dot for merge-base comparison) to identify changed files.
2. Load DNA profile
3. Read only the changed files (not the whole branch)
4. Check each change against DNA rules
5. Generate a merge-readiness report:

```
DNA Guard: feature/payment-refactor (7 files changed)

✅ PASS — No HARD violations

🟡 SOFT notes (3):
  - src/services/payment-processor.ts: camelCase filename (DNA-N1 expects kebab)
  - src/services/payment-processor.ts: Missing barrel re-export (DNA-I2)
  - src/controllers/payment.ts: console.log on line 45 (DNA-E2 expects logger)

🟢 DNA-compliant patterns confirmed:
  - Repository pattern followed correctly in payment-repository.ts
  - Error handling uses AppError class
  - Tests co-located and use vitest

Verdict: Safe to merge. SOFT notes are non-blocking but worth addressing.
```

If HARD violations exist:
```
🔴 BLOCK — 2 HARD violations must be fixed before merge:
  1. src/controllers/payment.ts:34 — Direct Prisma call in controller (DNA-A2)
  2. src/services/payment.ts:67 — Untyped catch block with `any` (DNA-E1)

Run /dna-refactor on these files or fix manually.
```

This is the CI/CD integration point. Teams can run `/dna-guard` as part
of their review checklist or automate it via Claude Code in CI.

---

## Passive Guardian Mode

When this skill is NOT explicitly invoked but Claude Code is generating code
in a project with `.claude/dna.md`:

1. **Run staleness check first** (before reading rules): apply the checks in `## DNA Staleness Detection` below. If DNA is stale, emit the staleness warning before proceeding. Never silently use stale DNA.
2. **Silently read** the DNA file before generating code
3. **Apply PREF rules** without mention
4. **Apply SOFT rules** and add a brief footnote if relevant
5. **For HARD violations**, interrupt and explain before proceeding

This means the DNA is always active once scanned — not just when commands
are explicitly called.

---

## Monorepo / Multi-Service Support

For projects with multiple services (detected by presence of `services/`,
`packages/`, `apps/` directories, or workspace config in `package.json` /
`pnpm-workspace.yaml`):

**DNA hierarchy:**
```
.claude/
  dna/
    root.md          ← shared rules (import style, naming, error base class)
    aegis.md         ← service-specific overrides
    pmai.md          ← service-specific overrides
    morpheus.md      ← service-specific overrides
```

**Resolution order:** Service DNA > Root DNA. If `aegis.md` says
"use JOSE for JWT" but `root.md` says "use jsonwebtoken", Aegis wins
for code inside `services/aegis/`.

**Cross-service comparison:** After completing per-service scans, generate `.claude/dna/cross-service.md` by:
1. Loading all per-service DNA files
2. Comparing each rule by ID across services — identify rules that are identical (consistent), intentionally divergent (different languages/frameworks), or unexpectedly inconsistent (same language, different approach = drift)
3. Writing the result to `.claude/dna/cross-service.md` using the format defined in `references/monorepo-hierarchy.md §Cross-Service Report`

`/dna-report` in a monorepo includes a "Cross-Service Consistency" section drawn from `cross-service.md`.

---

## DNA Staleness Detection

The DNA profile includes a scan fingerprint:

```markdown
## Scan Metadata
- Last scan: 2026-05-28
- Git hash at scan: a1b2c3d
- Files sampled: 22
```

On every invocation, check:
1. Is `dna.md` older than 30 days? → Suggest re-scan
2. Has the git hash changed significantly? (if git is available, read the `Git hash at scan:` field from the DNA file's `## Scan Metadata` section, then run `git diff --stat {that_hash}..HEAD` — if >20 files changed, suggest re-scan)
3. Are there new directories/services not covered? → Suggest incremental scan

Never silently use stale DNA. Flag it.

---

## What this skill does NOT do

- **It does not enforce linting rules.** ESLint/Prettier handle syntax-level
  formatting. DNA covers architectural and design-level conventions.
- **It does not replace code review.** It augments it by catching convention
  drift before review.
- **It does not judge code quality.** A project that uses callbacks everywhere
  is not "bad" — it's the project's DNA. The Guardian preserves it.
- **It does not run external tools.** Zombie dependency detection is based on
  import scanning, not `depcheck`. Results are flagged as "suspected" and the
  user is directed to verify with proper tooling.

---

## Response format conventions

When reporting DNA-related findings inline (not in a command output):

**Violation detected during code generation:**
```
🧬 DNA-H3: This project wraps all HTTP calls through src/lib/api-client.ts.
I'll use that instead of raw fetch. Proceeding with DNA-compliant code.
```

**DNA-compliant code (brief, only for SOFT tier):**
```
// Following DNA-S1: kebab-case file naming
```

**PREF tier:** No comment. Just apply silently.
