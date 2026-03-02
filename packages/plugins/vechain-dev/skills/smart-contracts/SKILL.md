---
name: smart-contracts
description: Solidity smart contract development on VeChainThor with Hardhat. Covers ERC-20, ERC-721, deployment, gas optimization, ABI codegen, libraries, upgradeable contracts, testing with Thor Solo, CI configuration.
allowed-tools: []
model: sonnet
license: MIT
metadata:
  author: VeChain
  version: "0.1.0"
---

# Smart Contracts on VeChainThor

## Scope

Use this Skill for any VeChain smart contract development task:

- Solidity contracts, Hardhat setup, deployment
- ERC-20, ERC-721, access control, upgradeable contracts
- Gas optimization patterns
- ABI extraction and TypeChain code generation
- Contract interaction with VeChain SDK
- Solidity libraries and contract size management
- Testing with Hardhat and Thor Solo local node
- CI configuration for smart contract tests

## Progressive disclosure (load only when needed)

| Topic | File | Load when user mentions... |
|-------|------|---------------------------|
| Smart contracts | [references/smart-contracts.md](references/smart-contracts.md) | Solidity, Hardhat, ERC-20, ERC-721, deploy, contract interaction, libraries, contract size, upgradeable |
| Gas optimization | [references/smart-contracts-optimization.md](references/smart-contracts-optimization.md) | gas, optimize, storage packing, assembly, unchecked |
| ABI / codegen | [references/abi-codegen.md](references/abi-codegen.md) | TypeChain, ABI, typechain-types, code generation |
| Testing | [references/testing.md](references/testing.md) | testing, Thor Solo, Docker, CI/CD, test fixtures, test patterns |
