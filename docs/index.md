# VeChain AI

AI plugins, agents, and tools for VeChain development.

## Overview

This monorepo contains:

- **Plugins** — Claude Code skills for VeChain development (`packages/plugins/`)
- **Evals** — Promptfoo evaluation suites for testing skill quality (`evals/`)
- **Docs** — This documentation site (`docs/`)

## Getting Started

### Install the VeChain Dev Plugin

```bash
npx skills add https://github.com/vechain/vechain-ai
```

### Local Development

```bash
git clone https://github.com/vechain/vechain-ai
cd vechain-ai
npm install
npx nx run vechain-dev:validate
```

## Skill

The `vechain-dev` plugin provides a single comprehensive skill with 15 reference files covering:

- Frontend dApps, VeChain Kit, dapp-kit, React Query
- Solidity + Hardhat, gas optimization, ABI codegen
- Fee delegation, multi-clause transactions
- Testing with Hardhat + Thor Solo
- Smart contract security review
- VeBetterDAO, StarGate, governance
