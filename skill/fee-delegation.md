# Fee Delegation (VIP-191 / MPP)

## When fee delegation is in scope
Use this guidance when the user asks about:
- Gasless transactions (users don't pay VTHO)
- Sponsored transactions
- Fee abstraction for onboarding
- Meta-transactions on VeChain
- VIP-191 designated gas payer
- Multi-Party Payment (MPP) protocol

## Two Fee Delegation Protocols

VeChain offers two complementary fee delegation mechanisms:

### VIP-191: Designated Gas Payer (preferred)
- Operates at the **transaction level**
- Flexible: per-transaction sponsorship decisions
- Both sender and sponsor must be online
- Requires `reserved.features = 1` in the transaction body
- Best for: selective sponsorship, promotional campaigns, onboarding flows

### MPP: Multi-Party Payment
- Operates at the **smart contract level**
- Data is written on-chain (costs gas to set up)
- Both parties do NOT need to be online simultaneously
- Best for: dApps that sponsor ALL user transactions for specific contracts

## VIP-191 Implementation

### Flow
1. User creates an unsigned transaction with `reserved: { features: 1 }`
2. User sends the unsigned transaction to the gas payer's service
3. Gas payer evaluates whether to sponsor (checks criteria)
4. Gas payer returns their signature
5. User combines both signatures and submits to the blockchain

### Backend: Sign as Both Sender and Gas Payer

```typescript
import {
    Address, Clause, VET, Transaction, HexUInt,
    Mnemonic, networkInfo
} from '@vechain/sdk-core';
import { ThorClient } from '@vechain/sdk-network';

const thorClient = ThorClient.at('http://localhost:8669');

// Build clauses
const clauses = [
    Clause.transferVET(
        Address.of('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'),
        VET.of(10000)
    )
];

// Estimate gas
const gasResult = await thorClient.gas.estimateGas(clauses, senderAddress);

// Get current block for blockRef
const bestBlock = await thorClient.blocks.getBestBlockCompressed();

// Build transaction body with fee delegation enabled
const body = {
    chainTag: networkInfo.mainnet.chainTag,
    blockRef: bestBlock.id.slice(0, 18),
    expiration: 32,
    clauses,
    gasPriceCoef: 0,
    gas: gasResult.totalGas,
    dependsOn: null,
    nonce: Date.now(),
    reserved: {
        features: 1  // Enable VIP-191 fee delegation
    }
};

// Sign with both sender and gas payer private keys
const signedTransaction = Transaction.of(body).signAsSenderAndGasPayer(
    HexUInt.of(senderPrivateKey).bytes,
    HexUInt.of(gasPayerPrivateKey).bytes
);

// Send
const rawTx = HexUInt.of(signedTransaction.encoded).toString();
const result = await thorClient.transactions.sendRawTransaction(rawTx);
const receipt = await thorClient.transactions.waitForTransaction(result.id);
```

### Using a Delegation URL (sponsor service)

```typescript
import { VeChainProvider, ProviderInternalBaseWallet } from '@vechain/sdk-network';

const provider = new VeChainProvider(
    thorClient,
    new ProviderInternalBaseWallet(
        [{ privateKey: senderPrivateKey, address: senderAddress }],
        {
            gasPayer: {
                delegateUrl: 'https://sponsor-testnet.vechain.energy/by/YOUR_PROJECT_ID'
            }
        }
    ),
    true  // isDelegated = true
);

// Transactions sent via this provider are automatically fee-delegated
const signer = await provider.getSigner(senderAddress);
```

### Frontend: Fee Delegation via dapp-kit

```tsx
import { useConnex } from '@vechain/dapp-kit-react';

function DelegatedTransaction() {
  const { vendor } = useConnex();

  const handleSend = async () => {
    const result = await vendor
      .sign('tx', [
        {
          to: '0x...',
          value: '0x0',
          data: encodedCallData,
        },
      ])
      .delegate('https://sponsor-testnet.vechain.energy/by/YOUR_PROJECT_ID')
      .comment('This transaction is sponsored')
      .request();

    console.log('Transaction ID:', result.txid);
  };

  return <button onClick={handleSend}>Send (Gasless)</button>;
}
```

### Hardhat Configuration with Fee Delegation

```typescript
// hardhat.config.ts
vechain_testnet_delegated: {
  url: 'https://testnet.vechain.org',
  accounts: {
    mnemonic: process.env.MNEMONIC || '',
    count: 3,
    path: VET_DERIVATION_PATH
  },
  delegate: {
    url: 'https://sponsor-testnet.vechain.energy/by/YOUR_PROJECT_ID'
  },
  gas: 'auto',
  gasPrice: 'auto'
}
```

## MPP Implementation

### Setting Up MPP (Contract Owner)

MPP is configured through the built-in `Prototype` contract on VeChainThor:

```solidity
// The Prototype built-in contract at:
// 0x000000000000000000000050726f746f74797065

interface IPrototype {
    // Set the credit plan for a contract
    function creditPlan(uint256 credit, uint256 recoveryRate) external;

    // Add a user to the MPP user list
    function addUser(address user) external;

    // Remove a user from the MPP user list
    function removeUser(address user) external;

    // Check if a user is in the MPP user list
    function isUser(address user) external view returns (bool);

    // Set the contract's master (who pays)
    function master(address newMaster) external;
}
```

### MPP via SDK

```typescript
import { ThorClient } from '@vechain/sdk-network';

const thorClient = ThorClient.at('https://testnet.vechain.org');

// The contract owner sets up MPP for their contract
// This means the contract's master account pays gas for users
const prototypeContract = thorClient.contracts.load(
    '0x000000000000000000000050726f746f74797065',
    prototypeABI
);

// Set credit plan: each user gets 1M gas credit, recovers at 1000 gas/sec
await prototypeContract.transact.creditPlan(1_000_000, 1000);

// Add specific users to the sponsored list
await prototypeContract.transact.addUser(userAddress);
```

## Choosing Between VIP-191 and MPP

| Criteria | VIP-191 | MPP |
|----------|---------|-----|
| Granularity | Per-transaction | Per-contract |
| Setup cost | None (off-chain) | On-chain transactions |
| Flexibility | High (custom logic) | Fixed (credit plan) |
| Online requirement | Both parties | Neither (on-chain rules) |
| Best for | Selective sponsorship | Blanket sponsorship |
| User experience | Seamless (delegate URL) | Automatic (no user action) |

## Building a Gas Payer Service

For production VIP-191 deployments, build a service that:

1. **Receives** unsigned transactions from users
2. **Validates** the transaction (whitelist contracts, check amounts, rate limit)
3. **Signs** as gas payer if approved
4. **Returns** the gas payer signature

### Example validation logic
```typescript
function shouldSponsor(tx: TransactionBody): boolean {
  // Only sponsor interactions with known contracts
  const allowedContracts = ['0x...', '0x...'];

  for (const clause of tx.clauses) {
    if (!allowedContracts.includes(clause.to?.toLowerCase() ?? '')) {
      return false;
    }
    // Don't sponsor VET transfers
    if (BigInt(clause.value) > 0n) {
      return false;
    }
  }

  return true;
}
```

## UX and Security Checklist

- Always show the user that their transaction is sponsored (no hidden fees)
- Rate-limit sponsorship to prevent abuse
- Whitelist contracts and functions eligible for sponsorship
- Monitor VTHO balance of the gas payer account
- Set reasonable gas limits to prevent griefing
- Log all sponsored transactions for auditing
- Consider time-limited sponsorship for promotional campaigns
- Handle delegation service downtime gracefully (fallback to user-paid)
