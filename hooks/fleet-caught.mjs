#!/usr/bin/env node
/**
 * Fleet of One — show what the verify-done hook caught.
 *
 * Reads .fleet/verify-log.tsv (written by verify-done.mjs) and prints a summary:
 * how many false "done" claims got caught vs. how many were genuinely verified.
 *
 * Usage:  node fleet-caught.mjs [path-to-project]   (defaults to cwd)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || process.cwd();
const logPath = join(root, ".fleet", "verify-log.tsv");

if (!existsSync(logPath)) {
  console.log("Fleet of One: no verify log yet. The hook writes one the first time an agent claims \"done\".");
  process.exit(0);
}

const rows = readFileSync(logPath, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => {
    const [ts, verdict, exit, ...cmd] = l.split("\t");
    return { ts, verdict, exit, cmd: cmd.join("\t") };
  });

const caught = rows.filter((r) => r.verdict === "CAUGHT");
const verified = rows.filter((r) => r.verdict === "verified");

console.log(`\n  Fleet of One — verify-done`);
console.log(`  ${caught.length} false "done" claim(s) caught  ·  ${verified.length} genuinely verified\n`);

if (caught.length) {
  console.log("  Recent catches:");
  for (const r of caught.slice(-5)) {
    console.log(`    ${r.ts}  ${r.exit}  ${r.cmd}`);
  }
  console.log("");
}
