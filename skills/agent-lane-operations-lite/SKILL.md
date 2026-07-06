---
name: agent-lane-operations-lite
description: Lightweight lane discipline for running multiple AI agents in parallel without ownership conflicts or false done claims.
---

# Agent Lane Operations Lite

Use this skill when work can be split across independent agents.

## Lane Contract

Every lane gets:

- Clear ownership: files, routes, docs, or read-only scope.
- A status badge requirement.
- A no-revert rule for other people's work.
- A final report with changed paths, proof, blockers, and gaps.

## When To Parallelize

Parallelize when tasks are independent:

- Read-only audits.
- Separate docs sections.
- Separate feature flags.
- Separate test/proof lanes.

Do not parallelize when lanes would write the same files, share a migration, depend on one unknown result, or require one irreversible approval.

## Prompt Template

```md
Lead your returned report with a Status Badge (🟢 DONE / 🟡 WORKING / 🔴 BLOCKED / ⚪ FYI).
Work in <repo path>.
You are not alone in the codebase; do not revert or rewrite edits by others.
Ownership: only <paths>.
Task: <specific outcome>.
No public publish. No external calls unless explicitly approved.
Final report: paths changed, proof run, remaining gaps.
```

## Synthesis

After lanes report back:

1. Read every lane report.
2. Resolve conflicts before merging claims.
3. Roll up one badge.
4. Separate "implemented", "verified", and "still missing".

