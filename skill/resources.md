# Curated Resources (Source-of-Truth First)

## Core VeChain Documentation
- [VeChain Documentation](https://docs.vechain.org/) (Core concepts, SDKs, tutorials)
- [VeChain Whitepaper](https://www.vechain.org/whitepaper/)
- [VeChainThor Transaction Model](https://docs.vechain.org/core-concepts/transactions/transaction-model)
- [Dual-Token Economic Model](https://docs.vechain.org/introduction-to-vechain/dual-token-economic-model)

## VeChain Kit (preferred for React/Next.js dApps)
- [VeChain Kit Documentation](https://docs.vechainkit.vechain.org/)
- [Should I Use It?](https://docs.vechainkit.vechain.org/discover-vechain-kit/should-i-use-it) (decision framework)
- [Installation](https://docs.vechainkit.vechain.org/quickstart/installation)
- [Provider Configuration](https://docs.vechainkit.vechain.org/quickstart/provider-configuration)
- [Send Transactions](https://docs.vechainkit.vechain.org/quickstart/send-transactions)
- [Hooks Reference](https://docs.vechainkit.vechain.org/hooks)
- [Components Reference](https://docs.vechainkit.vechain.org/components)
- [Social Login / Privy Setup](https://docs.vechainkit.vechain.org/quickstart/setup-privy-optional)
- [Smart Accounts](https://docs.vechainkit.vechain.org/social-login/smart-accounts)
- [Fee Delegation Setup](https://docs.vechainkit.vechain.org/fee-delegation/fee-delegation-setup)
- [Theming](https://docs.vechainkit.vechain.org/customization/theming)
- [@vechain/vechain-kit npm](https://www.npmjs.com/package/@vechain/vechain-kit)

## Scaffolding
- [create-vechain-dapp](https://www.npmjs.com/package/create-vechain-dapp) (`npx create-vechain-dapp@latest`)

## VeChain SDK
- [VeChain SDK GitHub](https://github.com/vechain/vechain-sdk-js)
- [@vechain/sdk-core npm](https://www.npmjs.com/package/@vechain/sdk-core) (offline: transactions, signing, encoding)
- [@vechain/sdk-network npm](https://www.npmjs.com/package/@vechain/sdk-network) (network: ThorClient, providers, contracts)
- [@vechain/sdk-errors npm](https://www.npmjs.com/package/@vechain/sdk-errors)
- [SDK Accounts Guide](https://docs.vechain.org/developer-resources/sdks-and-providers/sdk/accounts)
- [SDK Transactions Guide](https://docs.vechain.org/developer-resources/sdks-and-providers/sdk/transactions)
- [SDK Contracts Guide](https://docs.vechain.org/developer-resources/sdks-and-providers/sdk/contracts)
- [SDK ThorClient Guide](https://docs.vechain.org/developer-resources/sdks-and-providers/sdk/thor-client)

## DApp Kit (lightweight alternative)
- [DApp Kit Documentation](https://docs.vechain.org/developer-resources/sdks-and-providers/dapp-kit)
- [@vechain/dapp-kit-react npm](https://www.npmjs.com/package/@vechain/dapp-kit-react)
- [DApp Kit React Usage](https://docs.vechain.org/developer-resources/sdks-and-providers/dapp-kit/dapp-kit-1/react/usage)

## Wallets
- [VeWorld Wallet](https://www.veworld.net/) (official wallet -- browser extension + mobile)
- [VeWorld Documentation](https://docs.vechain.org/core-concepts/wallets/veworld)

## Smart Contract Development

### Hardhat Integration
- [Build with Hardhat Guide](https://docs.vechain.org/developer-resources/how-to-build-on-vechain/build-with-hardhat)
- [Hardhat Plugin Documentation](https://docs.vechain.org/developer-resources/frameworks-and-ides/hardhat)
- [@vechain/sdk-hardhat-plugin npm](https://www.npmjs.com/package/@vechain/sdk-hardhat-plugin)

### OpenZeppelin
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [OpenZeppelin Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/)
- [OpenZeppelin Wizard](https://wizard.openzeppelin.com/) (contract generator)

### Solidity
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Solidity by Example](https://solidity-by-example.org/)

## Local Development
- [Thor Solo Node Guide](https://docs.vechain.org/how-to-run-a-node/how-to-run-a-thor-solo-node)
- [Thor Node GitHub](https://github.com/vechain/thor)
- [Docker Hub: vechain/thor](https://hub.docker.com/r/vechain/thor)

## VeChain-Specific Features

### Fee Delegation
- [Fee Delegation Overview](https://docs.vechain.org/core-concepts/transactions/meta-transaction-features/fee-delegation)
- [VIP-191 Integration Guide](https://docs.vechain.org/developer-resources/vip-191-designated-gas-payer/how-to-integrate-vip-191-i)
- [vechain.energy Managed Delegation](https://vechain.energy/)

### Multi-Clause Transactions
- [Multi-Clause Documentation](https://docs.vechain.org/core-concepts/transactions/meta-transaction-features/clauses-multi-task-transaction)

### Token Standards
- [VIP-180 (Fungible Token)](https://github.com/vechain/VIPs/blob/master/vips/VIP-180.md) (ERC-20 compatible, superseded by standard ERC-20)
- [VIP-181 (Non-Fungible Token)](https://github.com/vechain/VIPs/blob/master/vips/VIP-181.md) (ERC-721 compatible, superseded by standard ERC-721)

### VET Domains
- [VET Domains](https://vet.domains/) (.vet domain name service)

## Ethers.js Compatibility
- [@vechain/sdk-ethers-adapter npm](https://www.npmjs.com/package/@vechain/sdk-ethers-adapter)
- [ethers.js Documentation](https://docs.ethers.org/)

## Testing
- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Matchers (Hardhat)](https://hardhat.org/hardhat-chai-matchers/docs/overview)

## Security
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/security)
- [SWC Registry](https://swcregistry.io/) (Smart Contract Weakness Classification)
- [Slither (Static Analyzer)](https://github.com/crytic/slither)

## VeChain Ecosystem
- [VeChain Official Website](https://www.vechain.org/)
- [VeChain GitHub Organization](https://github.com/vechain)
- [VeChain Improvement Proposals (VIPs)](https://github.com/vechain/VIPs)
- [VeChain Explorer (Mainnet)](https://explore.vechain.org/)
- [VeChain Explorer (Testnet)](https://explore-testnet.vechain.org/)

## Network Endpoints
- **Mainnet**: `https://mainnet.vechain.org`
- **Testnet**: `https://testnet.vechain.org`
- **Thor Solo (local)**: `http://localhost:8669`
