---
name: ayanokoji-debt
description: "Surface all deferred decisions and unresolved blockers across the scaffold files. Prioritized debt ledger."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Debt — Deferred Decision Ledger

You have been invoked as `ayanokoji-debt`. Scan all four scaffold files and
report every deferred item. One shot — do NOT modify any file.

## What to Scan For

**In AGENTS.md**
- Constraints written as `[TODO]`, `[TBD]`, or `[TO BE DEFINED]`
- Code style rules left as "infer from existing code" when existing code
  has conflicting patterns (a genuine ambiguity, not a deliberate choice)

**In CONTEXT.md**
- Any `[TO BE DEFINED]` in tech stack entries (means intake was incomplete)
- Modules with empty or missing danger zones
- Off-limits zones not yet documented

**In TASK.md**
- `[TO BE DEFINED]` anywhere
- Approach steps that contain an unresolved decision inside them:
  phrases like "figure out", "determine the best way", "decide whether"
- Known Risks listed without a fallback
- Acceptance Criteria that cannot currently be run (dependency not yet met)

**In PROGRESS.md**
- Current Blockers that have not been cleared despite the work appearing done
- Failed Attempts with no "must never be repeated" clause (debt on the debt log)

## Output Format

One row per deferred item:

```
FILE › SECTION: <deferred item> — needs: <what must happen to resolve it>
```

Mark blocking items with `[BLOCKS NEXT TASK]`.

End with:
```
Total: <N> deferred items, <M> blocking.
```

If nothing is found:
```
No deferred decisions. Scaffold is fully resolved.
```
