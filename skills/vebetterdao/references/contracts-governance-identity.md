# VeBetterDAO Contracts — Governance & Identity

## When to use

Use when the user asks about: B3TRGovernor, proposals, VoterRewards, GalaxyMember, Treasury, TimeLock, RelayerRewardsPool, GrantsManager, B3TRMultiSig, VeBetterPassport, signaling, entity linking, delegation, contract upgradeability, or UUPS proxy pattern.

Full source: [github.com/vechain/vebetterdao-contracts](https://github.com/vechain/vebetterdao-contracts)
Auto-generated docs: [vechain.github.io/vebetterdao-contracts](https://vechain.github.io/vebetterdao-contracts/)

---

## B3TRGovernor

Main governance contract. Community creates proposals, deposits VOT3, votes with quadratic voting, and executes through TimeLock.

| Function | Description |
|----------|-------------|
| `propose(...)` | Create proposal with deposit requirement and start round |
| `deposit(proposalId, amount)` | Contribute VOT3 to activate proposal |
| `castVote(proposalId, support)` | Vote: 0=against, 1=for, 2=abstain |
| `castVoteWithReason(proposalId, support, reason)` | Vote with reason string |
| `queue(proposalId)` | Prepare approved proposal for execution |
| `execute(proposalId)` | Execute via TimeLock |
| `cancel(proposalId)` | Cancel proposal |
| `withdraw(proposalId)` | Recover deposits after voting |
| `getQuadraticVotingPower(account, timepoint)` | Quadratic voting power |
| `toggleQuadraticVoting(roundId)` | Enable/disable per round |

Proposal types: `STANDARD` (0) and `GRANT` (1) with type-specific thresholds.

| Role | Can |
|------|-----|
| `GOVERNOR_FUNCTIONS_SETTINGS_ROLE` | Whitelist callable functions |
| `PROPOSAL_EXECUTOR_ROLE` | Execute proposals |
| `PROPOSAL_STATE_MANAGER_ROLE` | Track proposal development |
| `PAUSER_ROLE` | Pause contract |

Integrates with VeBetterPassport for voter identity verification.

## VoterRewards

Calculates and distributes rewards to voters based on voting power and Galaxy Member NFT levels.

| Function | Description |
|----------|-------------|
| `registerVote(voter, votingPower, roundId)` | Records vote with quadratic-weight calculation |
| `claimReward(cycle, voter)` | Claim cycle-specific rewards |
| `getReward(cycle, voter)` | View base reward amount |
| `getGMReward(cycle, voter)` | View GM bonus reward |
| `getRelayerFee(cycle, voter)` | Relayer fee for auto-voting claims |
| `setLevelToMultiplier(level, multiplier)` | Queue multiplier change for next cycle |
| `setLevelToMultiplierNow(level, multiplier)` | Apply multiplier immediately |
| `toggleQuadraticRewarding(cycle)` | Enable/disable quadratic rewarding |

| Role | Can |
|------|-----|
| `VOTE_REGISTRAR_ROLE` | Register votes |
| `DEFAULT_ADMIN_ROLE` | Set multipliers, scaling |

Separate GM rewards pool (v5+). Relayer fee integration (v6).

## GalaxyMember (NFT)

ERC-721 with level progression, node attachment, and voting rewards multiplier.

| Function | Description |
|----------|-------------|
| `freeMint()` | Mint level 1 if user participated in governance |
| `upgrade(tokenId)` | Advance level by paying B3TR |
| `select(tokenId)` | Select token for voting rewards multiplier |
| `selectFor(address, tokenId)` | Admin selects for user |
| `attachNode(tokenId, nodeId)` | Attach Stargate NFT for bonus level |
| `detachNode(tokenId, nodeId)` | Remove attached node |
| `setMaxLevel(level)` | Set maximum upgrade level |
| `setB3TRtoUpgradeToLevel(costs)` | Define B3TR cost per level |

| Role | Can |
|------|-----|
| `MINTER_ROLE` | Minting |
| `PAUSER_ROLE` | Pause/unpause |
| `NODES_MANAGER_ROLE` | Node settings |

V6 replaced node management with Stargate NFT integration.

## Treasury

Manages DAO assets. Receives emissions + unallocated funds.

| Function | Description |
|----------|-------------|
| `transferB3TR(to, amount)` | Transfer B3TR |
| `transferVOT3(to, amount)` | Transfer VOT3 |
| `transferVET(to, amount)` | Transfer VET |
| `transferVTHO(to, amount)` | Transfer VTHO |
| `transferTokens(token, to, amount)` | Generic ERC-20 transfer (with limits) |
| `transferNFT(collection, to, tokenId)` | ERC-721 transfer |
| `convertB3TR(amount)` | B3TR → VOT3 |
| `convertVOT3(amount)` | VOT3 → B3TR |
| `setTransferLimitVET(limit)` | Set VET transfer cap |
| `setTransferLimitToken(token, limit)` | Set per-token transfer cap |

All transfers require `GOVERNANCE_ROLE` and contract must be unpaused.

**Transfer limits** (per operation, governance-updatable): 200,000 VET, 200,000 B3TR, 3,000,000 VTHO, 50,000 VOT3. Cannot transfer non-native or non ERC-721/ERC-20 tokens.

## TimeLock

Executes governance actions from B3TRGovernor with a mandatory time delay. B3TRGovernor should be the sole proposer and executor.

## RelayerRewardsPool

Manages rewards for relayers performing auto-voting on behalf of users.

| Function | Description |
|----------|-------------|
| `claimRewards(roundId, relayer)` | Claim earned rewards |
| `deposit(amount, roundId)` | Fund the pool |
| `registerRelayerAction(relayer, voter, roundId, action)` | Log vote/claim action |
| `calculateRelayerFee(totalReward)` | Compute fee deduction |
| `setVoteWeight()` / `setClaimWeight()` | Adjust action weights |
| `setRelayerFeePercentage()` / `setFeeCap()` | Configure fee structure |
| `setEarlyAccessBlocks()` | Define early access window |
| `registerRelayer(relayer)` / `unregisterRelayer(relayer)` | Manage relayer access |

| Role | Can |
|------|-----|
| `POOL_ADMIN_ROLE` | Pool administration, relayer management |

## GrantsManager

Milestone-based grant distribution.

| Function | Description |
|----------|-------------|
| `createMilestones(proposalId, milestones)` | Create milestones with IPFS metadata |
| `approveMilestones(proposalId)` | Validate milestone completion |
| `rejectMilestones(proposalId)` | Deny milestones |
| `claimMilestone(proposalId, milestoneIndex)` | Distribute funds for approved milestone |
| `grantState(proposalId)` | Returns: rejected / in development / completed |

| Role | Can |
|------|-----|
| `GRANTS_APPROVER_ROLE` | Approve milestones |
| `GRANTS_REJECTOR_ROLE` | Reject milestones |
| `GOVERNANCE_ROLE` | Protocol governance |

## B3TRMultiSig

Multi-signature wallet requiring multiple owner confirmations (max 50 owners).

| Function | Description |
|----------|-------------|
| `submitTransaction(to, value, data)` | Create pending transaction |
| `confirmTransaction(txId)` | Owner approves |
| `executeTransaction(txId)` | Execute when threshold met |
| `revokeConfirmation(txId)` | Withdraw approval |
| `addOwner(owner)` / `removeOwner(owner)` | Manage owners |
| `changeRequirement(count)` | Adjust confirmation threshold |

## VeBetterPassport

Sybil resistance contract. Determines if a wallet is a real person based on participation score, blacklisting, GM holdings, and entity linking. Used by XAllocationVoting and B3TRGovernor for voter eligibility.

**Core identity checks:**

| Function | Description |
|----------|-------------|
| `isPerson(user)` | Returns `(bool person, string reason)` — checks score, blacklist, GM level |
| `isPersonAtTimepoint(user, timepoint)` | Same check at a specific block |
| `isCheckEnabled(checkType)` | Whether a specific check is active |
| `isWhitelisted(user)` / `isBlacklisted(user)` | Direct status |
| `isPassportWhitelisted(passport)` / `isPassportBlacklisted(passport)` | Checks linked entities too |

**Participation scoring:**

| Function | Description |
|----------|-------------|
| `registerAction(user, appId)` | Register sustainable action (called by apps) |
| `registerActionForRound(user, appId, round)` | Register for specific round |
| `userRoundScore(user, round)` | Score in a specific round |
| `userTotalScore(user)` | Lifetime score |
| `userRoundScoreApp(user, round, appId)` | Per-app per-round score |
| `getCumulativeScoreWithDecay(user, lastRound)` | Decayed cumulative score: `f(t) = a * (1-r)^t` |
| `thresholdPoPScore()` | Required score to be considered a person |
| `appSecurity(appId)` | App security level: `LOW` / `MEDIUM` / `HIGH` |
| `securityMultiplier(security)` | Score multiplier per security level |

**Entity linking** (link multiple wallets to one passport):

| Function | Description |
|----------|-------------|
| `linkEntityToPassport(passport)` | Request linking (entity calls) |
| `acceptEntityLink(entity)` | Passport accepts link |
| `removeEntityLink(entity)` | Remove link (either side) |
| `getPassportForEntity(entity)` | Resolve entity → passport |
| `getEntitiesLinkedToPassport(passport)` | All linked entities |
| `isEntity(user)` / `isPassport(user)` | Check role |
| `maxEntitiesPerPassport()` | Configurable cap |

**Delegation** (delegate personhood to another address):

| Function | Description |
|----------|-------------|
| `delegatePassport(delegatee)` | Request delegation |
| `acceptDelegation(delegator)` | Accept delegation |
| `revokeDelegation()` | Revoke (either side) |
| `getDelegatee(delegator)` / `getDelegator(delegatee)` | Resolve |

**Signaling** (flag suspicious users):

| Function | Description |
|----------|-------------|
| `signalUser(user)` | Signal a user (DEFAULT_ADMIN_ROLE) |
| `signalUserWithReason(user, reason)` | Signal with reason (SIGNALER_ROLE) |
| `resetUserSignalsWithReason(user, reason)` | Reset signals (RESET_SIGNALER_ROLE) |
| `assignSignalerToApp(appId, user)` | Assign app-specific signaler |
| `signaledCounter(user)` | Times user was signaled |
| `signalingThreshold()` | Threshold for auto-blacklist |

| Role | Can |
|------|-----|
| `SETTINGS_MANAGER_ROLE` | Configure thresholds, decay, security |
| `WHITELISTER_ROLE` | Whitelist/blacklist users |
| `ACTION_REGISTRAR_ROLE` | Register actions |
| `ACTION_SCORE_MANAGER_ROLE` | Manage scoring |
| `SIGNALER_ROLE` | Signal users with reason |
| `RESET_SIGNALER_ROLE` | Reset user signals |
| `ROLE_GRANTER` | Grant roles |

## B3TRProxy

EIP-1967 upgradeable proxy. Delegates all calls to the current implementation address. Read implementation via storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`.

---

## Contract Upgradeability

All upgradeable contracts use **UUPS proxy pattern** with ERC-7201 storage layout.

| Contract | Upgradeable | Authorizer |
|----------|-------------|------------|
| B3TR | No | -- |
| B3TRProxy | No | -- |
| B3TRMultiSig | No | -- |
| B3TRGovernor | Yes | Governance OR DEFAULT_ADMIN |
| Emissions | Yes | UPGRADER_ROLE |
| GalaxyMember | Yes | UPGRADER_ROLE |
| TimeLock | Yes | UPGRADER_ROLE |
| Treasury | Yes | UPGRADER_ROLE |
| VOT3 | Yes | UPGRADER_ROLE |
| VoterRewards | Yes | UPGRADER_ROLE |
| X2EarnApps | Yes | UPGRADER_ROLE |
| X2EarnCreator | Yes | UPGRADER_ROLE |
| X2EarnRewardsPool | Yes | UPGRADER_ROLE |
| XAllocationPool | Yes | UPGRADER_ROLE |
| XAllocationVoting | Yes | UPGRADER_ROLE |
| GrantsManager | Yes | UPGRADER_ROLE |
| DBAPool | Yes | UPGRADER_ROLE |
| RelayerRewardsPool | Yes | UPGRADER_ROLE |
| VeBetterPassport | Yes | UPGRADER_ROLE |

B3TRGovernor stores logic in external libraries (GovernorClockLogic, GovernorConfigurator, GovernorDepositLogic, GovernorFunctionRestrictionsLogic, GovernorProposalLogic, GovernorQuorumLogic, GovernorStateLogic, GovernorVotesLogic). To upgrade library logic: deploy new library → deploy new implementation linking the library → `upgradeToAndCall`.
