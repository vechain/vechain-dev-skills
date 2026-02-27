# VeChain Development Skill for Claude Code

A comprehensive Claude Code skill for modern VeChain development (February 2026 best practices).

## Overview

This skill provides Claude Code with deep knowledge of the current VeChain development ecosystem:

- **UI**: `@vechain/vechain-kit` for full-featured React/Next.js dApps (social login, pre-built UI, token management)
- **Lightweight UI**: `@vechain/dapp-kit-react` for wallet-only integrations or non-React frameworks
- **SDK**: `@vechain/sdk-core` + `@vechain/sdk-network` for all client/transaction work
- **Legacy Interop**: Migration patterns from Connex/Thor DevKit to the unified SDK
- **Smart Contracts**: Solidity with Hardhat + `@vechain/sdk-hardhat-plugin`
- **Testing**: Hardhat testing with Thor Solo local node
- **Codegen**: ABI-driven TypeChain client generation
- **Unique Features**: Multi-clause transactions, fee delegation (VIP-191), social login
- **Security**: Comprehensive Solidity vulnerability patterns and prevention

## Installation

### Quick Install

```bash
npx skills add https://github.com/vechain/vechain-dev-skills
```

### Manual Install

```bash
git clone https://github.com/vechain/vechain-dev-skills
cd vechain-dev-skills
./install.sh
```

## Skill Structure

```
skill/
├── SKILL.md                          # Main skill definition (required)
├── frontend.md                       # Shared frontend patterns (React Query, Turborepo, state mgmt)
├── frontend-vechain-kit.md           # VeChain Kit setup, hooks, components, social login
├── frontend-dappkit.md               # dapp-kit setup and usage (lightweight alternative)
├── sdk-migration.md                  # Connex/Thor DevKit -> SDK migration
├── smart-contracts.md                # Solidity development with Hardhat
├── smart-contracts-optimization.md   # Gas optimization patterns
├── testing.md                        # Testing (Hardhat / Thor Solo)
├── abi-codegen.md                    # ABI and TypeChain client generation
├── fee-delegation.md                 # Fee delegation (VIP-191)
├── multi-clause-transactions.md      # Multi-clause transaction patterns
├── security.md                       # Security vulnerabilities & prevention
├── vebetterdao.md                    # VeBetterDAO / X2Earn sustainability apps
├── stargate-staking.md               # StarGate NFT staking & delegation
├── governance.md                     # Governance (VeVote + VeBetterDAO)
└── resources.md                      # Curated reference links
```

## Usage

Once installed, Claude Code will automatically use this skill when you ask about:

- VeChain dApp UI work (React / Next.js)
- VeWorld wallet connection and social login flows
- Transaction building, sending, and confirmation UX
- Solidity smart contract development on VeChainThor
- Multi-clause transactions and fee delegation
- Local testing with Thor Solo
- Security hardening and audit-style reviews
- VeBetterDAO / X2Earn app development and B3TR rewards
- StarGate NFT staking, validator delegation, and VTHO rewards
- VeChain governance (VeVote and VeBetterDAO Governor)

### Example Prompts

```
"Help me set up a Next.js app with VeChain Kit and social login"
"Create a Solidity ERC-20 token contract for VeChain"
"How do I use multi-clause transactions to batch operations?"
"Set up fee delegation so users don't pay gas"
"Write Hardhat tests for my token transfer contract"
"Should I use VeChain Kit or dapp-kit for my project?"
"Review this contract for security issues"
"Build an X2Earn app that rewards users with B3TR for recycling"
"How do I distribute VeBetterDAO rewards from a backend?"
"How does StarGate staking work and how do I delegate to a validator?"
"Create a governance proposal on VeBetterDAO"
```

## Stack Decisions

This skill encodes opinionated best practices:

| Layer | Default Choice | Alternative |
|-------|---------------|-------------|
| UI Framework | @vechain/vechain-kit | @vechain/dapp-kit-react (lightweight) |
| Client SDK | @vechain/sdk-core + sdk-network | @vechain/sdk-ethers-adapter |
| Smart Contracts | Solidity + Hardhat | Foundry |
| Local Node | Thor Solo (Docker) | Thor Solo (binary) |
| Client Generation | TypeChain | Manual ABI wrappers |
| Fee Abstraction | VIP-191 Designated Gas Payer | Generic Delegator (user-paid) |
| Social Login | Privy (via VeChain Kit) | DIY with dapp-kit + Privy (complex) |

## Content Sources

This skill incorporates best practices from:

- [VeChain Official Documentation](https://docs.vechain.org/)
- [VeChain Kit Documentation](https://docs.vechainkit.vechain.org/)
- [VeChain SDK GitHub](https://github.com/vechain/vechain-sdk-js)
- [VeChain Thor Node](https://github.com/vechain/thor)
- [VeChain dApp Kit](https://docs.vechain.org/developer-resources/sdks-and-providers/dapp-kit)

## Progressive Disclosure

The skill uses Claude Code's progressive disclosure pattern. The main `SKILL.md` provides core guidance, and Claude reads the specialized markdown files only when needed for specific tasks.

## Contributing

Contributions are welcome! Please ensure any updates reflect current VeChain ecosystem best practices.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
