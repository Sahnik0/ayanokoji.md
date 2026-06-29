---
name: ayanokoji-gate
description: >
  Run the verification gate checks for the current task and update scaffold files based on the result.
  Use when the user wants to check completion, run gate, verify task, "ayanokoji-gate", or "/ayanokoji-gate".
argument-hint: ""
license: MIT
---

# Ayanokoji Gate — Verification Gate Executor

You have been invoked as `ayanokoji-gate`. Run the verification gate check on the current task's acceptance criteria and update the scaffold files accordingly. One shot — do NOT modify source code files.

## Execution Sequence

1. **Locate the Acceptance Criteria check**:
   - Read `TASK.md` and find the runnable command or check under "Acceptance Criteria".

2. **Execute the check**:
   - Run the exact command or test check. Capture the actual output (both stdout and stderr).

3. **Apply the Gate Decision**:
   - **If the check passes (exits with 0 or meets the specific criteria)**:
     - Update `PROGRESS.md` Completed Tasks by adding this task, its verification command, and the captured output.
     - Overwrite `TASK.md` with a clean/blank state to declare the task finished.
     - Report the pass and the captured output to the user.
   - **If the check fails (exits non-zero or fails criteria)**:
     - Update `PROGRESS.md` Failed Attempts by logging what was tried, the exact captured error, and a "must never be repeated" clause.
     - Instruct the user/agent that `TASK.md` Approach and Known Risks need updating.
     - Report the failure and the captured output.
