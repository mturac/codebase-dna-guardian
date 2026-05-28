# Contributing to Codebase DNA Guardian

Thanks for your interest in contributing! This project is a Claude Code skill — contributions to the skill instructions, templates, reference docs, and the visual dashboard are all welcome.

## What you can contribute

- **New scanning strategies** — better ways to sample large codebases
- **Language/framework coverage** — Ruby, Rust, Java, Swift, Dart patterns
- **Template improvements** — better DNA template structure
- **Dashboard features** — new visualisations, dark/light mode, export
- **Bug fixes** — incorrect instructions, edge cases, shell command bugs

## Project structure

```
SKILL.md               ← Main skill entry point (the AI's instructions)
references/
  scanning-strategy.md ← How to sample files without blowing context
  intervention-protocol.md ← HARD/SOFT/PREF intervention logic
  evolution-tracking.md    ← DNA history and rule lifecycle
  monorepo-hierarchy.md    ← Multi-service DNA support
templates/
  dna-template.md      ← Output format for generated DNA profiles
scripts/
  dna-guardian-dashboard.jsx ← React visual report component
  package.json
  vite.config.js
```

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Open a PR against `main` with a description of what changed and why

## Skill instruction changes

When modifying `SKILL.md` or reference docs:

- Changes to AI behavior must be testable — describe a scenario where the old behavior was wrong and the new behavior is correct
- Do not add ambiguity — if a rule conflicts with another, resolve it explicitly
- Shell commands must be tested on both macOS (BSD tools) and Linux (GNU tools)
- Every new command needs an entry in `marketplace.json` under `skill.commands`

## Dashboard changes

The dashboard (`scripts/dna-guardian-dashboard.jsx`) is a self-contained React component. To develop:

```bash
cd scripts
npm install
npm run dev
```

The component accepts `DNA_DATA` at the top of the file as its data source. When contributing new visualisations, keep them driven by the existing `DNA_DATA` schema — don't add fields that the skill can't populate.

## Reporting issues

Open a GitHub issue with:
- What you expected the skill to do
- What it actually did
- The project type (language, framework, monorepo/single)
- Relevant parts of your `.claude/dna.md` (remove any sensitive paths/names)

## Code of conduct

Be kind. This is a tool to help developers — let's keep the contribution process that way too.
