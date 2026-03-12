# Monorepo Templates

Turborepo monorepo with `apps/frontend` (Next.js) and `packages/contracts` (Hardhat + Solidity).
Source files from `shared.md` go under `apps/frontend/src/`.

## Directory structure

```text
{{PROJECT_NAME}}/
├── .github/workflows/deploy.yml
├── .gitignore
├── .nvmrc
├── package.json
├── turbo.json
├── apps/
│   └── frontend/
│       ├── .env.example
│       ├── .eslintrc.json
│       ├── next.config.js
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── (all shared.md src/ files here)
├── packages/
│   ├── config/
│   │   ├── index.ts
│   │   ├── local.ts              ← git-ignored, auto-generated
│   │   ├── testnet.ts
│   │   ├── mainnet.ts
│   │   ├── package.json
│   │   └── scripts/
│   │       └── generateMockLocalConfig.mjs
│   ├── contracts/
│   │   ├── .gitignore
│   │   ├── contracts/
│   │   │   └── HelloWorld.sol
│   │   ├── hardhat.config.ts
│   │   ├── package.json
│   │   ├── scripts/
│   │   │   └── checkContractsDeployment.ts
│   │   ├── test/
│   │   │   └── HelloWorld.test.ts
│   │   └── tsconfig.json
│   ├── eslint-config/
│   │   ├── library.js
│   │   ├── next.js
│   │   └── package.json
│   └── typescript-config/
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
```

## Root files

### `package.json`

```json
{
  "name": "{{PROJECT_NAME}}",
  "private": true,
  "scripts": {
    "dev": "NEXT_PUBLIC_APP_ENV=local turbo dev",
    "dev:testnet": "NEXT_PUBLIC_APP_ENV=testnet turbo dev",
    "dev:mainnet": "NEXT_PUBLIC_APP_ENV=mainnet turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "contracts:compile": "turbo compile --filter=@{{PROJECT_NAME}}/contracts",
    "contracts:test": "turbo test --filter=@{{PROJECT_NAME}}/contracts",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "dependencies": {
    "turbo": "^2.5.0"
  },
  "devDependencies": {
    "prettier": "^3.3.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "engines": {
    "node": "20.x.x"
  },
  "packageManager": "yarn@1.22.22"
}
```

### `turbo.json`

The turbo pipeline ensures contracts are compiled and deployed (on solo) before the frontend starts.

**Flow:** `dev` → `setup-contracts` → `compile` + `check-contracts-deployment` → `check-or-generate-local-config`

- `check-or-generate-local-config` runs first to ensure `packages/config/local.ts` exists (generates mock if missing)
- `compile` depends on config being available (Hardhat imports config)
- `check-contracts-deployment` runs after compile — checks if contracts are deployed on solo, deploys if not, writes real addresses to `local.ts`
- `setup-contracts` orchestrates compile + deployment check
- `dev` depends on `setup-contracts` completing

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NEXT_PUBLIC_APP_ENV", "NEXT_PUBLIC_BASE_PATH", "MNEMONIC"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "out/**"]
    },
    "@{{PROJECT_NAME}}/contracts#build": {
      "cache": true,
      "dependsOn": ["@{{PROJECT_NAME}}/config#check-or-generate-local-config"],
      "outputs": ["artifacts/**", "typechain-types/**", "cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^setup-contracts"]
    },
    "setup-contracts": {
      "cache": false,
      "dependsOn": ["^compile", "@{{PROJECT_NAME}}/contracts#check-contracts-deployment"]
    },
    "@{{PROJECT_NAME}}/config#check-or-generate-local-config": {
      "cache": false
    },
    "compile": {
      "cache": true,
      "dependsOn": ["@{{PROJECT_NAME}}/config#check-or-generate-local-config"],
      "outputs": ["artifacts/**", "typechain-types/**", "cache/**"]
    },
    "@{{PROJECT_NAME}}/contracts#check-contracts-deployment": {
      "cache": false,
      "dependsOn": ["^compile", "@{{PROJECT_NAME}}/config#check-or-generate-local-config"]
    },
    "lint": {
      "cache": false
    },
    "typecheck": {
      "cache": false
    },
    "test": {
      "cache": false,
      "dependsOn": ["^compile", "@{{PROJECT_NAME}}/config#check-or-generate-local-config"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `.gitignore`

```text
node_modules/
.next/
out/
dist/
.env
.env.local
*.tsbuildinfo
next-env.d.ts
artifacts/
cache/
typechain-types/
coverage/

# Auto-generated local config (each dev's solo deployment has different addresses)
packages/config/local.ts
```

### `.nvmrc`

```text
20
```

## `apps/frontend/`

### `package.json`

```json
{
  "name": "@{{PROJECT_NAME}}/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@chakra-ui/react": "3.30.0",
    "@emotion/react": "^11.14.0",
    "@tanstack/react-query": "^5.64.2",
    "@vechain/vechain-kit": "latest",
    "next": "14.2.25",
    "next-themes": "^0.4.6",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.5.0"
  },
  "devDependencies": {
    "@{{PROJECT_NAME}}/eslint-config": "*",
    "@{{PROJECT_NAME}}/typescript-config": "*",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.25",
    "typescript": "^5"
  }
}
```

### `next.config.js`

Same as standalone — see `standalone.md`.

```javascript
/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### `tsconfig.json`

```json
{
  "extends": "@{{PROJECT_NAME}}/typescript-config/nextjs.json",
  "compilerOptions": {
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noUncheckedIndexedAccess": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": [".next", "node_modules", "out"]
}
```

### `.eslintrc.json`

```json
{
  "extends": ["@{{PROJECT_NAME}}/eslint-config/next"]
}
```

### `.env.example`

Same as shared — see `shared.md`.

## `packages/typescript-config/`

### `package.json`

```json
{
  "name": "@{{PROJECT_NAME}}/typescript-config",
  "version": "0.0.0",
  "private": true
}
```

### `base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

### `nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

## `packages/eslint-config/`

### `package.json`

```json
{
  "name": "@{{PROJECT_NAME}}/eslint-config",
  "version": "0.0.0",
  "private": true,
  "files": ["library.js", "next.js"],
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.11.0",
    "@typescript-eslint/parser": "^6.11.0",
    "@vercel/style-guide": "^5.1.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-config-turbo": "^2.5.5",
    "eslint-plugin-only-warn": "^1.1.0",
    "typescript": "^5"
  }
}
```

### `library.js`

```javascript
const { resolve } = require("node:path")
const project = resolve(process.cwd(), "tsconfig.json")

module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["only-warn"],
  globals: { React: true, JSX: true },
  env: { node: true },
  settings: { "import/resolver": { typescript: { project } } },
  ignorePatterns: [".*.js", "node_modules/", "dist/"],
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
}
```

### `next.js`

```javascript
const { resolve } = require("node:path")
const project = resolve(process.cwd(), "tsconfig.json")

module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    require.resolve("@vercel/style-guide/eslint/next"),
    "plugin:turbo/recommended",
  ],
  globals: { React: true, JSX: true },
  env: { node: true, browser: true },
  plugins: ["only-warn"],
  settings: { "import/resolver": { typescript: { project } } },
  ignorePatterns: [".*.js", "node_modules/"],
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
}
```

## `packages/config/`

Central configuration package. Each environment has its own file with contract addresses and network settings.
`local.ts` is git-ignored and auto-generated — each developer's solo deployment produces different addresses.

### How it works

1. `check-or-generate-local-config` (turbo task) runs `generateMockLocalConfig.mjs` — creates `local.ts` with placeholder addresses if it doesn't exist
2. Contracts compile using these placeholder addresses (Hardhat imports `getConfig()`)
3. `check-contracts-deployment` checks if contracts are actually deployed on solo — if not, deploys them and overwrites `local.ts` with real addresses
4. Frontend and tests use `getConfig()` which routes to the correct env file based on `NEXT_PUBLIC_APP_ENV`

### `package.json`

```json
{
  "name": "@{{PROJECT_NAME}}/config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./index.ts",
    "./local": "./local.ts",
    "./testnet": "./testnet.ts",
    "./mainnet": "./mainnet.ts"
  },
  "scripts": {
    "check-or-generate-local-config": "ts-node ./scripts/generateMockLocalConfig.mjs"
  },
  "devDependencies": {
    "ts-node": "^10.9.2"
  }
}
```

### `index.ts`

```typescript
import localConfig from "./local"
import testnetConfig from "./testnet"
import mainnetConfig from "./mainnet"

export type AppConfig = {
  environment: string
  nodeUrl: string
  network: {
    id: string
    name: string
    urls: string[]
    explorerUrl: string
    genesis: {
      id: string
    }
  }
  contracts: {
    helloWorld: string
  }
}

export const AppEnv = {
  LOCAL: "local",
  TESTNET: "testnet",
  MAINNET: "mainnet",
} as const

export type EnvConfig = (typeof AppEnv)[keyof typeof AppEnv]

export const getConfig = (env?: string): AppConfig => {
  const appEnv = env || process.env.NEXT_PUBLIC_APP_ENV
  if (!appEnv) throw new Error("NEXT_PUBLIC_APP_ENV must be set or env must be passed to getConfig()")

  switch (appEnv) {
    case AppEnv.LOCAL:
      return localConfig
    case AppEnv.TESTNET:
      return testnetConfig
    case AppEnv.MAINNET:
      return mainnetConfig
    default:
      throw new Error(`Unsupported NEXT_PUBLIC_APP_ENV: ${appEnv}`)
  }
}
```

### `testnet.ts`

```typescript
import { AppConfig } from "."

const config: AppConfig = {
  environment: "testnet",
  nodeUrl: "https://testnet.vechain.org",
  network: {
    id: "testnet",
    name: "testnet",
    urls: ["https://testnet.vechain.org"],
    explorerUrl: "https://explore-testnet.vechain.org",
    genesis: {
      id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    },
  },
  contracts: {
    helloWorld: "", // Deploy and fill in your testnet address
  },
}

export default config
```

### `mainnet.ts`

```typescript
import { AppConfig } from "."

const config: AppConfig = {
  environment: "mainnet",
  nodeUrl: "https://mainnet.vechain.org",
  network: {
    id: "mainnet",
    name: "mainnet",
    urls: ["https://mainnet.vechain.org"],
    explorerUrl: "https://explore.vechain.org",
    genesis: {
      id: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
    },
  },
  contracts: {
    helloWorld: "", // Deploy and fill in your mainnet address
  },
}

export default config
```

### `scripts/generateMockLocalConfig.mjs`

Generates a mock `local.ts` with placeholder addresses so compilation can proceed before contracts are deployed.

```typescript
import fs from "fs"
import path from "path"

export const generateMockLocalConfig = () => {
  console.log("Checking if @{{PROJECT_NAME}}/config/local.ts exists...")
  const localConfigPath = path.resolve("./local.ts")
  if (fs.existsSync(localConfigPath)) {
    console.log(`${localConfigPath} exists, skipping...`)
    return
  }

  console.log(`${localConfigPath} does not exist, generating mock...`)
  const toWrite = `import { AppConfig } from "."
const config: AppConfig = {
  environment: "local",
  nodeUrl: "http://localhost:8669",
  network: {
    id: "solo",
    name: "solo",
    urls: ["http://localhost:8669"],
    explorerUrl: "http://localhost:8669",
    genesis: {
      id: "0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6",
    },
  },
  contracts: {
    helloWorld: "0x0000000000000000000000000000000000000000",
  },
}
export default config
`

  console.log(`Writing mock config file to ${localConfigPath}`)
  fs.writeFileSync(localConfigPath, toWrite)
  console.log("Done!")
}

generateMockLocalConfig()
```

## `packages/contracts/`

### `package.json`

```json
{
  "name": "@{{PROJECT_NAME}}/contracts",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "compile": "hardhat compile",
    "build": "hardhat compile",
    "test": "hardhat test --network hardhat",
    "check-contracts-deployment": "hardhat run scripts/checkContractsDeployment.ts --network vechain_solo",
    "setup-contracts": "echo 'Setup complete'",
    "clean": "hardhat clean"
  },
  "dependencies": {
    "@{{PROJECT_NAME}}/config": "*"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@vechain/sdk-hardhat-plugin": "latest",
    "hardhat": "^2.22.0",
    "typescript": "^5"
  }
}
```

### `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@vechain/sdk-hardhat-plugin"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    vechain_solo: {
      url: "http://localhost:8669",
      accounts: {
        mnemonic: "denial kitchen pet squirrel other broom bar gas better priority spoil cross",
        count: 10,
      },
    },
    vechain_testnet: {
      url: "https://testnet.vechain.org",
      accounts: {
        mnemonic: process.env.MNEMONIC ?? "",
        count: 3,
      },
    },
    vechain_mainnet: {
      url: "https://mainnet.vechain.org",
      accounts: {
        mnemonic: process.env.MNEMONIC ?? "",
        count: 3,
      },
    },
  },
}

export default config
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "declaration": true
  },
  "include": ["hardhat.config.ts", "contracts/**/*.sol", "test/**/*.ts"],
  "exclude": ["node_modules", "dist", "artifacts", "cache"]
}
```

### `contracts/HelloWorld.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public greeting = "Hello, VeChain!";

    event GreetingChanged(string newGreeting);

    function setGreeting(string calldata _greeting) external {
        greeting = _greeting;
        emit GreetingChanged(_greeting);
    }
}
```

### `test/HelloWorld.test.ts`

```typescript
import { expect } from "chai"
import { ethers } from "hardhat"

describe("HelloWorld", function () {
  it("should return the initial greeting", async function () {
    const factory = await ethers.getContractFactory("HelloWorld")
    const contract = await factory.deploy()
    expect(await contract.greeting()).to.equal("Hello, VeChain!")
  })

  it("should update the greeting", async function () {
    const factory = await ethers.getContractFactory("HelloWorld")
    const contract = await factory.deploy()
    await contract.setGreeting("Hello, World!")
    expect(await contract.greeting()).to.equal("Hello, World!")
  })
})
```

### `scripts/checkContractsDeployment.ts`

Checks if contracts are deployed on the current network. If not (on solo only), deploys them and writes real addresses to `packages/config/local.ts`.

```typescript
import { ethers, network } from "hardhat"
import { getConfig, AppConfig } from "@{{PROJECT_NAME}}/config"
import fs from "fs"
import path from "path"

const config = getConfig()
const isSoloNetwork = network.name === "vechain_solo"

async function main() {
  console.log(`Checking contracts deployment on ${network.name} (${config.nodeUrl})...`)

  try {
    const code =
      config.contracts.helloWorld === "" || config.contracts.helloWorld === "0x0000000000000000000000000000000000000000"
        ? "0x"
        : await ethers.provider.getCode(config.contracts.helloWorld)

    if (code === "0x") {
      console.log(`HelloWorld contract not deployed at ${config.contracts.helloWorld}`)

      if (isSoloNetwork) {
        console.log("Deploying contracts to solo network...")
        const factory = await ethers.getContractFactory("HelloWorld")
        const contract = await factory.deploy()
        const address = await contract.getAddress()
        console.log(`HelloWorld deployed at: ${address}`)

        await overrideLocalConfig(address)
      } else {
        console.log(`Skipping deployment on ${network.name}`)
      }
    } else {
      console.log("Contracts already deployed")
    }
  } catch (e) {
    console.error(e)
  }

  process.exit(0)
}

async function overrideLocalConfig(helloWorldAddress: string) {
  const newConfig: AppConfig = {
    ...config,
    contracts: {
      helloWorld: helloWorldAddress,
    },
  }

  const toWrite = `import { AppConfig } from "."
const config: AppConfig = ${JSON.stringify(newConfig, null, 2)}
export default config
`

  const localConfigPath = path.resolve(__dirname, "../../config/local.ts")
  console.log(`Writing new config to ${localConfigPath}`)
  fs.writeFileSync(localConfigPath, toWrite)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
```

### `.gitignore`

```text
artifacts/
cache/
typechain-types/
node_modules/
coverage/
```

## `.github/workflows/deploy.yml`

Uses `/${{ github.event.repository.name }}` by default for GitHub Pages (`username.github.io/<repo-name>`).
Set to `""` if using a custom domain or if the repo is named `username.github.io`.
Note: `metadata.icons` and raw `<img src>` do NOT auto-prepend `basePath` — prefix them manually.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - "apps/frontend/**"
      - "packages/**"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn

      - run: yarn install --frozen-lockfile

      - run: yarn build
        env:
          NEXT_PUBLIC_BASE_PATH: "/${{ github.event.repository.name }}"
          NEXT_PUBLIC_NETWORK: "{{NETWORK_TYPE}}"
          NODE_OPTIONS: "--max-old-space-size=4096"

      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/frontend/out

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```
