# Status Badge Protocol

Every substantive agent report starts with exactly one status badge on its own line.

## Badges

- 🟢 **DONE**: Whole assigned goal is complete and verified. Nothing left for that lane.
- 🟡 **WORKING `[n/total]`**: Lane is in progress and continuing. Not a stop point.
- 🔴 **BLOCKED**: Lane cannot continue without a credential, irreversible approval, external state change, or decision only the owner can make.
- ⚪ **FYI**: Informational note. No active task is being completed.

## Rules

1. Badge first, before summary.
2. Use one badge, not a stack.
3. Do not mark 🟢 until verification matches the claim.
4. If verification is incomplete, use 🟡 or 🔴 and say exactly what proof is missing.
5. For parallel work, synthesize one rollup badge after reading all lane reports.

## Report Shape

```md
🟡 **WORKING [2/4]**

Completed:
- Reproduced bug with input X.
- Added failing test.

Current:
- Implementing minimal fix in owned files.

Next:
- Run targeted test, then full local gate.
```

## Why It Exists

Agent output often sounds complete before it is complete. Status badges make the boundary explicit: reading, coding, locally verified, production proved, blocked, or done.

