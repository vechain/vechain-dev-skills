# VeChain AI — Repo Development Guidelines

## Repository Structure

This is an Nx monorepo containing AI plugins, agents, and tools for VeChain development.

```
packages/plugins/vechain-dev/   # Main VeChain dev skill (Claude plugin)
scripts/                        # Build and install scripts
evals/                          # Promptfoo evaluation suites
docs/                           # VitePress documentation
```

## Working with the Monorepo

- Run `npm install` from the repo root (workspaces handle sub-packages)
- Use Nx to run per-project targets: `npx nx run vechain-dev:<target>`
- Available targets: `lint-markdown`, `validate`

## Plugin / Skill Conventions

Each plugin lives under `packages/plugins/<name>/` and contains:
- `package.json` + `project.json` (Nx project config)
- `skills/` directory with one subdirectory per skill
- Each skill has a `SKILL.md` (with YAML frontmatter) and optional `references/` directory

### SKILL.md Frontmatter

```yaml
---
name: skill-name
description: Short description
allowed-tools: []
model: sonnet
license: MIT
metadata:
  author: VeChain
  version: "0.1.0"
---
```

### Adding a New Skill

1. Create `packages/plugins/<plugin>/skills/<skill-name>/SKILL.md`
2. Add frontmatter with required fields
3. Optionally add `references/` directory for supplementary files
4. Run `npx nx run <plugin>:validate` to verify structure

## Code Style

- Markdown: follow `.markdownlint-cli2.jsonc` rules
- TypeScript (scripts/evals): follow `eslint.config.mjs` + `.prettierrc.json`
- Commit messages: imperative mood, short first line

## Testing Changes

```bash
npx nx run vechain-dev:validate    # Validate plugin structure
npm run lint-markdown               # Lint all markdown
scripts/install-local.sh            # Test local skill installation
```
