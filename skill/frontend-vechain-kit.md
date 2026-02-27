# VeChain Kit (React / Next.js)

## When to use

Use when the user asks about: VeChain Kit, useWallet, useSendTransaction, useCallClause, WalletButton, TransactionModal, provider setup, social login, Privy, smart accounts, account abstraction, theming.

See [frontend.md](frontend.md) for choosing VeChain Kit vs dapp-kit, React Query patterns, Turborepo architecture, and shared frontend conventions.

---

## Setup

### Installation

**Important:** VeChain Kit requires `--legacy-peer-deps` due to peer dependency conflicts.

```bash
yarn add --legacy-peer-deps @vechain/vechain-kit

# Required peer dependencies
yarn add --legacy-peer-deps @chakra-ui/react@^2.8.2 \
  @emotion/react@^11.14.0 \
  @emotion/styled@^11.14.0 \
  @tanstack/react-query@^5.64.2 \
  @vechain/dapp-kit-react@2.1.0-rc.1 \
  framer-motion@^11.15.0
```

For npm, use `npm install --legacy-peer-deps` instead.

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
| `vechain` | Login with VeChain's shared Privy (free, slightly worse UX) | No |
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

See [frontend.md](frontend.md) for React Query caching, invalidation, and loading state patterns.

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
  if (isLoading) return <Skeleton height="20px" width="100px" />;
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
import { useQueryClient } from '@tanstack/react-query';

function TransactionComponent() {
  const { account } = useWallet();
  const queryClient = useQueryClient();

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
    onTxConfirmed: () => {
      // Invalidate affected queries after successful transaction
      queryClient.invalidateQueries({
        queryKey: getCallClauseQueryKey(CONTRACT, 'balanceOf', [account?.address]),
      });
    },
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

**Per-transaction delegation**: Override fee delegation for specific transactions:
```tsx
// App sponsors this transaction
await sendTransaction(clauses, 'https://your-delegator.com/delegate');

// User pays via Generic Delegator (default)
await sendTransaction(clauses);
```

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
- **Factory addresses** (must use the [official factory](https://github.com/vechain/smart-accounts) for ecosystem compatibility):
  - Mainnet: `0xC06Ad8573022e2BE416CA89DA47E8c592971679A`
  - Testnet: `0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF`

### Privy Setup (Required for Social Login)

There are two options for enabling social login:

**Option A: Use VeChain's shared Privy account (free, no setup)**
VeChain Kit works with social login out of the box — no Privy account needed. If you omit the `privy` prop, VeChain Kit uses VeChain's own Privy credentials via cross-app connect. This is free and provides all social login methods (`vechain`, `email`, `passkey`, `google`, etc.), but the UX is slightly worse: users see VeChain's branding in the Privy modal instead of your app's, and the login flow includes an extra cross-app redirect step.

**Option B: Use your own Privy account (better UX)**
Create an app at [privy.io](https://privy.io), retrieve your **App ID** and **Client ID** from the App Settings tab, and pass them to `VeChainKitProvider` (see [setup guide](https://docs.vechainkit.vechain.org/quickstart/setup-privy-optional)):
```tsx
<VeChainKitProvider
  privy={{
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!,
  }}
>
```
This gives your app its own branding in the login modal and a smoother single-step login flow.

### Fee Delegation for Social Login
VeChain Kit v2 auto-enables the **Generic Delegator** by default -- users pay their own gas in VET, VTHO, or B3TR. No `feeDelegation` config is required.

To improve UX, you can optionally sponsor transactions so users pay nothing:
```tsx
<VeChainKitProvider feeDelegation={{ delegatorUrl: 'https://your-delegator.com/delegate' }}>
```

See [fee-delegation.md](fee-delegation.md) for Generic Delegator gas estimation, per-transaction sponsorship, and vechain.energy setup.

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

## DIY Social Login with dapp-kit + Privy (Not Recommended)

An alternative to VeChain Kit's built-in social login is using dapp-kit while handling Privy integration, smart account management, and EIP-712 signing yourself. **This adds significant complexity and is not recommended unless you have a specific reason VeChain Kit cannot work for your use case.**

- [Tutorial](https://docs.vechain.org/developer-resources/example-dapps/pwa-with-privy-and-account-abstraction)
- [Example repo](https://github.com/vechain-energy/docs-pwa-privy-account-abstraction-my-pwa-project)
- [Smart accounts factory](https://github.com/vechain/smart-accounts)

### VeChain Kit vs DIY Comparison

| Concern | VeChain Kit (recommended) | DIY with dapp-kit |
|---------|--------------------------|-------------------|
| Smart account contracts | Uses official pre-deployed factory | Must deploy your own OR integrate official factory |
| EIP-712 signing | Automated in `useSendTransaction` | Manual typed data construction |
| Account deployment detection | Built-in (lazy deploy on first tx) | Custom logic required |
| Replay protection | Built-in nonce handling (V3) | Manual nonce management |
| Version upgrades (V1→V3) | `useUpgradeRequiredForAccount` + modal | Must track yourself |
| Batch/multi-clause | Automated via `executeBatchWithAuthorization` | Must build manually |
| iOS/Android signing | Handled (custom domain separator) | Not addressed in tutorial |
| Cross-app compatibility | Supported via `@privy-io/cross-app-connect` | Not supported |
| Provider setup | Single `<VeChainKitProvider>` | Nested `<PrivyProvider>` + custom `<VeChainAccountProvider>` |

### Critical: Use the Official Smart Accounts Factory

If you take the DIY path, you **must** use the [official vechain/smart-accounts factory](https://github.com/vechain/smart-accounts) (`0xC06Ad...` mainnet / `0x713b9...` testnet). Deploying your own factory (as the tutorial does) creates smart accounts that are **not compatible** with VeChain Kit, VeWorld, or other VeChain ecosystem apps. Users would have different addresses across apps.

See [Smart Accounts documentation](https://docs.vechainkit.vechain.org/social-login/smart-accounts) for factory details.

### What You Must Implement Yourself

1. **EIP-712 typed data construction** -- build and sign authorization payloads for `executeWithAuthorization`
2. **Lazy account deployment** -- detect undeployed accounts and inject factory creation clauses on first transaction
3. **Fee delegation integration** -- separate sponsor signature flow
4. **Nonce management** -- for `executeBatchWithAuthorization` replay protection
5. **Version migration** -- the factory has evolved V1→V3 (V2 was skipped); handle upgrades
6. **HTTPS requirement** -- Privy uses `crypto.subtle`, requiring HTTPS even in development (e.g., ngrok)
7. **Ephemeral wallet for submission** -- generate a random wallet as the transaction entry point; actual auth comes from the Privy-signed EIP-712 message

### When DIY Might Be Justified

- You need custom smart account logic beyond what SimpleAccount V3 provides
- You need full control over the signing/submission pipeline
- You are building for a non-React framework where VeChain Kit cannot run

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
