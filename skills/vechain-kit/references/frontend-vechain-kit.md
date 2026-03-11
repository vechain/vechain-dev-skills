# VeChain Kit (React / Next.js)

## When to use

Use when the user asks about: VeChain Kit, useWallet, useSendTransaction, useCallClause, WalletButton, TransactionModal, provider setup, social login, Privy, smart accounts, account abstraction, theming.

See the **frontend** skill for choosing VeChain Kit vs dapp-kit, React Query patterns, Turborepo architecture, and shared frontend conventions.

---

## Setup

### Installation

**Important:** VeChain Kit requires `--legacy-peer-deps` due to peer dependency conflicts.

**Before installing**, check the existing project:

- **React Query (`@tanstack/react-query`)**: VeChain Kit hooks depend on it. If the project doesn't have it yet, ask the developer if they want to add it (they almost certainly do — it's required for `useCallClause` and all data-fetching hooks). If the project uses a different data-fetching library (SWR, etc.), flag the potential conflict.
- **CSS framework**: See [CSS Framework Choice](#css-framework-choice) below — ask whether to keep Tailwind or switch to Chakra UI.

```bash
yarn add --legacy-peer-deps @vechain/vechain-kit

# Required peer dependencies
yarn add --legacy-peer-deps @chakra-ui/react@^2.8.2 \
  @emotion/react@^11.14.0 \
  @emotion/styled@^11.14.0 \
  @tanstack/react-query@^5.64.2 \
  @vechain/dapp-kit-react@2.1.0-rc.1 \
  framer-motion@^11.15.0

# Recommended: pre-built ABIs for VeChain ecosystem contracts
yarn add @vechain/vechain-contract-types
```

For npm, use `npm install --legacy-peer-deps` instead.

**Why `@vechain/vechain-contract-types`?** It provides TypeChain-generated ABIs and factories for all major VeChain ecosystem contracts (B3TR, VOT3, StarGate, VET domains, smart accounts, etc.). Use these with `useCallClause` instead of hand-writing ABIs. See the **smart-contract-development** skill (`references/abi-codegen.md`) for the full list.

**If the project doesn't have React Query yet**, also set up the `QueryClientProvider`:

```tsx
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* VeChainKitProvider goes here */}
      {children}
    </QueryClientProvider>
  );
}
```

### CSS Framework Choice

VeChain Kit uses **Chakra UI v2** internally for all its modal and UI components. When setting up a new project, **ask the developer** which approach they prefer:

| Option | Pros | Cons |
|--------|------|------|
| **Use Chakra UI for the whole app** (recommended) | Full visual consistency with VeChain Kit modals, no CSS conflicts, access to Chakra's component library | Must learn Chakra if unfamiliar |
| **Keep Tailwind CSS** | Developer stays in familiar framework | Requires preflight fix (see below), possible style inconsistencies between app UI and VeChain Kit modals |

**If the developer chooses Chakra UI:** no extra CSS configuration needed — Chakra's `ChakraProvider` and VeChain Kit share the same styling engine. Use Chakra components (`Box`, `Button`, `Text`, `Flex`, etc.) throughout the app.

**If the developer keeps Tailwind CSS (especially v4):** apply the preflight fix below.

### Tailwind CSS v4 Compatibility

Tailwind CSS v4's preflight (CSS reset) **conflicts with Chakra UI's styles** inside VeChain Kit modals — buttons collapse, inputs lose height, spacing breaks.

**Fix: disable Tailwind's preflight.** Replace the default Tailwind import with individual imports that skip `preflight.css`:

```css
/* app/globals.css — BEFORE (broken with VeChain Kit) */
@import "tailwindcss";

/* app/globals.css — AFTER (compatible with VeChain Kit) */
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
/* Omit: @import "tailwindcss/preflight.css" layer(base); */
@import "tailwindcss/utilities.css" layer(utilities);
```

This removes Tailwind's CSS reset while keeping all utilities and theme variables. Chakra UI applies its own reset inside VeChain Kit components, so they render correctly.

### Provider Setup (Next.js App Router)

VeChain Kit must be dynamically imported to prevent SSR issues.

**Without own Privy credentials (free shared Privy):**

Use `vechain` for social login — it bundles all social methods (email, Google, passkey, etc.) through VeChain's shared Privy. You **cannot** use `email`, `google`, `passkey`, or `more` individually without your own Privy credentials — doing so will throw a configuration error.

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
        { method: 'vechain', gridColumn: 4 },  // all social login via VeChain's Privy
        { method: 'dappkit', gridColumn: 4 },
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
      // No privy prop needed — uses VeChain's shared credentials
    >
      {children}
    </VeChainKitProvider>
  );
}
```

**With own Privy credentials (better UX, pick individual methods):**

```tsx
<VeChainKitProvider
  // ...same config as above, but with individual login methods and privy prop:
  loginMethods={[
    { method: 'email', gridColumn: 2 },
    { method: 'google', gridColumn: 2 },
    { method: 'passkey', gridColumn: 2 },
    { method: 'more', gridColumn: 2 },
    { method: 'dappkit', gridColumn: 4 },
  ]}
  privy={{
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '',
    clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? '',
  }}
>
```

Then wrap `app/layout.tsx` with `<Providers>`.

### Environment Variables

Create `.env.local` with the required variables:

```bash
# Required for WalletConnect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# Optional: fee delegation (omit to use Generic Delegator — users pay own gas)
NEXT_PUBLIC_DELEGATOR_URL=https://your-delegator.com/delegate

# Optional: own Privy credentials (only if using individual social methods)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

### Common Setup Pitfalls

1. **SSR errors**: VeChain Kit must be dynamically imported with `{ ssr: false }` (shown above). Without this, Next.js will crash during server rendering.
2. **Missing `--legacy-peer-deps`**: Installation fails without this flag due to Chakra UI v2 peer dependency conflicts. Required with React 19 / Next.js 15+.
3. **Tailwind v4 breaks modal**: See [Tailwind CSS v4 Compatibility](#tailwind-css-v4-compatibility) above.
4. **Using `email`/`google`/`passkey` without Privy credentials**: Throws _"Login methods require Privy configuration"_. Use `{ method: 'vechain' }` instead for free social login.
5. **Missing WalletConnect project ID**: Wallet connection will fail silently. Always provide `NEXT_PUBLIC_WC_PROJECT_ID`.
6. **tsconfig target too low**: VeChain SDK uses BigInt literals (`0n`). Set `"target": "ES2020"` or higher in `tsconfig.json`.
7. **BigInt serialization error** ("Do not know how to serialize a BigInt"): Set wagmi's `hashFn` as default `queryKeyHashFn`:

    ```tsx
    import { hashFn } from 'wagmi/query';
    const queryClient = new QueryClient({
      defaultOptions: { queries: { queryKeyHashFn: hashFn } },
    });
    ```

8. **Restricting wallets**: Use `dappKit: { allowedWallets: ['veworld'] }` to show only VeWorld (omit `'wallet-connect'` if you don't need WalletConnect and don't have a project ID).
9. **Privy popup blocking**: Browsers block popups that open after an async call. Pre-fetch all data before triggering `sendTransaction` so the Privy signing popup opens synchronously.
10. **Missing `ColorModeScript`**: If VeChain Kit modals render with wrong colors, add `<ColorModeScript initialColorMode="dark" />` inside your `ChakraProvider`.
11. **CSS conflicts with Bootstrap or custom CSS**: Use CSS layers — `@layer vechain-kit, host-app;` — and wrap your framework styles in `@layer host-app { ... }`.

### Testing (mocking VeChain Kit hooks)

```tsx
jest.mock('@vechain/vechain-kit', () => ({
  useWallet: () => ({ account: { address: '0x123...' }, isConnected: true }),
  useCallClause: () => ({ data: [BigInt('1000000000000000000')], isLoading: false, error: null }),
}));
```

### Sub-path Exports

VeChain Kit exposes additional exports via sub-paths:

```tsx
// Contract factories (re-exports from @vechain/vechain-contract-types)
import { IB3TR__factory } from '@vechain/vechain-kit/contracts';

// Utility functions
import { humanAddress } from '@vechain/vechain-kit/utils';

// Network config (contract addresses, chain IDs)
import { getConfig } from '@vechain/vechain-kit';
const b3trAddress = getConfig('main').b3trContractAddress;
```

### Login Methods

| Method | Description | Requires own Privy credentials |
|--------|-------------|-------------------------------|
| `vechain` | All social login via VeChain's shared Privy (free, slightly worse UX — VeChain branding, extra redirect) | No |
| `dappkit` | VeWorld, WalletConnect | No |
| `ecosystem` | Cross-app ecosystem login | No |
| `email` | Email-based login | **Yes** — must pass `privy` prop |
| `passkey` | Biometric/passkey login | **Yes** — must pass `privy` prop |
| `google` | Google OAuth | **Yes** — must pass `privy` prop |
| `more` | Additional OAuth providers | **Yes** — must pass `privy` prop |

**Important:** Using `email`, `google`, `passkey`, or `more` without the `privy` prop will throw: _"Login methods require Privy configuration. Please either remove these methods or configure the privy prop."_ Use `vechain` instead for free social login, or provide your own Privy credentials.

**Grid layout:** `gridColumn` controls the width of each login button in a 4-column grid. Use `4` for full width, `2` for half width.

### Ecosystem Apps

Filter which ecosystem apps appear when using `{ method: 'ecosystem' }`:

```tsx
<VeChainKitProvider
  loginMethods={[
    { method: 'ecosystem', gridColumn: 4 },
  ]}
  ecosystemApps={{
    allowedApps: ['app-id-1', 'app-id-2'], // App IDs from the Privy dashboard
  }}
>
```

### Legal Documents (Optional)

Prompt users to accept Terms & Conditions, Privacy Policy, or Cookie Policy on wallet connect. Agreements are stored in local storage per wallet address + document type + version + URL. Incrementing `version` re-prompts users.

```tsx
<VeChainKitProvider
  legalDocuments={{
    allowAnalytics: true, // Optional: prompt for VeChainKit tracking consent
    termsAndConditions: [
      {
        displayName: 'MyApp T&C',
        url: 'https://myapp.com/terms',
        version: 1,
        required: true, // Must accept to proceed
      },
    ],
    privacyPolicy: [
      {
        url: 'https://myapp.com/privacy',
        version: 1,
        required: false, // Optional: user can skip
      },
    ],
    cookiePolicy: [
      {
        url: 'https://myapp.com/cookies',
        version: 1,
        required: false,
      },
    ],
  }}
>
```

Each document entry supports: `displayName` (optional label), `url`, `version`, `required` (boolean).

---

## Hooks

All hooks use TanStack Query (React Query) and return a consistent shape:
```typescript
{ data, isLoading, isError, error, refetch, isRefetching }
```

All Kit queries use the `VECHAIN_KIT` prefix — use it for broad invalidation:
```tsx
queryClient.invalidateQueries({ queryKey: ['VECHAIN_KIT'] }); // all Kit queries
queryClient.invalidateQueries({ queryKey: ['VECHAIN_KIT', 'CURRENT_BLOCK'] }); // specific
```

See the **frontend** skill for React Query caching, invalidation, and loading state patterns.

### useWallet -- Connection State

```tsx
import { useWallet } from '@vechain/vechain-kit';

function MyComponent() {
  const {
    account,          // Active account { address, domain, image } — smart account for Privy, wallet for DappKit
    connectedWallet,  // Current wallet regardless of method (Privy embedded or self-custody)
    smartAccount,     // { address, domain, image, isDeployed, isActive, version }
    privyUser,        // Privy User object if connected via Privy, null otherwise
    connection,       // Connection state and metadata
    disconnect,       // Disconnects + dispatches 'wallet_disconnected' event
  } = useWallet();

  // connection properties:
  // isConnected, isLoading,
  // isConnectedWithSocialLogin, isConnectedWithDappKit,
  // isConnectedWithCrossApp, isConnectedWithPrivy, isConnectedWithVeChain,
  // isInAppBrowser (true when running in VeWorld mobile browser),
  // source: { type: 'privy' | 'wallet' | 'privy-cross-app', displayName },
  // nodeUrl, delegatorUrl, chainId, network

  if (!connection.isConnected) return <div>Not connected</div>;
  return <div>Connected: {account?.address}</div>;
}
```

**SmartAccount**: `isDeployed` indicates whether the smart account contract is deployed on-chain (deployed lazily on first transaction to save gas). `version` is the contract version (V3 required for multi-clause + replay protection).

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

**Data transformation** with `select` (preferred over `useMemo` in components):
```tsx
return useCallClause({
  abi: VOT3__factory.abi,
  address: contractAddress,
  method: 'convertedB3trOf' as const,
  args: [address ?? ''],
  queryOptions: {
    enabled: !!address,
    select: (data) => ({
      balance: ethers.formatEther(data[0]),
      formatted: humanNumber(ethers.formatEther(data[0])),
    }),
  },
});
```

**Query keys** for cache invalidation:
```tsx
import {
  getCallClauseQueryKey,
  getCallClauseQueryKeyWithArgs,
} from '@vechain/vechain-kit';

// Without args (for methods with no params)
const key = getCallClauseQueryKey({
  abi, address: contractAddress, method: 'currentRoundId' as const,
});

// With args (for methods with params)
const key = getCallClauseQueryKeyWithArgs({
  abi, address: contractAddress, method: 'balanceOf' as const, args: [address],
});

queryClient.invalidateQueries({ queryKey: key });
```

**Organize contract hooks** in a dedicated directory (e.g., `src/api/contracts/`):
```
src/api/contracts/
├── useTokenBalance.ts
├── useTokenAllowance.ts
├── useVaultDeposit.ts
└── index.ts
```

### Batch Contract Reads

Use `executeMultipleClausesCall` for multiple reads in one call:

```tsx
import { executeMultipleClausesCall } from '@vechain/vechain-kit';

const thor = useThor();
const results = await executeMultipleClausesCall({
  thor,
  calls: addresses.map((addr) => ({
    abi: ERC20__factory.abi,
    functionName: 'balanceOf',
    address: addr as `0x${string}`,
    args: [userAddress],
  })),
});
```

### useBuildTransaction -- Clause Builder Pattern

Wraps `useSendTransaction` with a clause-builder function. Use `thor.contracts.load().clause` to build clauses from loaded contracts:

```tsx
import { useBuildTransaction, useWallet } from '@vechain/vechain-kit';

const useApproveAndSwap = () => {
  const { account } = useWallet();
  const thor = useThor();

  return useBuildTransaction({
    clauseBuilder: (tokenAddress: string, amount: string) => {
      if (!account?.address) return [];
      return [
        {
          ...thor.contracts.load(tokenAddress, ERC20__factory.abi)
            .clause.approve(swapAddress, ethers.parseEther(amount)).clause,
          comment: 'Approve token spending',
        },
        {
          ...thor.contracts.load(swapAddress, SwapContract__factory.abi)
            .clause.swap(tokenAddress, ethers.parseEther(amount)).clause,
          comment: 'Execute swap',
        },
      ];
    },
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ['TOKEN_BALANCE'] });
    },
  });
};
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
    // Gas options (pick one):
    // gasPadding: 0.2,       // Float 0–1: adds % buffer on top of estimated gas
    // suggestedMaxGas: 40000000, // Integer: explicit gas cap, overrides estimation + padding
    onTxConfirmed: () => {
      // CRITICAL: Invalidate ALL queries affected by this transaction.
      // Think through every component that reads data changed by the tx
      // (balances, registration status, navbar items, banners, lists).
      // See frontend.md "Cache Invalidation After Transactions" for details.
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

**Critical**: `useSendTransaction` is **mandatory** when social login is enabled. For apps without social login, you can alternatively use the `signer` exported by the kit and follow the SDK transaction guides directly.

**Critical**: Pre-fetch all data before calling `sendTransaction`. Fetching during submission can trigger browser pop-up blockers for social login users.

**Retry pattern**: Use `resetStatus` + `onTryAgain` for retry UX:
```tsx
const handleTryAgain = useCallback(async () => {
  resetStatus();
  await sendTransaction(clauses);
}, [sendTransaction, clauses, resetStatus]);

<TransactionModal onTryAgain={handleTryAgain} isClosable /* ...other props */ />
```

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
const { data: receipt } = useTxReceipt(txId, 5);       // Poll for receipt (blockTimeout default: 5)
const { data: events } = useEvents({                   // Contract events
  abi: contractABI,
  address: '0xContract',
  eventName: 'Transfer',
  filterParams: { from: '0x...' },
});
```

### Network Utility Hooks

```tsx
import { useGetChainId, useGetNodeUrl } from '@vechain/vechain-kit';

const { data: chainId } = useGetChainId();   // Chain ID from genesis block
const nodeUrl = useGetNodeUrl();              // Current node URL (custom or default)
```

### Legal Documents Hook

After configuring `legalDocuments` on the provider, read agreement status with:

```tsx
import { useLegalDocuments } from '@vechain/vechain-kit';

const {
  documents,                    // All configured legal documents
  agreements,                   // User's agreement records
  documentsNotAgreed,           // Documents the user hasn't agreed to yet
  hasAgreedToRequiredDocuments, // Boolean — true when all required docs are accepted
} = useLegalDocuments();
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

const { data: vetPrice } = useGetTokenUsdPrice('VET');   // Supported: 'VET', 'VTHO', 'B3TR' (on-chain oracle)
const { data: tokenInfo } = useGetCustomTokenInfo('0xToken');
const { data: balances } = useGetCustomTokenBalances(address, ['0xToken1', '0xToken2']);
const { data: domain } = useVechainDomain('0xAddress');   // address -> domain
const { data: resolved } = useVechainDomain('name.vet');  // domain -> address
const { data: avatar } = useGetAvatar('name.vet');
```

#### VET Domain Hooks (full list)

**Resolution:**

- `useVechainDomain(addressOrDomain)` — returns `{ address?, domain?, isValidAddressOrDomain }`
- `useIsDomainProtected(domain)` — returns `boolean` (whether the domain is protected from claiming)
- `useGetDomainsOfAddress(address, parentDomain?)` — returns `{ domains: Array<{ name }> }`

**Records:**

- `useGetTextRecords(domain)` — returns all text records for a domain
- `useGetAvatar(domain)` — returns the avatar image URL directly (converts URI to URL), or `null`
- `useGetAvatarOfAddress(address)` — resolves the primary domain, then returns its avatar URL; falls back to a Picasso image if no domain or avatar is set
- `useGetResolverAddress(domain)` — returns the resolver contract address

**Mutations:**

- `useUpdateTextRecord({ resolverAddress, onSuccess?, onError?, signerAccountAddress? })` — returns `{ sendTransaction, isTransactionPending, error }`
- `useClaimVeWorldSubdomain({ subdomain, domain, onSuccess?, onError?, alreadyOwned? })` — returns `{ sendTransaction, isTransactionPending, error }` (specific to `veworld.vet` subdomains)

#### VET Domain Text Records

`.vet` domains support ENS-compatible text records — key-value pairs stored on the resolver (ENSIP-5/18). Common records: `display` (preferred capitalisation), `avatar`, `description`, `header` (banner image, 1:3 ratio), `email`, `url`, `location`, `phone`, `keywords`. Apps can also store custom records with a prefix (e.g. `com.discord`, `org.reddit`). Records are read from the name's resolver; write availability depends on the resolver implementation.

### NFT and IPFS Hooks

```tsx
import { useNFTImage, useNFTMetadataUri, useIpfsImage } from '@vechain/vechain-kit';

// Full flow: address → tokenId → metadata → image (all resolved automatically)
const { imageData, imageMetadata, tokenID, isLoading } = useNFTImage({
  address: walletAddress,
  contractAddress: nftContractAddress,
});

// Just the metadata URI for a known token ID
const { data: metadataUri } = useNFTMetadataUri({ tokenId, contractAddress });

// Resolve any IPFS URI to a gateway URL
const { data: imageUrl } = useIpfsImage(ipfsUri);
```

### Sign Messages

```tsx
import { useSignMessage, useSignTypedData } from '@vechain/vechain-kit';

// Sign a plain message
const { signMessage, isSigningPending, signature } = useSignMessage();
const sig = await signMessage('Hello VeChain');

// Sign EIP-712 typed data
const {
  signTypedData,
  isSigningPending: isTypedPending,
  signature: typedSig,
} = useSignTypedData();

const result = await signTypedData({
  domain: { name: 'MyApp', version: '1', chainId: 100009 },
  types: { Message: [{ name: 'content', type: 'string' }] },
  message: { content: 'Verify wallet ownership' },
  primaryType: 'Message',
}, { signer: account?.address }); // signer option required for proper routing
```

### Certificate Signing (Wallet Authentication)

To verify wallet ownership for backend JWT flows, use `signTypedData` with EIP-712. **Do not use `useConnex` / `connex.vendor.sign('cert', ...)`** — that is deprecated.

**Smart account warning:** Social login users own a smart account (contract). They sign with their Privy embedded wallet, not the smart account directly. Your backend **must verify that the signer address is the owner of the smart account**, not just compare it to the connected address.

**Frontend hook pattern:**

```tsx
const { signTypedData } = useSignTypedData();
const { account } = useWallet();

const domain = { name: 'MyApp', version: '1' };
const types = {
  Authentication: [
    { name: 'user', type: 'address' },
    { name: 'timestamp', type: 'string' },
  ],
};

const message = { user: account?.address, timestamp: new Date().toISOString() };
const signature = await signTypedData(
  { domain, types, message, primaryType: 'Authentication' },
  { signer: account?.address },
);
// Send { signature, message } to your backend
```

**Backend verification:**

```typescript
import { ethers } from 'ethers';

const signerAddress = ethers.verifyTypedData(domain, types, message, signature);
// For wallet users: signerAddress === account address
// For social login users: signerAddress is the embedded wallet —
//   verify it is the owner of the smart account on-chain
```

### Language and Currency Hooks

Bidirectional sync between VeChain Kit settings and your app. Changes in either direction are reflected in both places. Values persist in localStorage (`i18nextLng` for language, `vechain_kit_currency` for currency).

**Provider props:**

```tsx
<VeChainKitProvider
  language="en"                        // Initial language code
  defaultCurrency="usd"               // 'usd' | 'eur' | 'gbp'
  onLanguageChange={(lang) => {}}      // Fired when user changes language in Kit settings
  onCurrencyChange={(currency) => {}}  // Fired when user changes currency in Kit settings
>
```

**Hooks:**

```tsx
import {
  useCurrentLanguage,
  useCurrentCurrency,
  useVeChainKitConfig,
} from '@vechain/vechain-kit';

// Language
const { currentLanguage, setLanguage } = useCurrentLanguage();
setLanguage('fr');

// Currency
const { currentCurrency, setCurrency } = useCurrentCurrency();
setCurrency('eur'); // 'usd' | 'eur' | 'gbp'

// Full config (includes both + other config properties)
const config = useVeChainKitConfig();
config.currentLanguage; // current runtime value
config.currentCurrency; // current runtime value
config.setLanguage('de');
config.setCurrency('gbp');
```

### @vechain/contract-getters (Framework-Agnostic Reads)

For read-only blockchain queries outside of React components, use `@vechain/contract-getters`. It provides typed getters for VeBetterDAO data (B3TR, VOT3 balances, allocation voting, VeBetter Passport), VET domains, ERC-20 tokens, and more. Works in both Node.js and browser environments.

```bash
npm install @vechain/contract-getters
# Peer dependencies
npm install @vechain/vechain-contract-types @vechain/sdk-network ethers
```

**Simplest usage (no client setup needed — defaults to mainnet):**

```typescript
import { getVot3Balance, getB3trBalance } from '@vechain/contract-getters';

const vot3Balance = await getVot3Balance('0xUserAddress');
const b3trBalance = await getB3trBalance('0xUserAddress');
```

**With custom network:**

```typescript
import { getVot3Balance } from '@vechain/contract-getters';

const balance = await getVot3Balance('0xUserAddress', {
  networkUrl: 'https://testnet.vechain.org',
});
```

**With existing ThorClient (for projects already using VeChain SDK):**

```typescript
import { ThorClient } from '@vechain/sdk-network';
import { VeChainClient, getVot3Balance } from '@vechain/contract-getters';

const thorClient = ThorClient.at('https://testnet.vechain.org');
const vechainClient = VeChainClient.from(thorClient);

const balance = await getVot3Balance('0xUserAddress', { client: vechainClient });
```

**Available modules:** `b3tr`, `vot3`, `erc20`, `vetDomain`, `allocationVoting`, `allocationPool`, `veBetterPassport`, `relayerRewardsPool`.

Use this package when you need blockchain reads in:

- Backend scripts or API routes
- Non-React frontend frameworks
- Utility functions outside of component lifecycle

For React components, prefer the VeChain Kit hooks (`useCallClause`, `useVechainDomain`, etc.) instead, as they integrate with React Query for caching and reactivity.

---

## Components

### WalletButton

Acts as login button when disconnected and account button when connected.

```tsx
import { WalletButton } from '@vechain/vechain-kit';

<WalletButton mobileVariant="icon" desktopVariant="iconAndDomain" />

// Custom styling via buttonStyle (Chakra UI style props)
<WalletButton
  mobileVariant="iconDomainAndAssets"
  desktopVariant="iconDomainAndAssets"
  buttonStyle={{
    background: '#f08098',
    color: 'white',
    border: '2px solid #000',
    _hover: { background: '#db607a' },
  }}
/>
```

Variants: `icon` | `iconAndDomain` | `iconDomainAndAddress` | `iconDomainAndAssets`

Note: some variants adapt based on available data (e.g. `iconDomainAndAssets` only shows assets if the user has any).

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
  onTryAgain={handleTryAgain}
  uiConfig={{
    title: 'Confirm Transaction',
    description: 'Sending tokens...',
    showShareOnSocials: true,
    showExplorerButton: true,
    isClosable: true,
  }}
/>
```

### Modal Hooks

All modal hooks return `{ open, close, isOpen }`. Pass `{ isolatedView: true }` to `open()` to prevent the user from navigating to other Kit sections.

```tsx
import {
  useAccountModal, useProfileModal, useSendTokenModal,
  useReceiveModal, useConnectModal, useDAppKitWalletModal,
  useAccountCustomizationModal, useAccessAndSecurityModal,
  useChooseNameModal, useUpgradeSmartAccountModal,
  useWalletModal, useTransactionToast,
  useExploreEcosystemModal, useNotificationsModal, useFAQModal,
} from '@vechain/vechain-kit';

const { open: openProfile } = useProfileModal();
openProfile({ isolatedView: true }); // Prevent navigation to other kit sections

// Wallet-only connection (bypasses social login)
const { open: openWalletModal } = useDAppKitWalletModal();
```

**Account:** `useAccountModal`, `useProfileModal`, `useAccountCustomizationModal`, `useAccessAndSecurityModal`, `useChooseNameModal`, `useUpgradeSmartAccountModal`
**Wallet/Connection:** `useConnectModal`, `useWalletModal`, `useDAppKitWalletModal`
**Transaction:** `useTransactionModal`, `useTransactionToast`, `useSendTokenModal`, `useReceiveModal`
**Features:** `useExploreEcosystemModal`, `useNotificationsModal`, `useFAQModal`

**VeWorld mobile:** When the app is accessed from VeWorld's in-app browser, VeWorld is automatically enforced as the primary authentication method.

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
VeChain Kit works with social login out of the box — no Privy account needed. If you omit the `privy` prop, VeChain Kit uses VeChain's own Privy credentials via cross-app connect. Use `{ method: 'vechain' }` in `loginMethods` to enable this. This is free and provides all social login methods (email, Google, passkey, etc.) bundled under a single entry point, but the UX is slightly worse: users see VeChain's branding in the Privy modal instead of your app's, and the login flow includes an extra cross-app redirect step.

**You cannot use individual social methods (`email`, `google`, `passkey`, `more`) with the free shared option.** Those methods require your own Privy credentials (Option B). Using them without the `privy` prop will throw a configuration error.

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

The `privy` prop also accepts `appearance`, `embeddedWallets`, and other [Privy SDK options](https://docs.privy.io/) as pass-through configuration.

**Self-hosted Privy pros/cons:**

| Pros | Cons |
|------|------|
| No UI confirmations on user transactions | Cost (Privy pricing) |
| Users can backup keys and manage security in your app | You are responsible for securing the Privy account |
| Targeted social login methods (email, Google, passkey individually) | Users must use ecosystem mode to log into other VeChain apps |

**Security:** If self-hosting Privy, review the [implementation checklist](https://docs.privy.io/guide/security/implementation/) and [CSP guide](https://docs.privy.io/guide/security/implementation/csp).

**Accessing Privy directly:** VeChain Kit re-exports Privy hooks — import from the kit, not from `@privy-io/react-auth`:
```tsx
import { usePrivy } from '@vechain/vechain-kit';

const { user } = usePrivy();
```

### Fee Delegation for Social Login
VeChain Kit v2 auto-enables the **Generic Delegator** by default -- users pay their own gas in VET, VTHO, or B3TR. No `feeDelegation` config is required.

To improve UX, you can optionally sponsor transactions so users pay nothing:
```tsx
<VeChainKitProvider feeDelegation={{ delegatorUrl: 'https://your-delegator.com/delegate' }}>
```

See the **vechain-core** skill (`references/fee-delegation.md`) for Generic Delegator gas estimation, per-transaction sponsorship, and vechain.energy setup.

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

Minimal config: set `modal.backgroundColor` and `textColor` — all other colors auto-derive. Import `VechainKitThemeConfig` for type safety.

```tsx
import type { VechainKitThemeConfig } from '@vechain/vechain-kit';

const theme: VechainKitThemeConfig = {
  modal: {
    backgroundColor: isDarkMode ? '#1f1f1e' : '#ffffff',
    useBottomSheetOnMobile: true, // Slide-up bottom sheet on mobile instead of centered modal
    // border, backdropFilter, rounded are optional
  },
  textColor: isDarkMode ? 'rgb(223, 223, 221)' : '#2e2e2e',
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    blur: 'blur(3px)',
  },
  buttons: {
    primaryButton: { bg: '#3182CE', color: 'white', border: 'none' },
    secondaryButton: { bg: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none' },
    tertiaryButton: { bg: 'transparent', color: '#fff', border: 'none' },
    loginButton: { bg: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
  },
  fonts: {
    family: 'Inter, sans-serif',
    sizes: { small: '12px', medium: '14px', large: '16px' },
    weights: { normal: 400, medium: 500, bold: 700 },
  },
  effects: {
    glass: { enabled: true, intensity: 'low' }, // 'low' | 'medium' | 'high'
  },
};

<VeChainKitProvider theme={theme} {...otherProps}>
```

### Theme API reference

| Prop | Shape | Notes |
|------|-------|-------|
| `modal` | `{ backgroundColor, border, backdropFilter, rounded, useBottomSheetOnMobile }` | Modal container. `backgroundColor` auto-derives card (80%), header (90%), secondary/tertiary, and border colors. `useBottomSheetOnMobile`: slide-up bottom sheet on mobile |
| `textColor` | `string` | Auto-derives primary (100%), secondary (70%), tertiary (50%) text |
| `overlay` | `{ backgroundColor, blur }` | Modal overlay backdrop |
| `buttons` | `{ primaryButton, secondaryButton, tertiaryButton, loginButton }` | Each: `{ bg, color, border, backdropFilter?, rounded? }` |
| `fonts` | `{ family, sizes?, weights? }` | `sizes`: `{ small, medium, large }`. `weights`: `{ normal, medium, bold }`. Scoped to Kit components only — does not affect host app |
| `effects` | `{ glass: { enabled, intensity } }` | Glass morphism; intensity: `'low'` / `'medium'` / `'high'` |

**Common mistakes:**

- `buttons.primary.background` does not exist — use `buttons.primaryButton.bg`
- `font.family` does not exist — use `fonts.family`
- `hoverBg` does not exist in the types

### Chakra UI v3 compatibility

VeChain Kit uses Chakra UI v2 internally. When the host app uses Chakra v3, **pin `@chakra-ui/react` to an exact working version** (currently `3.30.0`). Newer v3 releases can change CSS variable generation and break VeChain Kit's button/modal styling (wrong colors, missing backgrounds). Do NOT use `^` ranges like `^3.26.0`.

### Webpack fallbacks for Next.js

Some VeChain packages (e.g. `@vechain/vebetterdao-relayer-node`) import Node.js modules (`fs`, `net`, `tls`). For Next.js client-side builds, add webpack fallbacks in `next.config.js`:

```js
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
  }
  return config
},
```
