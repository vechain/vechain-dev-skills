# @vechain-ai/vechain-dev

VeChain development plugin for Claude Code. Provides skills covering the full VeChain development stack:

- **dapp-development** — Frontend dApps with VeChain Kit or dapp-kit, React Query patterns, Turborepo conventions
- **smart-contracts** — Solidity + Hardhat on VeChainThor, gas optimization, ABI codegen, testing with Thor Solo
- **transaction-patterns** — Fee delegation (VIP-191) and multi-clause transactions
- **security** — Smart contract vulnerability review and prevention
- **defi-ecosystem** — VeBetterDAO (X2Earn), StarGate staking, governance

## Installation

```bash
npx skills add https://github.com/vechain/vechain-ai
```

Or install locally:

```bash
git clone https://github.com/vechain/vechain-ai
cd vechain-ai
./scripts/install-local.sh
```

## Usage

Once installed, Claude Code automatically uses these skills when you ask about VeChain development topics. The skill system uses progressive disclosure — only the relevant skill content is loaded for each query.
