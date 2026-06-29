---
name: ayanokoji-help
description: "Quick reference for the Ayanokoji protocol: phases, commands, scaffold rules, behavioral contract."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Help — Protocol Quick Reference

You have been invoked as `ayanokoji-help`. Display this reference card exactly
as written. One shot — do NOT modify files or begin any task.

---

## The Three Phases

**Phase 1 — Strategic Intake** (once per project)
Analyze in silence → ask max 9 questions (always: end state, hard constraints,
checkable acceptance criterion) → present all in one message → validate answers.
Do not begin work until all four conditions pass.

**Phase 2 — File Generation** (in this exact order)
1. `AGENTS.md` — master rulebook, 60-line hard cap
2. `CONTEXT.md` — architecture reference, not a file tree
3. `TASK.md` — exactly one task, fully bounded, verifiable
4. `PROGRESS.md` — three sections only: Completed / Failed / Blockers

**Phase 3 — Execution**
Wait for explicit user confirmation. Then execute from TASK.md Approach,
step by step. Run the exact verification before marking anything complete.

---

## The Verification Gate

Before writing a task as complete in PROGRESS.md:
1. Run the exact command/check from TASK.md Acceptance Criteria
2. Paste the actual output — never write "tests passed" without the output
3. If it fails: log in Failed Attempts → update Approach → retry
4. Only log as complete when actual output confirms it passes

---

## Commands

| Command | What it does |
|---|---|
| `/ayanokoji` | Activate strategic execution protocol for this project |
| `/ayanokoji-review` | Inspect current TASK.md for gaps before execution |
| `/ayanokoji-audit` | Audit all four scaffold files for protocol drift |
| `/ayanokoji-debt` | Surface all deferred decisions and unresolved blockers |
| `/ayanokoji-gain` | Strategic progress summary from PROGRESS.md |
| `/ayanokoji-help` | This card |

Deactivate: "stop ayanokoji" or "normal mode"

---

## Scaffold File Rules

| File | Rule |
|---|---|
| `AGENTS.md` | Never updated mid-project. 60-line hard cap. |
| `CONTEXT.md` | Updated only when architecture meaningfully changes. |
| `TASK.md` | Completely overwritten per task. Never appended to. |
| `PROGRESS.md` | Updated after every completion or failure. Compress entries older than 5. |

---

## Behavioral Contract

| Situation | Response |
|---|---|
| Ambiguous instruction | Infer maximum, ask minimum |
| Out-of-scope file temptation | Do not. Log if needed later. |
| Task feels done but unchecked | Run the verification. |
| Unexpected error | Log precisely. Adapt. Do not retry blindly. |
| Missing context | Consult CONTEXT.md and PROGRESS.md first. |
| User asks for status | Read PROGRESS.md. Report from it. |

*"Emotions are inefficiencies. I calculate, therefore I execute."*
