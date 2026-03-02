# VeChain AI

AI plugins, agents, and tools for VeChain development.

## Install

### Claude Code (plugin marketplace)

```bash
# Register the marketplace
/plugin marketplace add vechain/vechain-dev-skill

# Install the VeChain dev plugin
/plugin install vechain-dev
```

### Any AI coding agent (skills CLI)

Works with Claude Code, Cursor, Codex, Windsurf, and [40+ other agents](https://skills.sh):

```bash
npx skills add https://github.com/vechain/vechain-dev-skill
```

### Manual / local

```bash
git clone https://github.com/vechain/vechain-dev-skill
cd vechain-dev-skill
npm install
./scripts/install-local.sh
```

## What's Included

### vechain-dev plugin

Six skills covering the full VeChain development stack:

| Skill | Description |
|-------|-------------|
| **dapp-development** | Frontend dApps with VeChain Kit or dapp-kit, React Query patterns, Turborepo conventions, SDK migration |
| **smart-contracts** | Solidity + Hardhat on VeChainThor, gas optimization, ABI codegen with TypeChain |
| **transaction-patterns** | Fee delegation (VIP-191), multi-clause transactions, delegation services |
| **testing** | Hardhat testing with Thor Solo local node, CI configuration |
| **security** | Smart contract vulnerability review, security checklists |
| **defi-ecosystem** | VeBetterDAO (X2Earn / B3TR), StarGate staking, governance (VeVote / VOT3) |

### Default Stack

| Layer | Default | Alternative |
|-------|---------|-------------|
| Frontend | `@vechain/vechain-kit` | `@vechain/dapp-kit-react` (lightweight) |
| SDK | `@vechain/sdk-core` + `sdk-network` | `@vechain/sdk-ethers-adapter` |
| Contracts | Solidity + Hardhat | -- |
| EVM target | `paris` (mandatory) | -- |
| Testing | Hardhat + Thor Solo | -- |
| Social Login | Privy (via VeChain Kit) | DIY with dapp-kit + Privy |

## Repo Structure

```text
.claude-plugin/
  marketplace.json                          # Plugin marketplace catalog
packages/plugins/vechain-dev/
  .claude-plugin/
    plugin.json                             # Plugin manifest (name, version, skills)
  skills/
    dapp-development/                       # SKILL.md + references/
    smart-contracts/                        # SKILL.md + references/
    transaction-patterns/                   # SKILL.md + references/
    testing/                                # SKILL.md (single-file)
    security/                               # SKILL.md (single-file)
    defi-ecosystem/                         # SKILL.md + references/
scripts/                                    # Validation and install scripts
evals/                                      # Promptfoo evaluation suites
docs/                                       # Documentation
```

## Example Prompts

```text
"Help me set up a Next.js app with VeChain Kit and social login"
"Create a Solidity ERC-20 token contract for VeChain"
"How do I use multi-clause transactions to batch operations?"
"Set up fee delegation so users don't pay gas"
"Write Hardhat tests for my token transfer contract"
"Should I use VeChain Kit or dapp-kit for my project?"
"Review this contract for security issues"
"Build an X2Earn app that rewards users with B3TR for recycling"
"How does StarGate staking work?"
"Create a governance proposal on VeBetterDAO"
```

## Contributing

We welcome contributions! This section explains how to add skills, create new plugins, and the overall architecture.

### Quick Start

```bash
git clone https://github.com/vechain/vechain-dev-skill
cd vechain-dev-skill
npm install
npx nx run vechain-dev:validate       # Validate plugin structure
npx nx run vechain-dev:lint-markdown   # Lint markdown files
```

### How It Works: Distribution Channels

This repo supports three ways users can install plugins:

| Channel | Command | What it does |
|---------|---------|-------------|
| **Plugin marketplace** | `/plugin marketplace add vechain/vechain-dev-skill` | Claude Code reads `.claude-plugin/marketplace.json`, then `/plugin install <name>` installs individual plugins |
| **Skills CLI** | `npx skills add https://github.com/vechain/vechain-dev-skill` | Agent-agnostic CLI finds `SKILL.md` files and installs them into any supported coding agent |
| **Local install** | `./scripts/install-local.sh` | Copies skills to `~/.claude/skills/` for development and testing |

The **marketplace** path requires two metadata files:

- **`.claude-plugin/marketplace.json`** (repo root) — lists all plugins in the repo
- **`.claude-plugin/plugin.json`** (per plugin) — declares the plugin's skills, version, and metadata

### Adding a New Skill to an Existing Plugin

1. Create the skill directory:

    ```bash
    mkdir -p packages/plugins/vechain-dev/skills/my-new-skill
    ```

2. Create `SKILL.md` with frontmatter:

    ```markdown
    ---
    name: my-new-skill
    description: Short description of what this skill covers
    allowed-tools: []
    model: sonnet
    license: MIT
    metadata:
      author: VeChain
      version: "0.1.0"
    ---

    # My New Skill

    Content here...
    ```

3. (Optional) Add reference files in `references/` for supplementary docs:

    ```text
    packages/plugins/vechain-dev/skills/my-new-skill/
      SKILL.md
      references/
        detailed-topic.md
        another-topic.md
    ```

4. Register the skill in `packages/plugins/vechain-dev/.claude-plugin/plugin.json`:

    ```json
    "skills": [
      "./skills/dapp-development",
      "./skills/my-new-skill"
    ]
    ```

5. Validate:

    ```bash
    npx nx run vechain-dev:validate
    npx nx run vechain-dev:lint-markdown
    ```

### Adding a New Plugin

Plugins are independent packages under `packages/plugins/`. To add a new one:

1. Create the plugin directory:

    ```bash
    mkdir -p packages/plugins/my-plugin/{skills,.claude-plugin}
    ```

2. Add required files:

    ```text
    packages/plugins/my-plugin/
      .claude-plugin/
        plugin.json          # name, version, description, skills array
      package.json           # @vechain-ai/my-plugin, private: true
      project.json           # Nx project config
      skills/
        some-skill/
          SKILL.md
    ```

3. Register in the root marketplace (`.claude-plugin/marketplace.json`):

    ```json
    "plugins": [
      { "name": "vechain-dev", "source": "./packages/plugins/vechain-dev", "description": "..." },
      { "name": "my-plugin", "source": "./packages/plugins/my-plugin", "description": "..." }
    ]
    ```

4. Users can then install it individually:

    ```bash
    /plugin install my-plugin
    ```

### Key Files Reference

| File | Purpose |
|------|---------|
| `.claude-plugin/marketplace.json` | Root catalog — lists all installable plugins |
| `packages/plugins/*/​.claude-plugin/plugin.json` | Per-plugin manifest — name, version, skills list |
| `packages/plugins/*/skills/*/SKILL.md` | Skill content with YAML frontmatter |
| `packages/plugins/*/skills/*/references/*.md` | Supplementary reference docs loaded on demand |
| `scripts/validate-plugin.cjs` | Validates structure, frontmatter, and plugin.json consistency |
| `scripts/install-local.sh` | Local install for development/testing |
| `.markdownlint-cli2.jsonc` | Markdown linting rules |

### SKILL.md Conventions

- **Frontmatter** must include: `name`, `description`, `license`
- **`name`** must match the directory name (e.g., `name: testing` in `skills/testing/SKILL.md`)
- **Single-file skills** (like `testing`, `security`) inline all content in SKILL.md
- **Multi-file skills** use `references/` for supplementary docs and a progressive disclosure table in SKILL.md
- Cross-references between skills use relative paths (e.g., `../../transaction-patterns/references/fee-delegation.md`)

### PR Checklist

- [ ] `npx nx run vechain-dev:validate` passes
- [ ] `npx nx run vechain-dev:lint-markdown` passes
- [ ] New skills are registered in the plugin's `plugin.json`
- [ ] New plugins are registered in the root `marketplace.json`
- [ ] Cross-references between files use correct relative paths

## Content Sources

- [VeChain Documentation](https://docs.vechain.org/)
- [VeChain Kit Documentation](https://docs.vechainkit.vechain.org/)
- [VeChain SDK](https://github.com/vechain/vechain-sdk-js)
- [VeBetterDAO Documentation](https://docs.vebetterdao.org/)
- [StarGate Documentation](https://docs.stargate.vechain.org/)

## License

MIT License — see [LICENSE](LICENSE) for details.
