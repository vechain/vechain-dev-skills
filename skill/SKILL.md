---
name: vechain-dev
description: VeChain development playbook. VeChain Kit for React dApps, SDK for backends, Solidity+Hardhat for contracts, Thor Solo for testing. Covers fee delegation, multi-clause, social login, VeBetterDAO, StarGate, governance.
user-invocable: true
---

# VeChain Development Skill

## Scope
Use this Skill for any VeChain development task:
- Frontend dApps (React/Next.js), wallet connection, social login
- Transaction building, sending, confirmation UX
- Solidity smart contracts on VeChainThor
- Multi-clause transactions, fee delegation (VIP-191)
- Testing with Hardhat + Thor Solo
- Security reviews
- VeBetterDAO / X2Earn apps, StarGate staking, governance

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
| Frontend patterns (shared) | [frontend.md](frontend.md) | frontend, React Query, caching, query keys, loading, skeleton, Turborepo, Chakra, i18n, state management |
| VeChain Kit | [frontend-vechain-kit.md](frontend-vechain-kit.md) | VeChain Kit, useWallet, useSendTransaction, useCallClause, WalletButton, TransactionModal, social login, Privy, smart accounts, account abstraction, theming |
| dapp-kit | [frontend-dappkit.md](frontend-dappkit.md) | dapp-kit, DAppKitProvider, lightweight wallet |
| Legacy migration | [sdk-migration.md](sdk-migration.md) | Connex, thor-devkit, migration, deprecated |
| Smart contracts | [smart-contracts.md](smart-contracts.md) | Solidity, Hardhat, ERC-20, ERC-721, deploy, contract interaction, libraries, contract size, upgradeable |
| Gas optimization | [smart-contracts-optimization.md](smart-contracts-optimization.md) | gas, optimize, storage packing, assembly, unchecked |
| Testing | [testing.md](testing.md) | test, Thor Solo, Docker, CI, fixtures |
| ABI / codegen | [abi-codegen.md](abi-codegen.md) | TypeChain, ABI, typechain-types, code generation |
| Fee delegation | [fee-delegation.md](fee-delegation.md) | gasless, sponsored, VIP-191, delegator, vechain.energy |
| Multi-clause | [multi-clause-transactions.md](multi-clause-transactions.md) | batch, multi-clause, atomic, multiple operations |
| Security | [security.md](security.md) | security, audit, vulnerability, reentrancy, access control |
| VeBetterDAO | [vebetterdao.md](vebetterdao.md) | X2Earn, B3TR, sustainability, rewards, VeBetterDAO |
| StarGate staking | [stargate-staking.md](stargate-staking.md) | staking, StarGate, validator, delegation, VTHO rewards, node tier |
| Governance | [governance.md](governance.md) | VeVote, governance, voting, VOT3, proposal, steering committee |
| Reference links | [resources.md](resources.md) | docs URL, npm link, GitHub repo |
