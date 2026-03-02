# VeChain AI — Repo Development Guidelines

## Repository Structure

This is an Nx monorepo containing AI plugins, agents, and tools for VeChain development.

```
.claude-plugin/
  marketplace.json                # Plugin marketplace catalog (lists all plugins)
packages/plugins/vechain-dev/     # Main VeChain dev plugin
  .claude-plugin/
    plugin.json                   # Plugin manifest (name, version, skills)
  skills/                         # One directory per skill
scripts/                          # Build and install scripts
evals/                            # Promptfoo evaluation suites
docs/                             # VitePress documentation
```

## Working with the Monorepo

- Run `npm install` from the repo root (workspaces handle sub-packages)
- Use Nx to run per-project targets: `npx nx run vechain-dev:<target>`
- Available targets: `lint-markdown`, `validate`

## Distribution

Three channels — all must stay in sync:

1. **Claude Code marketplace**: `.claude-plugin/marketplace.json` (root) + `.claude-plugin/plugin.json` (per plugin)
2. **Skills CLI**: `SKILL.md` files are auto-discovered by `npx skills add`
3. **Local install**: `scripts/install-local.sh` copies skills to `~/.claude/skills/`

## Plugin / Skill Conventions

Each plugin lives under `packages/plugins/<name>/` and contains:

- `package.json` + `project.json` (Nx project config)
- `.claude-plugin/plugin.json` (plugin manifest with skills array)
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
2. Add frontmatter with required fields (`name` must match directory name)
3. Optionally add `references/` directory for supplementary files
4. Register in the plugin's `.claude-plugin/plugin.json` skills array
5. Run `npx nx run <plugin>:validate` to verify structure

### Adding a New Plugin

1. Create `packages/plugins/<name>/` with `package.json`, `project.json`, `.claude-plugin/plugin.json`, `skills/`
2. Register in root `.claude-plugin/marketplace.json`
3. Users install individually via `/plugin install <name>`

## Code Style

- Markdown: follow `.markdownlint-cli2.jsonc` rules
- TypeScript (scripts/evals): follow `eslint.config.mjs` + `.prettierrc.json`
- Commit messages: imperative mood, short first line

## Testing Changes

```bash
npx nx run vechain-dev:validate    # Validate plugin structure + plugin.json
npm run lint-markdown               # Lint all markdown
scripts/install-local.sh            # Test local skill installation
```
