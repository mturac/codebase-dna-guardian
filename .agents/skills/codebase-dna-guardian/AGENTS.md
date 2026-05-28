# Codebase DNA Guardian — Agent Instructions

This file provides instructions for AI agents other than Claude Code (Cursor, GitHub Copilot, Windsurf, etc.).

## What this skill does

Codebase DNA Guardian extracts a project's unwritten conventions and enforces them whenever you generate new code.

It reads 15–20 representative files, extracts patterns across 8 categories (Naming, Architecture, Error Handling, Testing, Imports, Dependencies, API Contracts, Async Patterns), and writes a DNA profile to `.claude/dna.md`.

Once the profile exists, **read it before generating any new code in the project.**

## When to activate

- User asks to scan, audit, or check codebase conventions
- User says: "dna scan", "check my code style", "what patterns does this project use", "architectural consistency", "onboard me to this project", "codebase health check"
- You are about to generate new code and `.claude/dna.md` or `.claude/dna/` exists in the project

## Core commands

| Command | What to do |
|---------|-----------|
| `/dna-scan` | Follow Phase 1–5 in SKILL.md to extract and write the DNA profile |
| `/dna-check [path]` | Load DNA, read target files, report violations by severity |
| `/dna-refactor [path]` | Show plan → get confirmation → fix violations |
| `/dna-report` | Generate the health dashboard output |
| `/dna-guard [branch]` | Auto-detect base branch, three-dot diff, check changed files |
| `/dna-onboard` | Generate developer briefing from DNA profile |

## Severity tiers

| Tier | Action |
|------|--------|
| 🔴 HARD | Stop. Do not generate violating code. Explain. Ask to proceed. |
| 🟡 SOFT | Generate compliant code + add footnote. |
| 🟢 PREF | Apply silently. No mention. |

## Passive mode

If `.claude/dna.md` exists:
1. Run staleness check first (>30 days or >20 files changed since scan hash)
2. Read DNA rules
3. Apply PREF silently, SOFT with footnote, HARD with stop

## Full instructions

See [SKILL.md](SKILL.md) for complete step-by-step instructions.
