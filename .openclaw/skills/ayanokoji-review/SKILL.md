---
name: ayanokoji-review
description: "Inspect the current TASK.md for strategic completeness before execution begins. One-shot report."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Review — Task Plan Inspection

You have been invoked as `ayanokoji-review`. Read TASK.md and produce a
strategic completeness check. One shot — do NOT modify files or begin execution.

## Check Each Section

**Task Name**
- Is it one line? Is it specific enough to be unambiguous?

**What This Task Requires**
- Is the description concrete? Flag any use of vague words: "improve", "fix",
  "update", "handle" without specifying exactly what.

**Files In Scope**
- Is this an explicit list? Flag if it says "related files" or "as needed."
  Every file must be named.

**Files Out Of Scope**
- Is there an explicit list cross-referenced against AGENTS.md Off-Limits?
  Flag if this section is empty when an AGENTS.md Off-Limits exists.

**Acceptance Criteria**
- Is it runnable? Can you literally execute the check and get a pass/fail?
- Flag any of these non-acceptable forms:
  - "The feature works"
  - "The code looks good"
  - "Should be fine now"
  - Any subjective or unmeasurable condition

**Approach**
- Are the steps numbered and concrete?
- Does any step contain an unresolved decision ("figure out how to...",
  "determine the best approach")? Flag it — that decision must be made before
  execution begins, not during.

**Known Risks**
- Does every risk have a fallback ("if X fails, do Y")?
- Flag any risk listed without a paired fallback.

## Output Format

One line per issue found:

```
ISSUE [SECTION]: <what is missing or unclear>
```

Then conclude with exactly one of:
- `READY TO EXECUTE` — all checks pass, no blocking issues
- `NEEDS CLARIFICATION` — one or more blocking issues found
