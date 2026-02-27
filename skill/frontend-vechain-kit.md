# Frontend with VeChain Kit (Next.js / React)

## When to use

Use when the user asks about: VeChain Kit, dapp-kit, wallet connection, social login, hooks, components, WalletButton, TransactionModal, provider setup, Turborepo architecture, Chakra UI, i18n.

## Choosing VeChain Kit vs dapp-kit

| Criteria | VeChain Kit | dapp-kit |
|----------|-------------|----------|
| **Best for** | Full-featured dApps | Lightweight wallet-only |
| **Frameworks** | React, Next.js only | React, Next, Vue, Svelte, Angular |
| **Social login** | Yes (Privy) | No |
| **Pre-built UI** | WalletButton, modals, transaction UI | Minimal (WalletButton only) |
| **Transaction hooks** | useSendTransaction, useTransferVET, useTransferERC20 | None (use SDK directly) |
| **Contract read hooks** | useCallClause (React Query-based) | None |
| **Token management** | Built-in (balances, swaps, transfers) | Manual |
| **Smart accounts** | Yes (account abstraction) | No |
| **VET domains** | Built-in hooks | Basic |
| **Bundle size** | Larger | Smaller |
| **i18n** | Built-in | No |

**Rule of thumb**: Use VeChain Kit unless bundle size is critical or you need non-React framework support.
See [Should I Use It?](https://docs.vechainkit.vechain.org/discover-vechain-kit/should-i-use-it) for details.

---

## VeChain Kit Setup

### Quick Start (Template)
```bash
npx create-vechain-dapp@latest
```

Available templates:
| Template | Description |
|----------|-------------|
| **X2Earn** | Monorepo (Turbo) with React frontend, Express.js backend, Hardhat contracts, ChatGPT image recognition, VeBetterDAO integrations |
| **Simple Dapp** | Monorepo (Turbo) with React + Hardhat. Available in VeChain Kit or DAppKit variants |
| **Buy Me Coffee** | Guided tutorial: build a complete dApp with smart contract integration |
| **Smart Contract** | Hardhat-only template for contract development without frontend |

### Manual Installation
```bash
yarn add @vechain/vechain-kit

# Required peer dependencies
yarn add @chakra-ui/react@^2.8.2 \
  @emotion/react@^11.14.0 \
  @emotion/styled@^11.14.0 \
  @tanstack/react-query@^5.64.2 \
  @vechain/dapp-kit-react@2.1.0-rc.1 \
  framer-motion@^11.15.0
```

### Provider Setup (Next.js App Router)

VeChain Kit must be dynamically imported to prevent SSR issues:

```tsx
// app/providers.tsx
'use client';
import dynamic from 'next/dynamic';

const VeChainKitProvider = dynamic(
  () => import('@vechain/vechain-kit').then(mod => mod.VeChainKitProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VeChainKitProvider
      network={{ type: 'test' }}   // 'main' | 'test' | 'solo'
      darkMode={true}
      language="en"
      loginModalUI={{
        logo: '/logo.png',
        description: 'My VeChain dApp',
      }}
      loginMethods={[
        { method: 'vechain', gridColumn: 4 },
        { method: 'dappkit', gridColumn: 4 },
        { method: 'email', gridColumn: 2 },
        { method: 'google', gridColumn: 2 },
        { method: 'passkey', gridColumn: 2 },
        { method: 'more', gridColumn: 2 },
      ]}
      feeDelegation={{
        delegatorUrl: process.env.NEXT_PUBLIC_DELEGATOR_URL,
      }}
      dappKit={{
        allowedWallets: ['veworld', 'wallet-connect'],
        walletConnectOptions: {
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
          metadata: {
            name: 'My dApp',
            description: 'A VeChain dApp',
            url: typeof window !== 'undefined' ? window.location.origin : '',
            icons: [],
          },
        },
      }}
      privy={{
        appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '',
        clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? '',
      }}
    >
      {children}
    </VeChainKitProvider>
  );
}
```

Then wrap `app/layout.tsx` with `<Providers>`.

### Login Methods

| Method | Description | Requires Privy |
|--------|-------------|----------------|
| `vechain` | Login with VeChain (cross-app Privy) | No |
| `dappkit` | VeWorld, WalletConnect | No |
| `ecosystem` | Cross-app ecosystem login | No |
| `email` | Email-based login | Yes |
| `passkey` | Biometric/passkey login | Yes |
| `google` | Google OAuth | Yes |
| `more` | Additional OAuth providers | Yes |

---

## Hooks

All hooks use TanStack Query (React Query) and return a consistent shape:
```typescript
{ data, isLoading, isError, error, refetch, isRefetching }
```

### useWallet -- Connection State

```tsx
import { useWallet } from '@vechain/vechain-kit';

function MyComponent() {
  const {
    account,          // Active account { address, domain, image }
    connectedWallet,  // Current wallet regardless of connection method
    smartAccount,     // Smart account details (for social login users)
    connection,       // Connection state and metadata
    disconnect,       // Disconnect function
  } = useWallet();

  // connection properties:
  // isConnected, isConnectedWithSocialLogin, isConnectedWithDappKit
  // isConnectedWithCrossApp, source: { type, displayName }
  // nodeUrl, delegatorUrl, chainId, network

  if (!connection.isConnected) return <div>Not connected</div>;
  return <div>Connected: {account?.address}</div>;
}
```

### useCallClause -- Contract Reads (preferred pattern)

Use `useCallClause` for all contract read operations. It wraps React Query for caching, refetching, and loading states. Prefer typed contract factories from `@vechain/vechain-contract-types` or your own TypeChain output.

```tsx
import { useCallClause, getCallClauseQueryKey } from '@vechain/vechain-kit';
import { MyContract__factory } from '../typechain-types';

// Basic usage with typed factory ABI
export const useTokenBalance = (address: string) => {
  return useCallClause({
    abi: MyContract__factory.abi,
    address: CONTRACT_ADDRESS,
    method: 'balanceOf',
    args: [address],
    queryOptions: { enabled: !!address },
  });
};

// In a component
function Balance({ address }: { address: string }) {
  const { data, isLoading } = useTokenBalance(address);
  if (isLoading) return <div>Loading...</div>;
  return <div>Balance: {data?.toString()}</div>;
}
```

**Query key** for cache invalidation:
```tsx
import { getCallClauseQueryKey } from '@vechain/vechain-kit';

// Invalidate a specific contract read
queryClient.invalidateQueries({
  queryKey: getCallClauseQueryKey(CONTRACT_ADDRESS, 'balanceOf', [address]),
});
```

**Organize contract hooks** in a dedicated directory (e.g., `src/api/contracts/`):
```
src/api/contracts/
├── useTokenBalance.ts
├── useTokenAllowance.ts
├── useVaultDeposit.ts
└── index.ts
```

### useSendTransaction -- Core Transaction Hook

**Use this for all transactions.** Handles both wallet and social login users automatically.

```tsx
import { useSendTransaction, useWallet } from '@vechain/vechain-kit';

function TransactionComponent() {
  const { account } = useWallet();

  const {
    sendTransaction,
    status,              // 'ready' | 'pending' | 'waitingConfirmation' | 'success' | 'error'
    txReceipt,
    resetStatus,
    isTransactionPending,
    error,               // { type: 'UserRejectedError' | 'RevertReasonError', reason }
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? '',
    // gasPadding: 0.2,  // Optional: 20% gas buffer
  });

  const handleSend = async () => {
    await sendTransaction([
      {
        to: '0xContractAddress',
        value: '0x0',
        data: '0xencodedFunctionData',
        comment: 'User-facing description of this operation',
        abi: functionABI,   // Optional: for UI display
      },
    ]);
  };

  return (
    <button onClick={handleSend} disabled={isTransactionPending}>
      {status === 'pending' ? 'Sending...' : 'Send Transaction'}
    </button>
  );
}
```

**Critical**: `useSendTransaction` is **mandatory** when social login is enabled.

**Critical**: Pre-fetch all data before calling `sendTransaction`. Fetching during submission can trigger browser pop-up blockers for social login users.

### useTransferVET / useTransferERC20 -- Convenience Hooks

```tsx
import { useTransferVET, useTransferERC20, useWallet } from '@vechain/vechain-kit';

// VET transfer
const { sendTransaction } = useTransferVET({
  senderAddress: account?.address ?? '',
  receiverAddress: '0xRecipient',
  amount: '1000000000000000000', // 1 VET in wei
});

// ERC-20 transfer
const { sendTransaction } = useTransferERC20({
  senderAddress: account?.address ?? '',
  receiverAddress: '0xRecipient',
  amount: '1000000000000000000',
  tokenAddress: '0xTokenContract',
  tokenName: 'B3TR',
});
```

### Multi-Clause Transactions

```tsx
const handleBatchOperation = async () => {
  await sendTransaction([
    { to: tokenAddr, value: '0x0', data: approveData, comment: 'Approve spending' },
    { to: vaultAddr, value: '0x0', data: depositData, comment: 'Deposit tokens' },
  ]);
};
```

### Login Hooks

```tsx
import {
  useLoginWithPasskey,
  useLoginWithOAuth,
  useLoginWithVeChain,
} from '@vechain/vechain-kit';

const { loginWithPasskey } = useLoginWithPasskey();
const { initOAuth } = useLoginWithOAuth();
const { login: loginWithVeChain } = useLoginWithVeChain();

// OAuth providers: 'google' | 'twitter' | 'apple' | 'discord' | 'github' | 'linkedin'
```

### Blockchain Hooks

```tsx
import { useCurrentBlock, useTxReceipt, useEvents } from '@vechain/vechain-kit';

const { data: block } = useCurrentBlock();             // Auto-refreshes every 10s
const { data: receipt } = useTxReceipt(txId);          // Poll for receipt
const { data: events } = useEvents({                   // Contract events
  abi: contractABI,
  address: '0xContract',
  eventName: 'Transfer',
  filterParams: { from: '0x...' },
});
```

### Oracle, Token, and Domain Hooks

```tsx
import {
  useGetTokenUsdPrice,
  useGetCustomTokenInfo,
  useGetCustomTokenBalances,
  useVechainDomain,
  useGetAvatar,
} from '@vechain/vechain-kit';

const { data: vetPrice } = useGetTokenUsdPrice('VET');
const { data: tokenInfo } = useGetCustomTokenInfo('0xToken');
const { data: balances } = useGetCustomTokenBalances(address, ['0xToken1', '0xToken2']);
const { data: domain } = useVechainDomain('0xAddress');   // address -> domain
const { data: resolved } = useVechainDomain('name.vet');  // domain -> address
const { data: avatar } = useGetAvatar('name.vet');
```

### NFT and IPFS Hooks

```tsx
import { useNFTImage, useIpfsImage } from '@vechain/vechain-kit';

const { image, metadata, tokenId } = useNFTImage({
  address: walletAddress,
  contractAddress: nftContractAddress,
});

const { data: imageUrl } = useIpfsImage(ipfsUri);
```

### Sign Messages

```tsx
import { useSignMessage, useSignTypedData } from '@vechain/vechain-kit';

const { signMessage } = useSignMessage();
const signature = await signMessage('Hello VeChain');

const { signTypedData } = useSignTypedData();
const typedSig = await signTypedData({
  domain: { name: 'MyApp', version: '1', chainId: 100009 },
  types: { Message: [{ name: 'content', type: 'string' }] },
  message: { content: 'Verify wallet ownership' },
  primaryType: 'Message',
});
```

### @vechain/contract-getters (Framework-Agnostic Reads)

For read-only blockchain queries outside of React components, use `@vechain/contract-getters`. It provides typed getters for common data (balances, VNS domains, avatars, smart accounts) and works in both Node.js and browser environments.

```bash
npm install @vechain/contract-getters
```

Use this package when you need blockchain reads in:
- Backend scripts or API routes
- Non-React frontend frameworks
- Utility functions outside of component lifecycle

For React components, prefer the VeChain Kit hooks (`useCallClause`, `useVechainDomain`, etc.) instead, as they integrate with React Query for caching and reactivity.

---

## Components

### WalletButton

```tsx
import { WalletButton } from '@vechain/vechain-kit';

<WalletButton mobileVariant="icon" desktopVariant="iconAndDomain" />
```

Variants: `icon` | `iconAndDomain` | `iconDomainAndAddress` | `iconDomainAndAssets`

### TransactionModal

```tsx
import { TransactionModal, useTransactionModal } from '@vechain/vechain-kit';

const { open, close, isOpen } = useTransactionModal();

<TransactionModal
  isOpen={isOpen}
  onClose={close}
  status={status}
  txReceipt={txReceipt}
  txError={error}
  uiConfig={{
    title: 'Confirm Transaction',
    description: 'Sending tokens...',
    showShareOnSocials: true,
    showExplorerButton: true,
  }}
/>
```

### Modal Hooks

```tsx
import {
  useAccountModal, useProfileModal, useSendTokenModal,
  useReceiveModal, useConnectModal,
} from '@vechain/vechain-kit';

const { open: openProfile } = useProfileModal();
openProfile({ isolatedView: true }); // Prevent navigation to other kit sections
```

---

## Social Login Considerations

### Smart Accounts
- Social login users get a **Smart Account** (account abstraction) via CREATE2
- Deterministic address (can receive tokens before deployment)
- V3 required for multi-clause and replay protection
- Check: `useUpgradeRequiredForAccount`

### Fee Delegation is Mandatory for Social Login
Social login users cannot hold VTHO. Configure a delegation service:
```tsx
<VeChainKitProvider feeDelegation={{ delegatorUrl: 'https://your-delegator.com/delegate' }}>
```

### Pre-fetch Data Before Transactions
Fetching during `sendTransaction` blocks popups for social login:
```tsx
// GOOD: data ready before transaction
const { data: balance } = useCallClause({ ... });
const handleSend = () => sendTransaction(clauses);

// BAD: fetching inside handler
const handleSend = async () => {
  const balance = await fetchBalance(); // May block popup
  sendTransaction(clauses);
};
```

---

## Common Project Architecture (Turborepo)

Many VeChain dApps use a Turborepo monorepo. When the project follows this structure, respect these conventions:

```
root/
├── apps/
│   └── frontend/          # Next.js App Router
│       └── src/
│           ├── api/
│           │   ├── contracts/  # Contract read hooks (useCallClause wrappers)
│           │   └── indexer/    # Indexer/API query hooks
│           ├── app/            # Next.js App Router pages
│           └── components/
├── packages/
│   ├── contracts/          # Hardhat smart contracts
│   ├── config/             # Shared config (ESLint, TS, etc.)
│   ├── utils/              # Shared utilities
│   └── constants/          # Shared constants, addresses, ABIs
├── turbo.json
└── package.json
```

**Apply these conventions only when the project actually uses this structure.** Check for `turbo.json` or `"turbo"` in the root `package.json` to confirm.

### API Layer Convention
When the project has `src/api/contracts/`:
- Place each contract read hook in its own file (e.g., `useTokenBalance.ts`)
- Export all hooks from `src/api/contracts/index.ts`
- Indexer queries go in `src/api/indexer/`

### useThor (not useConnex)
When the project uses VeChain Kit, use `useThor` for direct Thor client access. `useConnex` is deprecated in VeChain Kit projects:

```tsx
import { useThor } from '@vechain/vechain-kit';
const thor = useThor();
```

**Note**: `useConnex` is still valid in dapp-kit projects (`@vechain/dapp-kit-react`).

---

## State Management Pattern

When the project uses React Query + Zustand:
- **Server state** (contract reads, indexer data): React Query via `useCallClause` or custom `useQuery` hooks
- **Client state** (UI state, form state, toggles): Zustand stores
- Never duplicate server state in Zustand -- let React Query be the source of truth

---

## Chakra UI Integration

When the project uses Chakra UI:
- VeChain Kit's peer dependency is `@chakra-ui/react@^2.8.2`
- Define theme in a central file (e.g., `src/app/theme/theme.ts`)
- Use component recipes for consistent styling (button.ts, card.ts, etc.)
- **Mobile-first**: design for small viewports first, add `md`/`lg` breakpoints for larger screens
- Use responsive props: `<Box p={{ base: 4, md: 8 }}>`

---

## i18n with react-i18next

When the project uses internationalization:
- Use `react-i18next` with flat JSON key-value translation files
- Interpolation: `{{variableName}}`
- VeChain Kit has built-in i18n; sync language with `useCurrentLanguage`

```tsx
import { useCurrentLanguage } from '@vechain/vechain-kit';
const { language, setLanguage } = useCurrentLanguage();
```

---

## Theming

```tsx
<VeChainKitProvider
  darkMode={true}
  theme={{
    modal: { backgroundColor: '#1a1a1a' },
    textColor: '#ffffff',
    buttons: { primary: { background: '#3b82f6', color: '#fff' } },
    font: { family: 'Inter, sans-serif' },
  }}
>
```

Minimal config: set `modal.backgroundColor` and `textColor` -- all other colors auto-derive.

---

## dapp-kit Setup (Lightweight Alternative)

Use `@vechain/dapp-kit-react` when VeChain Kit is too heavy:

```bash
npm install @vechain/dapp-kit-react
```

```tsx
import { DAppKitProvider } from '@vechain/dapp-kit-react';

<DAppKitProvider
  nodeUrl="https://testnet.vechain.org/"
  genesis="test"
  usePersistence={true}
  allowedWallets={['veworld', 'wallet-connect']}
>
  <YourApp />
</DAppKitProvider>
```

Hooks: `useWallet()`, `useConnex()`, `useWalletModal()`, `useVechainDomain()`
Components: `<WalletButton />`

**Note**: dapp-kit has no transaction-sending hooks. Use `@vechain/sdk-network` for contract interaction and transaction submission.

---

## Transaction UX Checklist

* Disable inputs while a transaction is pending
* Show transaction status via `TransactionModal` or `TransactionToast`
* Provide a transaction ID immediately after signing
* Track confirmation via `useTxReceipt`
* Show actionable errors:
  * user rejected signing (`UserRejectedError`)
  * transaction reverted (`RevertReasonError` with reason)
  * insufficient VET for transfer
  * insufficient VTHO for gas fees
* Handle fee delegation failures gracefully (fallback or clear error)
