# Frontend with @vechain/dapp-kit (Next.js / React)

## Goals
- VeWorld wallet connection with Wallet Standard discovery
- One ThorClient instance for the app (node URL + wallet connectors)
- Minimal "use client" footprint in Next.js (hooks only in leaf components)
- Transaction sending that is observable and UX-friendly

## Recommended dependencies
- @vechain/dapp-kit-react
- @vechain/sdk-core
- @vechain/sdk-network

## Bootstrap recommendation
For new projects, scaffold a Next.js app and add `@vechain/dapp-kit-react`. SSR must be disabled for dapp-kit components.

## Provider setup (Next.js App Router)
Create a single DAppKitProvider and wrap your app.

Example `app/providers.tsx`:

```tsx
'use client';

import React from 'react';
import { DAppKitProvider } from '@vechain/dapp-kit-react';

const nodeUrl =
  process.env.NEXT_PUBLIC_VECHAIN_NODE_URL ?? 'https://testnet.vechain.org';

const genesis = (process.env.NEXT_PUBLIC_VECHAIN_NETWORK ?? 'test') as 'main' | 'test';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DAppKitProvider
      nodeUrl={nodeUrl}
      genesis={genesis}
      usePersistence={true}
      themeMode="LIGHT"
      allowedWallets={['veworld', 'wallet-connect']}
      walletConnectOptions={{
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '',
        metadata: {
          name: 'My VeChain dApp',
          description: 'A VeChain dApp',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [],
        },
      }}
    >
      {children}
    </DAppKitProvider>
  );
}
```

Then wrap `app/layout.tsx` with `<Providers>`.

**Important**: dapp-kit does not support SSR. Wrap the provider in a dynamic import with `ssr: false` if needed:

```tsx
import dynamic from 'next/dynamic';

const Providers = dynamic(() => import('./providers').then(m => m.Providers), {
  ssr: false,
});
```

## Hook usage patterns (high-level)

Prefer dapp-kit hooks before writing your own store/subscription logic:

* `useWallet()` for connect/disconnect, wallet discovery, and account state
  - `account` - connected wallet address
  - `source` - current wallet source (veworld, wallet-connect, sync2)
  - `connect()` / `disconnect()` - wallet lifecycle
  - `availableWallets` - list of detected wallets
  - `connectionCertificate` - certificate from wallet connection

* `useConnex()` for blockchain interaction
  - `thor` - Connex.Thor instance for queries
  - `vendor` - Connex.Vendor instance for signing

* `useWalletModal()` for programmatic modal control
  - `open()` / `close()` - toggle wallet selection modal
  - `onConnected` - callback after successful connection

* `useVechainDomain()` for `.vet` domain name resolution

## Pre-built components

* `<WalletButton />` - drop-in button that opens wallet modal on click, shows connected address when connected

## Data fetching patterns

### Reading account state
```tsx
import { useConnex } from '@vechain/dapp-kit-react';

function AccountBalance({ address }: { address: string }) {
  const { thor } = useConnex();
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    thor.account(address).get().then(acc => {
      setBalance(acc.balance);
    });
  }, [address, thor]);

  return <div>Balance: {balance}</div>;
}
```

### Sending transactions
```tsx
import { useConnex } from '@vechain/dapp-kit-react';

function SendVET() {
  const { vendor } = useConnex();

  const handleSend = async () => {
    const result = await vendor
      .sign('tx', [
        {
          to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
          value: '0x' + (1e18).toString(16), // 1 VET in wei
          data: '0x',
        },
      ])
      .comment('Transfer 1 VET')
      .request();

    console.log('Transaction ID:', result.txid);
  };

  return <button onClick={handleSend}>Send 1 VET</button>;
}
```

### Multi-clause transaction from UI
```tsx
const handleBatchTransfer = async () => {
  const result = await vendor
    .sign('tx', [
      { to: recipient1, value: '0x...', data: '0x' },
      { to: recipient2, value: '0x...', data: '0x' },
      { to: contractAddr, value: '0x0', data: encodedCallData },
    ])
    .comment('Batch transfer')
    .delegate('https://sponsor-testnet.vechain.energy/by/...')
    .request();
};
```

### Contract interaction from UI
```tsx
import { useConnex } from '@vechain/dapp-kit-react';

function TokenBalance({ contractAddress, abi, account }: Props) {
  const { thor } = useConnex();
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    const balanceOf = thor.account(contractAddress)
      .method(abi.find(m => m.name === 'balanceOf')!)
      .call(account);

    balanceOf.then(result => {
      setBalance(result.decoded['0']);
    });
  }, [contractAddress, account, thor]);

  return <div>Token Balance: {balance}</div>;
}
```

## Transaction UX checklist

* Disable inputs while a transaction is pending
* Provide a transaction ID immediately after signing
* Track confirmation by polling `thor.transaction(txid).getReceipt()`
* Show actionable errors:

  * user rejected signing
  * insufficient VET for transfer
  * insufficient VTHO for gas fees
  * transaction reverted (show revert reason)
  * contract error (decode custom error)

## When to use VeChain Kit v2 (optional)

If you need a more feature-rich toolkit with built-in UI components beyond wallet connection, consider `@vechain/vechain-kit`:
- Built-in token swap widgets
- Customizable wallet modals and account management
- Enhanced UI components for common dApp patterns
- Integrated fee delegation UI
