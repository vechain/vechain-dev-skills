---
name: vechain-dev
description: End-to-end VeChain development playbook (Feb 2026). Prefer @vechain/vechain-kit for React/Next.js dApps -- it provides wallet connection, social login, transaction hooks, pre-built UI components, token management, and smart accounts out of the box. For lightweight wallet-only integrations or non-React frameworks, use @vechain/dapp-kit-react. Prefer @vechain/sdk-core + @vechain/sdk-network for all backend/script/transaction code. Covers VeWorld wallet, social login (Privy), Solidity smart contracts with Hardhat, multi-clause transactions, fee delegation (VIP-191/MPP), Thor Solo testing, ABI-driven codegen, and security checklists.
user-invocable: true
---

# VeChain Development Skill (VeChain Kit-first)

## What this Skill is for
Use this Skill when the user asks for:
- VeChain dApp UI work (React / Next.js)
- Wallet connection + signing flows (VeWorld, social login)
- Transaction building / sending / confirmation UX
- Solidity smart contract development on VeChainThor
- Multi-clause transactions (batching operations)
- Fee delegation (VIP-191 / MPP)
- Local testing with Thor Solo
- Security hardening and audit-style reviews

## Default stack decisions (opinionated)
1) **UI: VeChain Kit first**
- Use `@vechain/vechain-kit` for full-featured dApps (React/Next.js).
- Provides: wallet connection, social login (Privy), transaction hooks, pre-built UI components (WalletButton, TransactionModal), token management, VET domain resolution, smart accounts.
- Tradeoff: larger bundle size. For lightweight wallet-only needs or non-React frameworks, use `@vechain/dapp-kit-react` instead.
- See [Should I Use It?](https://docs.vechainkit.vechain.org/discover-vechain-kit/should-i-use-it) for the decision framework.

2) **SDK: @vechain/sdk first**
- Prefer `@vechain/sdk-core` for offline operations (transactions, signing, encoding).
- Prefer `@vechain/sdk-network` for network operations (ThorClient, providers, contract interaction).
- Use `Clause` builders for transaction construction.
- Use `ThorClient` for all blockchain queries and transaction submission.

3) **Legacy compatibility: Connex/Thor DevKit only at boundaries**
- If you must integrate a library that expects Connex or thor-devkit objects,
  migrate to the unified SDK or isolate legacy code behind adapter boundaries.
- Do not let Connex types leak across the entire app; contain them to adapter modules.

4) **Smart Contracts**
- Default: Solidity with Hardhat + `@vechain/sdk-hardhat-plugin`.
- Use OpenZeppelin contracts for standard patterns (ERC-20, ERC-721, access control).
- Target EVM version `paris` for VeChainThor compatibility.

5) **Testing**
- Default: Hardhat testing framework with Thor Solo local node.
- Use Thor Solo with `--on-demand` flag for fast block generation.
- Use Docker for reproducible Thor Solo environments.

## Operating procedure (how to execute tasks)
When solving a VeChain task:

### 1. Classify the task layer
- UI/wallet/hook layer
- Client SDK/scripts layer
- Smart contract layer (+ ABI)
- Testing/CI layer
- Infra (node/indexing/monitoring)

### 2. Pick the right building blocks
- UI (full-featured): VeChain Kit patterns.
- UI (lightweight/non-React): dapp-kit patterns.
- Scripts/backends: @vechain/sdk-core + sdk-network directly.
- Legacy library present: migrate to unified SDK or introduce adapter boundary.
- Gas optimization: Solidity optimization patterns (storage packing, assembly).

### 3. Implement with VeChain-specific correctness
Always be explicit about:
- network + node URL (mainnet/testnet/solo)
- fee payer + gas estimation + fee delegation setup
- multi-clause transaction structure where beneficial
- dual-token awareness (VET for value, VTHO for gas)
- social login considerations (smart accounts, mandatory fee delegation)
- EVM version compatibility (paris)

### 4. Add tests
- Unit test: Hardhat with Thor Solo.
- Integration test: Thor Solo with realistic state.
- For "wallet UX", add mocked hook/provider tests where appropriate.

### 5. Deliverables expectations
When you implement changes, provide:
- exact files changed + diffs (or patch-style output)
- commands to install/build/test
- a short "risk notes" section for anything touching signing/fees/contract interactions/token transfers

## Progressive disclosure (read when needed)
- UI + wallet + hooks: [frontend-vechain-kit.md](frontend-vechain-kit.md)
- Connex/DevKit migration: [sdk-migration.md](sdk-migration.md)
- Smart contracts: [smart-contracts.md](smart-contracts.md)
- Gas optimization: [smart-contracts-optimization.md](smart-contracts-optimization.md)
- Testing strategy: [testing.md](testing.md)
- ABIs + codegen: [abi-codegen.md](abi-codegen.md)
- Fee delegation: [fee-delegation.md](fee-delegation.md)
- Multi-clause transactions: [multi-clause-transactions.md](multi-clause-transactions.md)
- Security checklist: [security.md](security.md)
- Reference links: [resources.md](resources.md)
