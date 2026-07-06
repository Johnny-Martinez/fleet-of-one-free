# Fleet of One — free tools for AI coding agents

Your coding agent says "done." Half the time it isn't — tests that never ran, work quietly undone after compaction. These are the free, MIT-licensed tools that make "done" earn itself.

## ⭐ verify-done — the hook that won't let your agent lie about "done"

When your agent claims "done" or "tests pass," a **Stop hook re-runs your verify command for real.** If it fails, it *blocks the stop* and hands the failure back — so a false "done" can't end the turn. It only acts on real completion claims, and it **fails open** (a hook bug can never wedge your session). Then `fleet-caught` shows you what it caught:

```
6 false "done" claim(s) caught  ·  22 genuinely verified
```

Install it (the plugin ships the hook automatically) and see [`hooks/`](hooks/) for config:

```
/plugin marketplace add Johnny-Martinez/fleet-of-one-free
/plugin install fleet-of-one-free@fleet-of-one
```

## Three installable skills

- `proof-of-production-lite`: prove real-world behavior before calling work done.
- `bug-first-tdd`: reproduce, test, fix, verify.
- `agent-lane-operations-lite`: run multiple agents without losing ownership or status.

## Companion MCP server

Prefer a tool your agent calls explicitly? [fleet-of-one-mcp](https://github.com/Johnny-Martinez/fleet-of-one-mcp) exposes the same discipline as `verify_done` / `check_repro`.

## Install

### As a Claude Code plugin (one command)

```
/plugin marketplace add Johnny-Martinez/fleet-of-one-free
/plugin install fleet-of-one-free@fleet-of-one
```

### Manually (any agent runtime)

Copy the skills into the skill directory used by your agent runtime.

Claude Code:

```zsh
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```

Other agent runtimes (Codex, etc.): copy the same folders into that runtime's local skills directory.

## What You Get

- A status badge protocol that makes agent progress legible.
- A proof habit for production-facing changes.
- A bug-fix loop that starts with reproduction instead of guesswork.
- A lane discipline for parallel agent sessions.

## What This Is Not

- Not a revenue promise.
- Not legal, tax, security, or financial advice.
- Not a replacement for product judgment, customer research, or engineering review.
- Not the full paid Fleet of One pack.

## Upgrade Path

The paid pack adds the full 95-page playbook, install templates, deeper skills, proof runbooks, memory architecture, ADR templates, and launch/release guardrails. One-time, no subscription. 7-day refund.

→ https://fleetofone.dev/?utm_source=github&utm_medium=referral&utm_campaign=fo-organic-launch&utm_content=freerepo-readme-cta

Not a course. Not a boilerplate. The failure chapters are half the book.

Version: `2026.07-free-source`

