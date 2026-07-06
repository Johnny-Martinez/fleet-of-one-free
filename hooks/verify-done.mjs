#!/usr/bin/env node
/**
 * Fleet of One — verify-done Stop hook.
 *
 * When your coding agent says "done" (or "tests pass"), this hook re-runs your
 * verify command for real. If it fails, the hook BLOCKS the stop and hands the
 * failure back to the agent — so a false "done" can't end the turn.
 *
 * Zero dependencies. Fails OPEN: any internal error exits 0 and never wedges
 * your session. It only acts when (a) the agent actually claimed completion and
 * (b) a verify command is resolvable — otherwise it stays silent.
 *
 * Verify command resolution (first match wins):
 *   1. .fleet/verify           (file in cwd; first non-empty line is the command)
 *   2. $FLEET_VERIFY_CMD       (environment variable)
 *   3. package.json "scripts.test"  -> "npm test"   (auto-detected)
 * If none resolve, the hook does nothing (no false confidence).
 *
 * Register in .claude/settings.json (or ~/.claude/settings.json):
 *   { "hooks": { "Stop": [ { "hooks": [
 *     { "type": "command",
 *       "command": "node ${CLAUDE_PROJECT_DIR}/.claude/hooks/verify-done.mjs" } ] } ] } }
 */
import { readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const TIMEOUT_MS = Number(process.env.FLEET_VERIFY_TIMEOUT_MS || 180000);
const TAIL_CHARS = 1600;

// Completion-claim detection: "done", "fixed", "ready to ship", "tests pass", etc.
const CLAIM_RE =
  /\b(all\s+)?(done|complete(?:d)?|finished|fixed|implemented|all\s+set|ready\s+to\s+(?:merge|ship|deploy|go))\b|\b(tests?|test\s+suite|build|ci)\b[\s\S]{0,24}\b(pass(?:ing|ed|es)?|green|succeed(?:ed|s)?)\b/i;

function allow() {
  process.exit(0); // exit 0 with no JSON = let the agent stop
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0); // JSON is only honored on exit 0
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function lastAssistantText(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return "";
  let lines;
  try {
    lines = readFileSync(transcriptPath, "utf8").split("\n");
  } catch {
    return "";
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj && obj.role === "assistant" && Array.isArray(obj.content)) {
      const textBlock = obj.content.find((b) => b && b.type === "text" && typeof b.text === "string");
      if (textBlock) return textBlock.text;
    }
  }
  return "";
}

function resolveVerifyCommand(cwd) {
  try {
    const f = join(cwd, ".fleet", "verify");
    if (existsSync(f)) {
      const cmd = readFileSync(f, "utf8").split("\n").map((l) => l.trim()).find(Boolean);
      if (cmd) return cmd;
    }
  } catch {}
  if (process.env.FLEET_VERIFY_CMD && process.env.FLEET_VERIFY_CMD.trim()) {
    return process.env.FLEET_VERIFY_CMD.trim();
  }
  try {
    const pkgPath = join(cwd, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg && pkg.scripts && typeof pkg.scripts.test === "string" && pkg.scripts.test.trim()) {
        return "npm test";
      }
    }
  } catch {}
  return null;
}

function logEvent(cwd, verdict, exitCode, cmd) {
  try {
    const dir = join(cwd, ".fleet");
    mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString();
    appendFileSync(join(dir, "verify-log.tsv"), `${ts}\t${verdict}\texit=${exitCode}\t${cmd}\n`);
  } catch {}
}

function main() {
  const raw = readStdin();
  let input = {};
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    return allow();
  }

  // Loop guard: if a Stop hook is already active, never re-block.
  if (input.stop_hook_active === true) return allow();

  const cwd = input.cwd || process.cwd();
  const text = lastAssistantText(input.transcript_path);
  if (!text || !CLAIM_RE.test(text)) return allow(); // no completion claim — stay silent

  const cmd = resolveVerifyCommand(cwd);
  if (!cmd) return allow(); // nothing to verify against — no false confidence

  let res;
  try {
    res = spawnSync(cmd, { cwd, shell: true, timeout: TIMEOUT_MS, encoding: "utf8", env: process.env });
  } catch {
    return allow(); // fail open
  }

  const timedOut = res.error && res.error.code === "ETIMEDOUT";
  const code = typeof res.status === "number" ? res.status : timedOut ? 124 : 1;
  const passed = code === 0 && !timedOut;

  if (passed) {
    logEvent(cwd, "verified", 0, cmd);
    return allow();
  }

  logEvent(cwd, "CAUGHT", code, cmd);
  const out = ((res.stdout || "") + (res.stderr ? "\n" + res.stderr : "")).trim();
  const tail = out.length > TAIL_CHARS ? "…\n" + out.slice(out.length - TAIL_CHARS) : out;
  const why = timedOut ? `timed out after ${TIMEOUT_MS}ms` : `exited ${code}`;
  block(
    `Fleet of One: you claimed the work is done, but the verify command \`${cmd}\` ${why}. ` +
      `It is not done. Fix the failure and let the check pass before stopping.\n\n--- \`${cmd}\` output (tail) ---\n${tail}`
  );
}

try {
  main();
} catch {
  allow(); // absolute fail-open backstop
}
