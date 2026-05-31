# Nexus Protocol — Roadmap

## ✅ Shipped
- Core lending pool (deposit, withdraw, borrow, repay) — `lending-pool-v2`
- Daily check-in streak system — `nexus-checkin`
- Community polling / governance — `nexus-polls`
- Frontend: landing page, tabbed app dashboard, light/dark mode
- BNS name resolution — `.btc` names shown throughout UI
- XP / reputation system (frontend)
- Leaderboard, referral, flash loan, liquidation monitor (frontend MVP)
- Rich OG metadata + 1200×630 social preview banner
- Transaction loop: 5,638 on-chain txs, wallet fully utilised

---

## 🔜 Next Up

### SIP-010 Receipt Token (`nxSTX`)
Issue a transferable fungible token when users deposit STX. Represents pool share + accrued yield. Makes positions composable with other Stacks protocols.

### Liquidation Mechanism
On-chain Clarity contract to close under-collateralised loans. Liquidators earn a 5% bonus. Feeds the liquidation monitor UI already in place.

---

## 🗺️ Planned

### Dynamic Interest Rates
Utilisation-based rate model — rates rise as more of the pool is borrowed, fall when liquidity is idle.

### Stacking Rewards Passthrough
Route idle pool liquidity into Stacks PoX Stacking. Share BTC yield with depositors — unique to the Stacks blockchain.

### sBTC Collateral
Accept sBTC as collateral, making Nexus a true Bitcoin-native lending market.

### Flash Loans
Uncollateralised single-block loans for arbitrage, liquidations, and collateral swaps. Frontend UI already built.

### Multi-asset Support
Extend the pool to accept SIP-010 tokens beyond STX.

---

## 💡 Exploring

### Ordinals / Inscription Gating
Hold a specific inscription to unlock boosted rates or extra governance weight.

### Governance Token
Protocol-owned token for on-chain voting on parameter changes (rates, collateral ratios, new assets).

### Referral Program
On-chain referral tracking with XP rewards for bringing new depositors.

### Mobile App
React Native wrapper for Leather/Xverse deep-link support.
