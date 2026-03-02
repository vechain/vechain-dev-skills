# @vechain-ai/vechain-dev

VeChain development plugin for Claude Code. A single comprehensive skill covering the full VeChain development stack:

- Frontend dApps with VeChain Kit or dapp-kit, React Query patterns, Turborepo conventions
- Solidity + Hardhat on VeChainThor, gas optimization, ABI codegen
- Fee delegation (VIP-191) and multi-clause transactions
- Testing with Hardhat + Thor Solo
- Smart contract vulnerability review and prevention
- VeBetterDAO (X2Earn), StarGate staking, governance

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

Once installed, Claude Code automatically uses this skill when you ask about VeChain development topics. The skill uses progressive disclosure — only the relevant reference content is loaded for each query.
