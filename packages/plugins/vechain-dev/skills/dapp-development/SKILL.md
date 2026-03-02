---
name: dapp-development
description: Frontend dApp development on VeChain. VeChain Kit for React dApps, dapp-kit for lightweight integrations, React Query patterns, transaction UX, social login, wallet connection.
allowed-tools: []
model: sonnet
license: MIT
metadata:
  author: VeChain
  version: "0.1.0"
---

# VeChain dApp Development

## Scope

Use this Skill for any VeChain frontend or dApp development task:

- Frontend dApps (React/Next.js), wallet connection, social login
- Transaction building, sending, confirmation UX
- SDK usage and legacy migration
- Reference links and ecosystem resources

## Default stack (opinionated)

| Layer | Default | Alternative |
|-------|---------|-------------|
| Frontend | `@vechain/vechain-kit` | `@vechain/dapp-kit-react` (lightweight/non-React) |
| SDK | `@vechain/sdk-core` + `@vechain/sdk-network` | `@vechain/sdk-ethers-adapter` |
| Contracts | Solidity + Hardhat + `@vechain/sdk-hardhat-plugin` | -- |
| EVM target | `paris` (mandatory) | -- |
| Testing | Hardhat + Thor Solo (`--on-demand`) | -- |
| Types | TypeChain (`@typechain/ethers-v6`) | `@vechain/vechain-contract-types` (pre-built) |

## Operating procedure

### 1. Detect project structure

- `turbo.json` present → follow Turborepo conventions (`apps/frontend`, `packages/contracts`, `packages/*`)
- Use `useThor` for Thor client access (both VeChain Kit and dapp-kit v2). `useConnex` is deprecated everywhere.
- Apply conditional patterns (Chakra UI, i18n, Zustand) only when the project uses them

### 2. Classify the task layer

UI/hooks → SDK/scripts → Smart contracts → Testing/CI → Infra

### 3. Pick building blocks

- UI (full-featured): VeChain Kit hooks + components
- UI (lightweight/non-React): dapp-kit
- Backend/scripts: `@vechain/sdk-core` + `sdk-network` directly
- Legacy Connex present: migrate or isolate behind adapter boundary

**When to ask the user:** If the project doesn't already use VeChain Kit or dapp-kit and the user hasn't specified which to use, ask before choosing. Key questions:

- Do you need social login (email, Google, passkey)? → VeChain Kit
- Do you want pre-built UI modals and hooks (WalletButton, TransactionModal, token hooks)? → VeChain Kit
- Do you want a lightweight wallet-only integration with minimal dependencies? → dapp-kit
- Non-React framework? → dapp-kit

### 4. Implement with VeChain-specific correctness

- Network: always explicit (`mainnet`/`testnet`/`solo`)
- Gas: estimate first, use fee delegation where appropriate
- Transactions: use multi-clause when batching benefits atomicity or UX
- Tokens: VET for value, VTHO for gas (dual-token model)
- Social login: Generic Delegator auto-enabled (users pay gas in VET/VTHO/B3TR); app-sponsored delegation optional for better UX; smart accounts; pre-fetch data before `sendTransaction`

### 5. Test

- Unit: Hardhat + Thor Solo
- Integration: Thor Solo with realistic state
- Wallet UX: mocked hook/provider tests

### 6. Deliver

- Files changed + diffs
- Install/build/test commands
- Risk notes for signing, fees, token transfers

## Progressive disclosure (load only when needed)

| Topic | File | Load when user mentions... |
|-------|------|---------------------------|
| Frontend patterns (shared) | [references/frontend.md](references/frontend.md) | frontend, React Query, caching, query keys, loading, skeleton, Turborepo, Chakra, i18n, state management |
| VeChain Kit | [references/frontend-vechain-kit.md](references/frontend-vechain-kit.md) | VeChain Kit, useWallet, useSendTransaction, useCallClause, WalletButton, TransactionModal, social login, Privy, smart accounts, account abstraction, theming |
| dapp-kit | [references/frontend-dappkit.md](references/frontend-dappkit.md) | dapp-kit, DAppKitProvider, lightweight wallet |
| Legacy migration | [references/sdk-migration.md](references/sdk-migration.md) | Connex, thor-devkit, migration, deprecated |
| Reference links | [references/resources.md](references/resources.md) | docs URL, npm link, GitHub repo |
