# Intervention Protocol

How the Guardian interrupts (or doesn't) based on severity.

## Decision Tree

```
Is there a .claude/dna.md (or .claude/dna/ directory)?
  No  → No intervention. Suggest running /dna-scan if the project looks mature.
  Yes → Load DNA before generating code.
        ↓
Does the planned code violate any rule?
  No  → Generate code normally. No DNA mentions.
  Yes → Check severity tier:
        ↓
🔴 HARD → STOP. Do not generate violating code.
          Show: "🧬 DNA-{ID}: {rule description}. {why this matters}.
                 I'll write a DNA-compliant version instead."
          If user insists → write it with an inline warning comment (`// DNA-{ID} override: [user's reason]`) AND append a Manual Override entry to `.claude/dna-history.md` (see `references/evolution-tracking.md §Team Decision Logging` for the exact format).
          ↓
🟡 SOFT → Generate DNA-compliant code.
          Add footnote: "Following DNA-{ID}: {brief explanation}"
          Only if the convention is non-obvious from the code itself.
          ↓
🟢 PREF → Silently apply. No mention whatsoever.
          The code just happens to follow the team's preference.
```

## Examples

### HARD Intervention (stops generation)

User: "Write a function in the controller that queries the database directly"

```
🧬 DNA-A2 (HARD): This project uses the Repository pattern — controllers
call services, services call repositories, repositories talk to the DB.
Direct DB access in a controller would break the architectural layering.

I'll create a repository method and wire it through the service layer.
Proceeding with DNA-compliant code.
```

Then generate the full stack: repository method → service method → controller call.

### SOFT Intervention (footnote)

User: "Create a new file for the payment service"

Generate the file as `payment-service.ts` (not `paymentService.ts`), then:

```
Note: Named as `payment-service.ts` following DNA-N1 (kebab-case file naming).
```

### PREF Application (silent)

User: "Format this date"

Use `dayjs` (not `moment`) because DNA-D2 says so. Don't mention it.

### Override Handling

If the user explicitly says "I know, but I want to do it this way":

```
Understood. Proceeding with your approach. I've added a comment noting the
DNA override so future reviewers have context:

// DNA-A2 override: Direct DB access here is intentional because [user's reason]
```

## What NOT to Intervene On

- Code that's clearly experimental/throwaway ("just prototype this quickly")
- Code in test files that intentionally tests error paths
- Code in migration scripts that has its own conventions
- Code the user is reading/reviewing (don't lecture about others' code unless asked)
- Comments, documentation, README content

## Staleness Warning

If DNA is older than 30 days or the git hash has diverged significantly:

```
⏰ DNA profile was last scanned 45 days ago (git: 127 files changed since scan).
Rules may be outdated. Consider running /dna-scan to refresh.
Proceeding with current DNA for now.
```

This is informational, not blocking. Stale DNA is better than no DNA.
