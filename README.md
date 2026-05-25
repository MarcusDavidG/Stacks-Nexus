# Nexus Protocol

**The Connected Lending Protocol on Stacks**

Nexus is a decentralized lending protocol on the Stacks blockchain. Deposit STX to earn yield, borrow against your collateral, build daily streaks, and participate in community governance — all on-chain.

---

## Live on Stacks Mainnet

| Contract | Address | Explorer |
|---|---|---|
| `lending-pool` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool` | [View](https://explorer.hiro.so/txid/0x5f044f3a1c83a809fe83c23d8eb5e89f2adb440f5769f0c601ad43a719851098?chain=mainnet) |
| `nexus-checkin` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-checkin` | [View](https://explorer.hiro.so/txid/0x189bf98e3e4e5d95a3cc39e1268172ffcf015b011a10f16d603552253b2e7818?chain=mainnet) |
| `nexus-polls` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-polls` | [View](https://explorer.hiro.so/txid/0x09629f1506a4063bf2600c1153b1a9b91112d62723495f4eebcd7e2f39904ae5?chain=mainnet) |

---

## Why Nexus?

- **Connected** — Seamlessly links lenders and borrowers in a trustless environment
- **Transparent** — All terms and rates visible on-chain
- **Secure** — Built with Clarity for maximum security and predictability
- **Yield-Generating** — Earn passive income on deposited STX
- **Flexible** — Borrow against your assets without selling
- **Engaging** — Daily check-in streaks, community polls, and on-chain reputation

---

## Architecture

### Smart Contracts

#### `lending-pool` — Core DeFi Protocol
| Function | Description |
|---|---|
| `deposit` | Deposit STX into the lending pool |
| `withdraw` | Withdraw deposited STX |
| `borrow` | Borrow STX against collateral (150% ratio) |
| `repay` | Repay loan + 1% interest, reclaim collateral |
| `get-deposit` | Read user deposit balance |
| `get-loan` | Read user loan details |

#### `nexus-checkin` — Daily Streak System
| Function | Description |
|---|---|
| `check-in` | Record daily check-in, increment streak |
| `get-streak` | Read user streak and total check-in count |

#### `nexus-polls` — Community Governance
| Function | Description |
|---|---|
| `create-poll` | Owner creates a new poll (2 options) |
| `vote` | Cast a vote on an active poll |
| `get-poll` | Read poll results |
| `has-voted` | Check if a user has voted |

### Technology Stack

- **Smart Contracts** — Clarity (Stacks)
- **SDK** — Stacks.js (`@stacks/transactions`, `@stacks/network`, `@stacks/connect`)
- **Frontend** — React + Vite
- **Wallet** — Stacks Connect (Leather / Xverse)
- **Testing** — Vitest + Clarinet SDK

---

## Quick Start

### Prerequisites

- Node.js 18+
- Clarinet CLI
- Stacks wallet (Leather or Xverse)

### Installation

```bash
git clone https://github.com/MarcusDavidG/Stacks-Nexus.git
cd Stacks-Nexus
npm install
cd frontend && npm install && cd ..
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env and set SENDER_KEY to your wallet private key (hex)
```

### Development

```bash
# Clarinet console
clarinet console

# Run tests
clarinet test

# Start frontend
cd frontend && npm run dev
```

---

## Transaction Loop

Sends deposit transactions to the lending pool for on-chain activity tracking.

```bash
# 1000 deposits + check-in + final withdraw (~1002 txs, ~2 STX)
SENDER_KEY=<hex> npm run loop:checkin

# Custom number of cycles
SENDER_KEY=<hex> npm run loop -- 500

# Custom cycles + check-in
SENDER_KEY=<hex> npm run loop -- 500 checkin
```

---

## Interact via CLI

```bash
# Deposit 1 STX
SENDER_KEY=<hex> npx tsx interact.ts deposit 1

# Withdraw 1 STX
SENDER_KEY=<hex> npx tsx interact.ts withdraw 1

# Borrow 1 STX with 1.5 STX collateral
SENDER_KEY=<hex> npx tsx interact.ts borrow 1 1.5

# Repay loan
SENDER_KEY=<hex> npx tsx interact.ts repay

# Check deposit balance
npx tsx interact.ts get-deposit <address>

# Check loan details
npx tsx interact.ts get-loan <address>
```

---

## Deploy Engagement Contracts

```bash
SENDER_KEY=<hex> SENDER_ADDR=<your-stx-address> npm run deploy:engagement
```

## Create a Community Poll

```bash
SENDER_KEY=<hex> npm run seed:poll
```

---

## Roadmap

- [x] Core lending pool (deposit, withdraw, borrow, repay)
- [x] Daily check-in streak system
- [x] Community polling / governance
- [ ] Liquidation mechanism for under-collateralized loans
- [ ] Dynamic interest rates based on utilization
- [ ] Multi-asset support (SIP-010 tokens)
- [ ] XP / reputation system
- [ ] Referral program
- [ ] Governance token
- [ ] Flash loans

---

## Security

- Collateralization ratio enforced on-chain (150% minimum)
- One check-in per block enforced by contract
- One vote per poll per address enforced by contract
- No admin upgrade keys — contracts are immutable once deployed
- Post-condition mode allows transparent STX transfer validation

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

## License

MIT

---

**Nexus — Connecting Capital on Stacks**
