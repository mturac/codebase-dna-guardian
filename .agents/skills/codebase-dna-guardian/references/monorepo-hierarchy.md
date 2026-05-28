# Monorepo DNA Hierarchy

This reference describes how DNA profiles work in multi-service projects.

## Detection

A project is treated as a monorepo when any of these are true:
- `pnpm-workspace.yaml` exists
- `package.json` has a `workspaces` field
- `lerna.json` exists
- `nx.json` exists
- `turbo.json` exists
- A `services/`, `packages/`, or `apps/` directory contains 2+ subdirectories
  each with their own `package.json`, `go.mod`, `Cargo.toml`, or `pyproject.toml`

## File Structure

```
.claude/
  dna/
    root.md              ← conventions shared across ALL services
    {service-a}.md       ← overrides for service-a
    {service-b}.md       ← overrides for service-b
    cross-service.md     ← auto-generated comparison of divergences
```

## Resolution Order

When checking code in `services/aegis/src/auth.ts`:

1. Load `.claude/dna/root.md` — base rules
2. Load `.claude/dna/aegis.md` — override matching rules by ID
3. If a rule exists in both, service-level wins
4. If a rule exists only in root, it applies everywhere

## Root DNA vs Service DNA

**Root DNA includes:**
- File naming convention (if consistent across services)
- Git commit message format
- Shared error base class
- CI/CD patterns
- Documentation standards
- Shared dependency choices (if all services use the same)

**Service DNA includes:**
- Framework-specific patterns (Fastify in Aegis, FastAPI in PMAI)
- Service-specific data access patterns
- Auth patterns (only relevant in auth service)
- Test configurations specific to that service's framework
- Dependencies unique to the service

## Cross-Service Report

The `/dna-report` command in a monorepo produces an additional section:

```
Cross-Service Consistency:

✅ Consistent across all services:
  - File naming: kebab-case (N1)
  - Error base class: AppError (E1)
  - Logging: pino (E2)

⚠️ Intentional divergence:
  - Data access: Aegis uses Prisma, PMAI uses SQLAlchemy (different languages)
  - Test framework: Vitest (TS services), Pytest (Python services)

🔴 Unintentional drift:
  - Aegis uses path aliases (@/), Morpheus uses relative imports
  - Aegis has barrel files, PMAI does not
```

The distinction between intentional divergence and unintentional drift is
determined by whether the divergence correlates with a language/framework
boundary (intentional) or exists within the same language/framework
(unintentional — likely drift).

## Scanning Strategy

For monorepos, `/dna-scan` works in waves:

1. **Wave 1: Root scan** — config files, shared utilities, CI config
2. **Wave 2: Per-service scan** — one vertical slice per service
3. **Wave 3: Cross-comparison** — diff extracted patterns across services
4. **Wave 4: Classification** — mark divergences as intentional or drift

Each wave produces its own file. The user can re-scan a single service
without re-scanning the whole monorepo.
