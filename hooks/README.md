# verify-done — the hook that won't let your agent lie about "done"

When your coding agent says *"done"* or *"tests pass,"* this Stop hook **re-runs your verify command for real.** If it fails, the hook blocks the stop and hands the failure back to the agent — so a false "done" can't end the turn. Zero dependencies, and it **fails open**: any internal error just lets the agent stop, so a hook bug can never wedge your session.

It only acts when **(a)** the agent actually claimed completion and **(b)** a verify command is resolvable. Otherwise it stays silent — no nagging, no false confidence.

## Install

### Option A — as a plugin (the hook activates automatically)

```
/plugin marketplace add Johnny-Martinez/fleet-of-one-free
/plugin install fleet-of-one-free@fleet-of-one
```

Installing the plugin ships the Stop hook with it (see `hooks/hooks.json`). Nothing else to wire.

### Option B — standalone

Copy the two scripts into your project and register the hook:

```zsh
mkdir -p .claude/hooks
cp hooks/verify-done.mjs hooks/fleet-caught.mjs .claude/hooks/
```

Add to `.claude/settings.json` (or `~/.claude/settings.json`):

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [
        { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/verify-done.mjs\"" }
      ] }
    ]
  }
}
```

## Tell it how to verify (first match wins)

1. **`.fleet/verify`** — a file in your project; the first non-empty line is the command.
   ```zsh
   echo "npm test" > .fleet/verify
   ```
2. **`$FLEET_VERIFY_CMD`** — an environment variable.
3. **Auto-detected** — if `package.json` has a `scripts.test`, it runs `npm test`.

If none resolve, the hook does nothing (it won't pretend it verified something it didn't).

Optional: `FLEET_VERIFY_TIMEOUT_MS` (default `180000`) caps how long the verify command may run.

## See what it caught

```zsh
node fleet-caught.mjs            # or: node .claude/hooks/fleet-caught.mjs
```

```
  Fleet of One — verify-done
  6 false "done" claim(s) caught  ·  22 genuinely verified
```

The log lives at `.fleet/verify-log.tsv` in your project.

## The full system

This hook is the free wedge. The full operating system — playbook, 27 skills, deploy gates, memory, tool dossiers — is [Fleet of One](https://fleetofone.dev/?utm_source=github&utm_medium=referral&utm_campaign=fo-organic-launch&utm_content=freerepo-readme-cta). MIT.
