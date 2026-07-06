// Proof harness for verify-done.mjs — drives the hook with mock Stop-hook input.
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOK = join(HERE, "..", "verify-done.mjs");
const CAUGHT = join(HERE, "..", "fleet-caught.mjs");

let failures = 0;
const ok = (cond, label) => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
};

function project({ claim = true, verify = "false", pkgTest = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "fleet-hook-"));
  const text = claim ? "All done — the tests pass and the fix is complete." : "Here is a progress update; still investigating.";
  const transcript = join(dir, "transcript.jsonl");
  writeFileSync(
    transcript,
    [
      JSON.stringify({ role: "user", content: [{ type: "text", text: "fix the bug" }], type: "UserPromptSubmit" }),
      JSON.stringify({ role: "assistant", content: [{ type: "text", text }], type: "MessageDisplay" }),
    ].join("\n") + "\n"
  );
  if (verify !== null) {
    mkdirSync(join(dir, ".fleet"), { recursive: true });
    writeFileSync(join(dir, ".fleet", "verify"), verify + "\n");
  }
  if (pkgTest) writeFileSync(join(dir, "package.json"), JSON.stringify({ scripts: { test: "false" } }));
  return { dir, transcript };
}

function runHook({ dir, transcript }, { stopActive = false } = {}) {
  const input = JSON.stringify({
    hook_event_name: "Stop",
    transcript_path: transcript,
    cwd: dir,
    stop_hook_active: stopActive,
  });
  const r = spawnSync("node", [HOOK], { input, encoding: "utf8" });
  return { stdout: (r.stdout || "").trim(), status: r.status };
}

// Case A: claim + failing verify -> BLOCK
{
  const p = project({ claim: true, verify: "false" });
  const r = runHook(p);
  let parsed = {};
  try { parsed = JSON.parse(r.stdout || "{}"); } catch {}
  ok(parsed.decision === "block" && r.status === 0, "A: false 'done' + failing verify -> blocks with decision:block");
  ok(existsSync(join(p.dir, ".fleet", "verify-log.tsv")) && readFileSync(join(p.dir, ".fleet", "verify-log.tsv"), "utf8").includes("CAUGHT"), "A: logs a CAUGHT event");
  rmSync(p.dir, { recursive: true, force: true });
}

// Case B: claim + passing verify -> ALLOW (silent)
{
  const p = project({ claim: true, verify: "true" });
  const r = runHook(p);
  ok(r.stdout === "" && r.status === 0, "B: real 'done' + passing verify -> allows, no block");
  ok(readFileSync(join(p.dir, ".fleet", "verify-log.tsv"), "utf8").includes("verified"), "B: logs a verified event");
  rmSync(p.dir, { recursive: true, force: true });
}

// Case C: no claim + failing verify -> ALLOW (don't nag)
{
  const p = project({ claim: false, verify: "false" });
  const r = runHook(p);
  ok(r.stdout === "" && r.status === 0, "C: no completion claim -> stays silent (no nagging)");
  rmSync(p.dir, { recursive: true, force: true });
}

// Case D: stop_hook_active -> ALLOW (loop guard)
{
  const p = project({ claim: true, verify: "false" });
  const r = runHook(p, { stopActive: true });
  ok(r.stdout === "" && r.status === 0, "D: stop_hook_active=true -> never re-blocks (loop guard)");
  rmSync(p.dir, { recursive: true, force: true });
}

// Case E: claim but NO verify command resolvable -> ALLOW (no false confidence)
{
  const p = project({ claim: true, verify: null, pkgTest: false });
  const r = runHook(p);
  ok(r.stdout === "" && r.status === 0, "E: no verify command -> does nothing (no false confidence)");
  rmSync(p.dir, { recursive: true, force: true });
}

// Case F: auto-detect npm test from package.json (scripts.test:"false") + claim -> BLOCK
{
  const p = project({ claim: true, verify: null, pkgTest: true });
  const r = runHook(p);
  let parsed = {};
  try { parsed = JSON.parse(r.stdout || "{}"); } catch {}
  ok(parsed.decision === "block", "F: auto-detects npm test from package.json and catches the failure");
  rmSync(p.dir, { recursive: true, force: true });
}

// fleet-caught summarizer
{
  const p = project({ claim: true, verify: "false" });
  runHook(p);
  const r = spawnSync("node", [CAUGHT, p.dir], { encoding: "utf8" });
  ok((r.stdout || "").includes("caught"), "fleet-caught: prints a summary of what was caught");
  rmSync(p.dir, { recursive: true, force: true });
}

console.log(failures === 0 ? "\nALL HOOK TESTS PASSED" : `\n${failures} HOOK TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
