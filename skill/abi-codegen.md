# ABIs + Client Generation (TypeChain / ethers)

## Goal
Never hand-maintain contract interaction code by manually re-implementing function signatures and types.
Prefer an ABI-driven, code-generated workflow.

## TypeChain (preferred)
- Use TypeChain to generate strongly-typed TypeScript bindings from contract ABIs.
- Supports ethers.js v6 output (compatible with VeChain's ethers adapter).
- Generates type-safe contract factories and interfaces.

## Hardhat + TypeChain workflow
If using Hardhat (default for VeChain development):

### Setup
```bash
npm install --save-dev @typechain/hardhat typechain @typechain/ethers-v6
```

### Configuration
```typescript
// hardhat.config.ts
import '@typechain/hardhat';

const config = {
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  // ... rest of config
};
```

### Generate Types
```bash
# Types are generated automatically on compile
npx hardhat compile

# Types appear in typechain-types/
```

### Using Generated Types
```typescript
import { MyToken, MyToken__factory } from '../typechain-types';

// Deploy with type safety
const factory = new MyToken__factory(signer);
const token: MyToken = await factory.deploy(1_000_000);

// Interact with full type safety
const balance: bigint = await token.balanceOf(address);
await token.transfer(recipient, amount);

// Events are typed
const filter = token.filters.Transfer(from, to);
const events = await token.queryFilter(filter);
```

## ABI extraction from compilation

Hardhat compilation produces ABI artifacts in `artifacts/contracts/`:

```
artifacts/
└── contracts/
    └── MyToken.sol/
        ├── MyToken.json          # Full artifact (ABI + bytecode)
        └── MyToken.dbg.json      # Debug info
```

### Reading ABIs programmatically
```typescript
import MyTokenArtifact from '../artifacts/contracts/MyToken.sol/MyToken.json';

const abi = MyTokenArtifact.abi;
const bytecode = MyTokenArtifact.bytecode;
```

## Using ABIs with VeChain SDK

### Contract interaction with raw ABI
```typescript
import { ThorClient } from '@vechain/sdk-network';

const thorClient = ThorClient.at('https://testnet.vechain.org');
const contract = thorClient.contracts.load(contractAddress, abi);

// Read (fully typed if using TypeChain-generated ABI)
const result = await contract.read.balanceOf(address);

// Write
await contract.transact.transfer(recipient, amount);
```

### Multi-clause reads with ABI
```typescript
const results = await thorClient.contracts.executeMultipleClausesCall([
  contract.clause.totalSupply(),
  contract.clause.name(),
  contract.clause.symbol(),
]);
```

## Repository structure recommendation
- `contracts/` (Solidity source)
- `artifacts/` (compiled artifacts with ABIs - generated)
- `typechain-types/` (generated TypeScript bindings)
- `scripts/` (deployment and interaction scripts)
- `test/` (tests using typed contracts)

## Generation guardrails
- TypeChain outputs should be in `.gitignore` by default (generated on compile).
- If consumers need pre-built types, publish the package or check in the generated files.
- Always regenerate after contract changes (`npx hardhat compile`).

## "Do not do this"
- Do not copy-paste ABI arrays into application code manually.
- Do not write manual TypeScript interfaces for contract methods.
- Do not use `any` types for contract interaction when TypeChain is available.
- Do not rely on string-based function selectors when typed wrappers exist.
