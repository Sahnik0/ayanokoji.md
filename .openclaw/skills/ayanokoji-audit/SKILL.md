---
name: ayanokoji-audit
description: "Audit all four scaffold files for protocol drift, structural violations, and staleness. One-shot health report."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Audit — Scaffold File Health Check

You have been invoked as `ayanokoji-audit`. Read all four scaffold files and
produce a health report. One shot — do NOT modify any file.

## AGENTS.md

- **Line count**: Does it exceed 60 lines? (Hard cap. If yes: flag immediately.)
- **Hard Constraints**: Are they written as imperatives ("Never modify X",
  "Always use Y")? Flag any that are vague ("be careful with Z").
- **Code Style Rules**: Present and specific, or missing?
- **File Update Protocol**: Matches the standard four-file protocol?
- **Off-Limits**: Explicit list, or empty?
- **Session Start Protocol**: Lists all 6 steps including loading
  `skills/ayanokoji/SKILL.md`?

## CONTEXT.md

- **Architecture vs index**: Is it describing architecture (purpose, interfaces,
  danger zones)? Flag if it is a file tree or directory listing.
- **Tech Stack**: One line per layer, no gaps?
- **Core Modules**: Each has purpose, depends-on, and danger zones?
- **Off-Limits Zones**: Cross-referenced with AGENTS.md?

## TASK.md

- **Single task**: Does it describe exactly one bounded task? Flag if it
  contains multiple tasks or a roadmap.
- **Acceptance Criteria**: Runnable and produces a checkable output? Flag if
  vague ("works correctly", "looks good").
- **Files In Scope**: Explicit named list?
- **Approach**: Numbered concrete steps? Flag any step with an unresolved
  decision embedded in it.

## PROGRESS.md

- **Completed Tasks table**: More than 5 full-detail entries? (Should compress
  older ones to one line each.)
- **Failed Attempts**: Does every entry have the exact error and "must never be
  repeated" clause? Flag any that just say "it didn't work."
- **Current Blockers**: Stale entries (blockers already resolved but not
  cleared)?

## Output Format

```
FILE [SECTION]: <issue>
```

End with a summary line:
- `SCAFFOLD HEALTHY` — all checks pass
- `SCAFFOLD NEEDS MAINTENANCE` — one or more issues found, list count
