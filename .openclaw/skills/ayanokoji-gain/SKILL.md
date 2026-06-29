---
name: ayanokoji-gain
description: "Strategic progress summary: completed tasks, retry rate, verification quality, protocol adherence."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Gain — Strategic Progress Summary

You have been invoked as `ayanokoji-gain`. Read PROGRESS.md (and TASK.md for
current task status) and produce a cold strategic summary. One shot — do NOT
modify any file.

## What to Report

**Completed Tasks**

List every completed task from the Completed Tasks table:

```
✓ <Task Name> — verified by: <verification method>
```

**Retry Rate**

Count tasks that appear in both Failed Attempts and Completed Tasks (they
failed before succeeding). Report as:

```
Retry rate: <M>/<N> tasks required at least one retry.
```

A high retry rate means the approach phase is underspecified. Flag it if
retry rate exceeds 30%.

**Verification Quality**

Were tasks marked complete with actual output (command result, test output,
endpoint response), or with assertions ("it should work", "tests passed")?

Flag any completion entry that lacks concrete verification proof.

**Protocol Adherence**

Check:
- Failed attempts logged with exact errors? (yes/partial/no)
- Blockers cleared when resolved? (yes/partial/no)
- TASK.md overwritten per task (never appended to)? (cannot verify from
  PROGRESS.md alone — note as "unverifiable from log")

**Open Blockers**

List every entry in Current Blockers.

## Output Format

```
PROGRESS SUMMARY
────────────────
Completed:   <N> tasks
Retries:     <M> tasks needed retry (<retry rate>%)
Open blockers: <count>

Completed Tasks:
  ✓ ...
  ✓ ...

Verification quality: STRONG / WEAK / MIXED
Protocol adherence:   ADHERENT / DRIFT DETECTED
```

If PROGRESS.md has only the initial scaffold entry:
```
No tasks completed beyond scaffold initialization.
```
