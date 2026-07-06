---
name: bug-first-tdd
description: Reproduce a bug before fixing it, encode the expected behavior in a failing test, then make the smallest safe change.
---

# Bug-First TDD

Use this skill for any bug, regression, broken workflow, failing test, or "fix this" request.

## Loop

1. Reproduce the bug with the smallest exact input or workflow.
2. Write a failing test for the correct behavior.
3. Run the test and confirm it fails for the expected reason.
4. Make the smallest code change that turns the test green.
5. Run the targeted test and the nearest surrounding suite.
6. Verify the affected workflow outside the test if users touch it.
7. Report what is fixed and what remains unverified.

## Guardrails

- Do not weaken a test to pass broken code.
- Do not fix a guessed cause before reproducing the symptom.
- Do not mix unrelated refactors into a bug fix.
- Do not call it done until the proof matches the original failure.

## Minimal Report

```md
🟢 **DONE**

Reproduced: `<command/input>` failed with `<error>`.
Test: `<test file>` now covers expected behavior.
Fix: `<short change>`.
Verified: `<targeted test>` and `<workflow proof>`.
```

