---
name: transaction-patterns
description: VeChain transaction patterns including fee delegation (VIP-191) and multi-clause transactions. Covers gasless transactions, batch operations, and delegation services.
allowed-tools: []
model: sonnet
license: MIT
metadata:
  author: VeChain
  version: "0.1.0"
---

# VeChain Transaction Patterns

## Scope

Use this Skill for VeChain transaction-specific tasks:

- Fee delegation (VIP-191), gasless/sponsored transactions
- Multi-clause transactions (batching, atomic operations)
- Gas estimation and transaction cost management
- Building delegation services

## Progressive disclosure (load only when needed)

| Topic | File | Load when user mentions... |
|-------|------|---------------------------|
| Fee delegation | [references/fee-delegation.md](references/fee-delegation.md) | gasless, sponsored, VIP-191, delegator, vechain.energy |
| Multi-clause | [references/multi-clause-transactions.md](references/multi-clause-transactions.md) | batch, multi-clause, atomic, multiple operations |
