# Scanning Strategy

How `/dna-scan` samples files without exceeding context limits.

## The Problem

A real codebase has hundreds or thousands of files. Claude Code cannot read
them all. Reading too many files wastes context and produces noise. Reading
too few misses patterns. The scan must be surgical.

## Budget

Target: **15-20 files** for a single-service project, **8-12 files per
service** in a monorepo (plus 5-8 root-level files).

## Sampling Algorithm

### Step 1: Structural Map (zero file reads)

Use `find`, `tree`, `ls` to build a mental model:

```bash
# Directory skeleton
find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/__pycache__/*' \
  -not -path '*/vendor/*' -not -path '*/target/*' | sort | head -80

# File name patterns (names only, reveals naming convention without reading)
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" \
  -o -name "*.go" -o -name "*.rs" -o -name "*.java" \) 2>/dev/null | head -100

# Config files
ls -la *.json *.toml *.yaml *.yml .* 2>/dev/null | head -20
```

### Step 2: Config Files (3-5 reads)

Always read these if they exist:
- `package.json` (framework, dependencies, scripts)
- `tsconfig.json` / `jsconfig.json` (path aliases, strictness)
- Linter config (`.eslintrc*`, `biome.json`, `.ruff.toml`)
- Formatter config (`.prettierrc*`, `.editorconfig`)
- Framework config (`next.config.*`, `vite.config.*`, `nuxt.config.*`)

### Step 3: Entry Points (2-3 reads)

Read the main entry to understand the bootstrap pattern:
- `src/main.ts`, `src/app.ts`, `src/index.ts`, `src/server.ts`
- `cmd/main.go`, `main.py`, `src/main.rs`

### Step 4: One Vertical Slice (4-6 reads)

Pick the most "typical" feature (not the simplest, not the most complex)
and read the full stack:

```
Route/Controller → Service/UseCase → Repository/DataAccess → Model/Type → Test
```

This single slice reveals more about the project's DNA than reading 50
random files. It shows:
- How layers communicate
- What gets injected vs imported
- Error propagation pattern
- Type definition style
- Test structure and mocking approach

**How to pick the feature:** Look for a folder with the most typical
file count (not the biggest, not the smallest). Often `user/`, `auth/`,
`product/`, or `order/` — a bread-and-butter CRUD feature.

### Step 5: Error & Edge Patterns (2-3 reads)

```bash
# Find error handling patterns
grep -Erl "catch|Error|throw|Result|AppError" src/ | head -5

# Find logging patterns
grep -Erl "logger|console\.|pino|winston" src/ | head -5
```

Read 2-3 files with the densest error handling to understand the strategy.

### Step 6: Shared Utilities (2-3 reads)

Read files in utility/shared directories:
- `src/lib/`, `src/utils/`, `src/common/`, `src/shared/`
- `pkg/`, `internal/` (Go)
- `core/`, `shared/` (Python)

These reveal helper patterns, custom abstractions, and team preferences.

### Step 7: Test Files (2-3 reads)

Read tests to understand:
- Test framework configuration
- Describe/it vs test() style
- Mocking strategy (dependency injection, module mocking, test doubles)
- Setup/teardown patterns
- Snapshot usage

## Validation Pass

After extracting rules, pick 2-3 files NOT in the sample set (random
selection from the file listing) and check if extracted rules hold.

- Rule holds in all validation files → confidence HIGH
- Rule holds in most but not all → mark as SOFT with "inconsistently applied" note
- Rule contradicted in validation files → demote or discard

## What NOT to Scan

- `node_modules/`, `vendor/`, `target/`, `dist/`, `build/`
- Generated files (`.generated.ts`, `*.pb.go`, `*.g.dart`)
- Migration files (numbered SQL files — these follow their own conventions)
- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Binary files, images, fonts
- `.env` files (never read for security reasons)
