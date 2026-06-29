---
name: ayanokoji-task
description: "Initialize a clean TASK.md template for a new task from the description in arguments. One-shot report."
homepage: https://github.com/sahnik/ayanokoji.md
license: MIT
---

# Ayanokoji Task — Initialize Clean Task Template

You have been invoked as `ayanokoji-task`. Use the provided task description to generate or completely overwrite TASK.md. One shot — do NOT modify any other files.

## Template to Deploy

```markdown
# TASK.md — Current Task

## Task Name
[Specific name of the task]

## What This Task Requires
[Concrete breakdown of requirements — no vague verbs like improve or fix without specifics]

## Files In Scope
- [Explicit list of every file to modify]

## Files Out Of Scope
- [Explicit list of protected/out-of-scope files from AGENTS.md]

## Acceptance Criteria
[Verifiable, runnable command or condition producing a binary pass/fail]

## Approach
1. [Concrete pre-computed step 1]
2. [Concrete pre-computed step 2]

## Known Risks
- [Risk 1] → fallback: [Specific fallback if X fails]
```

Show the generated `TASK.md` content to the user, then stop.
