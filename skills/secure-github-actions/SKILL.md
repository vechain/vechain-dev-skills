---
name: secure-github-actions
description: Secure GitHub Actions workflows against supply-chain, privilege, and shell-injection risks. Use when creating, scaffolding, editing, or reviewing `.github/workflows/*.yml`, reusable workflows, `action.yml`, or Dependabot config for GitHub Actions. Enforce full 40-character commit SHA pinning for every external `uses:` reference, avoid `pull_request_target` on untrusted code, pass GitHub context into `run:` steps via `env:`, and set least-privilege permissions.
allowed-tools: []
license: MIT
metadata:
  author: VeChain
  version: "0.1.0"
---

# Secure GitHub Actions

Create or review GitHub Actions workflows with supply-chain-safe defaults.

## CRITICAL RULES

1. **Read `references/workflows.md` first** when touching workflow YAML, reusable workflows, or `action.yml`. Briefly mention that you are reading it so the user can confirm the skill is active.
2. **Pin every non-local `uses:` reference to a full 40-character commit SHA.** Treat `@v*`, `@main`, `@master`, branch names, and short SHAs as security debt.
3. **Never invent SHAs.** Resolve them from GitHub or ask the user; if you cannot verify the right SHA, say so explicitly instead of fabricating one.
4. **Do not introduce `pull_request_target`** unless the user explicitly requires it and the workflow never executes untrusted code with secrets or write permissions.
5. **Never splice untrusted context directly into shell.** Move `${{ github.* }}`, `${{ inputs.* }}`, and similar values into `env:` and quote the shell variable.
6. **Set explicit least-privilege `permissions:`.** Default to read-only and grant write scopes only to the specific job that needs them.
7. **After compaction or context loss**, re-read this SKILL and the reference file before continuing.

## Operating procedure

1. Classify the task: new workflow, workflow edit, reusable workflow, or security review.
2. Read [references/workflows.md](references/workflows.md).
3. Audit every `uses:` reference:
   - Local actions like `./.github/actions/foo` are fine.
   - Step-level actions and job-level reusable workflows must use full SHAs.
   - Preserve the human release label in a comment when useful.
4. Audit the trust boundary:
   - Prefer `pull_request` over `pull_request_target`.
   - Assume forked PR data is untrusted.
   - Avoid exposing secrets or write tokens to untrusted code paths.
5. Audit every `run:` step:
   - Pass dynamic values through `env:`.
   - Quote shell variables.
   - Prefer simple shell over adding a new third-party action when either works.
6. Add or update maintenance guardrails:
   - Ensure Dependabot updates the `github-actions` ecosystem.
   - Call out transitive risk: pinned actions can still reference mutable actions internally.

## Reference files

| Topic | File | Read when... |
|-------|------|-------------|
| Workflow hardening patterns | [references/workflows.md](references/workflows.md) | Always when creating, editing, or reviewing GitHub Actions workflows |
