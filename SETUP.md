# Nexus Protocol — Setup Guide

## Prerequisites
- Node.js 18+
- Clarinet CLI
- Stacks wallet (Leather or Xverse)

## Installation
```bash
git clone https://github.com/MarcusDavidG/Stacks-Nexus.git
cd Stacks-Nexus
npm install
cd frontend && npm install && cd ..
```

## Environment Setup
```bash
cp .env.example .env
# Edit .env — set SENDER_KEY to your wallet's raw hex private key
# Never commit .env — it is gitignored
```

To derive your private key from a mnemonic:
```bash
npx tsx check-accounts.ts
```

## Frontend Development
```bash
cd frontend && npm run dev
```

## Frontend Deployment (Vercel)
- Root directory: `./` (repo root)
- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`

## Smart Contract Development
```bash
clarinet console   # interactive REPL
clarinet test      # run tests
```

## Transaction Loop
```bash
# Fresh run
rm -f .loop-progress.json && npm run loop:checkin

# Resume interrupted run
npm run loop:checkin

# Fix stuck pending transactions
npx tsx unstick.ts
```

## Live Contracts (Mainnet)
| Contract | Address |
|---|---|
| `lending-pool-v2` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v2` |
| `nexus-checkin` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-checkin` |
| `nexus-polls` | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-polls` |

## Security
- `.env` is gitignored — never commit private keys
- Contracts are immutable once deployed — no admin upgrade keys
- Collateral ratio enforced on-chain (150% minimum)
