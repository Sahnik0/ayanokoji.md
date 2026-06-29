---
name: ayanokoji-status
description: "Show a consolidated strategic dashboard of current task, blockers, failures, and progress. One-shot display."
homepage: https://github.com/Sahnik0/ayanokoji.md
license: MIT
---

# Ayanokoji Status — Strategic Session Dashboard

You have been invoked as `ayanokoji-status`. Read `TASK.md` and `PROGRESS.md` to produce a consolidated status report. One shot — do NOT modify any files.

## What to Read and Report

1. **Active Task**:
   - Report the task name and the current approach step.

2. **Open Blockers**:
   - List all blockers from the Current Blockers section of PROGRESS.md.

3. **Recent Failures**:
   - List the most recent entries from PROGRESS.md Failed Attempts.

4. **Total Progress**:
   - Report the number of completed tasks from PROGRESS.md Completed Tasks.

## Output Format

```
AYANOKOJI STRATEGIC STATUS
──────────────────────────
Active Task:    [Task Name] (Current step: [Step #])
Open Blockers:  [None / List of blockers]
Recent Errors:  [None / List of recent errors]
Total Progress: [N] tasks completed
```
