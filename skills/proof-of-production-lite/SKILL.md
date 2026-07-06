---
name: proof-of-production-lite
description: Lightweight proof gate for production-facing changes. Use when an agent is about to call work fixed, done, launched, or verified.
---

# Proof of Production Lite

Use this skill when a task affects a real user, public route, payment path, email, background job, integration, or launch workflow.

## Rule

"Done" means the affected workflow was exercised in the environment that matters.

If you cannot verify there, say:

```text
Change applied. Verification still missing: <specific proof>.
```

## Proof Checklist

1. Name the original claim or failure.
2. Identify the exact environment that matters: local, staging, production, platform dashboard, inbox, payment provider, or public URL.
3. Run a check that could fail if the change is wrong.
4. Capture the evidence: command output, URL, screenshot path, log line, row id, receipt id, or test name.
5. Report the boundary honestly.

## Good Proof

- Production HTTP response from the affected route.
- Real provider readback for a payment, email, or scheduled post.
- Database row for the affected account or job.
- Screenshot of the exact public page after deploy.
- Test that reproduces the original bug input.

## Weak Proof

- "Build passed."
- "Deploy succeeded."
- "Dashboard looked fine."
- "Another agent said it works."
- "I checked a similar happy path."

## Output Format

```md
🟢 **DONE**

Claim: checkout receipt email sends after purchase.
Proof: provider readback shows receipt `<id>` delivered to `<test-recipient>` at `<timestamp>`.
Boundary: verified in test mode only; live-mode sale still needs first-sale proof.
```

