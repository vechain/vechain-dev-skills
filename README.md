# VeChain AI

AI plugins, agents, and tools for VeChain development.

## Quick Install

```bash
npx skills add https://github.com/vechain/vechain-dev-skill
```

Or manually:

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
packages/plugins/vechain-dev/    # Main plugin with 6 skills
scripts/                         # Validation and install scripts
evals/                           # Promptfoo evaluation suites
docs/                            # Documentation
```

## Development

```bash
npm install
npx nx run vechain-dev:validate       # Validate plugin structure
npx nx run vechain-dev:lint-markdown   # Lint markdown files
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

## Content Sources

- [VeChain Documentation](https://docs.vechain.org/)
- [VeChain Kit Documentation](https://docs.vechainkit.vechain.org/)
- [VeChain SDK](https://github.com/vechain/vechain-sdk-js)
- [VeBetterDAO Documentation](https://docs.vebetterdao.org/)
- [StarGate Documentation](https://docs.stargate.vechain.org/)

## Contributing

Contributions welcome! See [CLAUDE.md](CLAUDE.md) for development guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npx nx run vechain-dev:validate` to verify
5. Submit a pull request

## License

MIT License — see [LICENSE](LICENSE) for details.
