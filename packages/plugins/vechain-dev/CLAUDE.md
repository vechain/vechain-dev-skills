# VeChain Dev Plugin

This plugin contains skills for AI-assisted VeChain development.

## Skills

| Skill | Description |
|-------|-------------|
| `dapp-development` | Frontend dApps, wallet connection, VeChain Kit, dapp-kit, React Query patterns |
| `smart-contracts` | Solidity + Hardhat on VeChainThor, gas optimization, ABI/TypeChain |
| `transaction-patterns` | Fee delegation (VIP-191), multi-clause transactions |
| `testing` | Hardhat testing with Thor Solo local node |
| `security` | Smart contract vulnerability patterns and prevention |
| `defi-ecosystem` | VeBetterDAO, StarGate staking, governance |

## Skill File Conventions

- Each skill directory contains a `SKILL.md` with YAML frontmatter
- Multi-file skills have a `references/` subdirectory for supplementary docs
- Single-file skills inline all content in `SKILL.md`
- Cross-references use relative paths from the SKILL.md location
