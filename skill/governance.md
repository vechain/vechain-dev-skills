# Governance (VeVote & VeBetterDAO)

## When to use this guidance

Use this guidance when the user asks about:

- VeChain governance and voting
- VeVote platform and proposals
- Steering committee elections
- VeBetterDAO governance proposals
- VOT3 voting power and delegation
- On-chain voting mechanisms

## Two Governance Systems

VeChain has two separate but complementary governance systems:

| System | Platform | Voting Asset | Purpose |
|--------|----------|-------------|---------|
| **VeVote** | [vevote.vechain.org](https://vevote.vechain.org/) | Stargate NFTs | Protocol upgrades, steering committee elections, network parameters |
| **VeBetterDAO Governor** | VeBetterDAO dApp | VOT3 token | dApp allocation rounds, ecosystem fund distribution, DAO proposals |

---

## VeVote (Protocol Governance)

### What is VeVote?

VeVote is VeChain's official on-chain governance platform where Validators and Node holders vote on proposals that shape the VeChainThor blockchain. All votes are recorded on-chain, making them tamper-proof and publicly verifiable.

### Proposal Types

- **Steering Committee Voting** -- Election of the Board of Steering Committee of the VeChain Foundation
- **All Stakeholders Voting** -- Broader governance votes on protocol changes (e.g., VIP-253 Hayabusa upgrade)

### Voting Power

Uses a **weighted voting system** based on **Stargate NFT tier level**:

| Tier | Relative Weight |
|------|----------------|
| Mjolnir X | Highest |
| Thunder X | High |
| Strength X | Medium-high |
| VeThor X | Medium |
| Mjolnir | ~1,500 units |
| Thunder | ~500 units |
| Strength | Lower |
| Flash | Lower |
| Lightning | Lower |
| Dawn | Lowest |

**Voting units in the smart contract are scaled by 100** to avoid underflow (e.g., 150 = 1.5x).

### Voting Rules

- Your total voting power is applied entirely to the option you select
- Each wallet can only vote **once per proposal**
- **You cannot change your vote** once cast
- Options: **For**, **Against**, or **Abstain**
- Voting power calculated **at the moment you cast your vote**

### Delegation

VeVote supports on-chain delegation via Stargate NFT **Node Manager** feature:
- An NFT owner assigns a Node Manager (another wallet) to vote on their behalf
- The Node Manager gains **full voting power** for the managed NFT(s)

### Contract Addresses

| Contract | Network | Address |
|----------|---------|---------|
| Steering Committee Vote | Mainnet | `0xDBAeC4165A6cff07901C41D3561EEFdCFbc20CB6` |

### Developer Resources

- **Monorepo**: [github.com/vechain/vevote](https://github.com/vechain/vevote) -- Smart contracts (`packages/contracts/`) + React frontend (`apps/frontend/`)
- **Legacy contracts**: [github.com/vechain/vevote-contracts](https://github.com/vechain/vevote-contracts)
- **Tech stack**: Solidity + Hardhat (contracts), React + Vite (frontend), VeChain Kit (wallet integration)

---

## VeBetterDAO Governance

### How It Works

VeBetterDAO uses the OpenZeppelin **Governor pattern** (with AccessControl and UUPSUpgradeable) for governance proposals.

### Voting Token: VOT3

- **B3TR** is earned by using VeBetter ecosystem apps
- **VOT3** is obtained by swapping B3TR at **1:1 ratio**
- VOT3 enables voting and staking to earn B3TR rewards
- Auto-delegation: VOT3 automatically delegates to the holder on receipt
- Minimum: hold at least **1 VOT3** to participate in governance

### Governance Proposals

1. A proposer creates a proposal with a VOT3 deposit
2. A **deposit threshold** (percentage of total B3TR supply) must be met for the proposal to become active
3. Community members contribute VOT3 to show support (temperature check)
4. If threshold is reached before waiting period ends, proposal becomes active
5. Voting period opens; quorum required: **30% of total VOT3 supply**
6. If quorum reached and "yes" > "no", proposal succeeds and executes via TimeLock

### Allocation Round Governance

- Weekly allocation rounds where VOT3 holders vote on which X2Earn apps receive B3TR funding
- Uses **Quadratic Funding** formula -- funding influenced more by number of distinct supporters than sum of votes
- Allocation round quorum: **1% of total VOT3 supply**
- If quorum not met, uses last valid round's distribution percentages

### Voter Rewards

- **Vote2Earn Pool**: Rewards all participating voters based on VOT3 balance
- **GM Rewards Pool**: Fixed **5% of weekly emissions**, distributed to voters holding a **GM NFT**

### Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| B3TRGovernor | `0x1c65C25fABe2fc1bCb82f253fA0C916a322f777C` |
| TimeLock | `0x7B7EaF620d88E38782c6491D7Ce0B8D8cF3227e4` |
| VOT3 | `0x76Ca782B59C74d088C7D2Cce2f211BC00836c602` |
| VoterRewards | `0x76Ca782B59C74d088C7D2Cce2f211BC00836c602` |
| Treasury | `0xD5903BCc66e439c753e525F8AF2FeC7be2429593` |

### Contract Addresses (Testnet)

| Contract | Address |
|----------|---------|
| B3TRGovernor | `0xc30b4d0837f7e3706749655d8bde0c0f265dd81b` |
| VOT3 | `0x6e8b4a88d37897fc11f6ba12c805695f1c41f40e` |
| VoterRewards | `0x851ef91801899a4e7e4a3174a9300b3e20c957e8` |
| Treasury | `0x3d531a80c05099c71b02585031f86a2988e0caca` |
| TimeLock | `0x835509222aa67c333a1cbf29bd341e014aba86c9` |

---

## VePassport (Voting Eligibility)

VePassport verifies wallet authenticity (bot vs. real person) for VeBetterDAO allocation round voting. Users must complete **3 sustainable actions in the last 12 rounds** to be eligible.

| Contract | Network | Address |
|----------|---------|---------|
| VePassport | Mainnet | `0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3` |
