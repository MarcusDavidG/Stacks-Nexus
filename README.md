# Lending Pool - Stacks Smart Contract

A decentralized lending pool protocol on the Stacks blockchain enabling users to deposit STX, borrow against collateral, and earn interest.

## 🚀 Mainnet Deployment

**Contract Address**: `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool`  
**Transaction ID**: `0x75eb01d33d5256b2b4fff3b4c711d1a0d6173e6e58b2c5c3c3867f855806add6`  
**Deployed By**: `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP`

## ✨ Features

- **Deposit & Withdraw**: Users can deposit STX to earn interest
- **Borrow & Repay**: Borrow STX against deposited collateral
- **Interest Accrual**: Automatic interest calculation for lenders
- **Collateralization**: Secure borrowing with collateral requirements
- **Pool Management**: Track total deposits, borrows, and available liquidity

## 🏗 Architecture

### Smart Contract Functions

1. `deposit` - Deposit STX into the lending pool
2. `withdraw` - Withdraw deposited STX plus interest
3. `borrow` - Borrow STX against collateral
4. `repay` - Repay borrowed amount with interest
5. `get-user-balance` - Check user's deposit balance
6. `get-pool-stats` - View pool statistics

### Technology Stack

- **Smart Contract**: Clarity
- **SDK**: Stacks.js (@stacks/transactions, @stacks/network)
- **Frontend**: React + Vite
- **Wallet Integration**: Stacks Connect
- **Testing**: Vitest

## 🔧 Quick Start

### Prerequisites

- Node.js 18+
- Clarinet CLI
- Stacks wallet (Hiro Wallet or Leather)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lending-pool-standalone

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Development

```bash
# Run Clarinet console
clarinet console

# Run tests
clarinet test

# Start frontend
cd frontend
npm run dev
```

### Testing with SDK

```bash
# Run SDK tests
npm test
```

## 📖 Usage Examples

### Deposit STX

```typescript
import { LendingPoolSDK } from './src/stacks-sdk';

const sdk = new LendingPoolSDK(true); // true for mainnet
await sdk.deposit(senderKey, 1000000); // Deposit 1 STX
```

### Borrow STX

```typescript
await sdk.borrow(senderKey, 500000); // Borrow 0.5 STX
```

### Check Balance

```typescript
const balance = await sdk.getUserBalance(userAddress);
console.log(`Balance: ${balance} microSTX`);
```

## 🎯 Roadmap

- [ ] Add liquidation mechanism for under-collateralized loans
- [ ] Implement dynamic interest rates based on utilization
- [ ] Multi-asset support (SIP-010 tokens)
- [ ] Governance token for protocol decisions
- [ ] Flash loan functionality
- [ ] Risk management dashboard
- [ ] Automated market maker integration

## 🔐 Security

- Collateralization ratio enforced on-chain
- Input validation for all functions
- Access control for sensitive operations
- Comprehensive test coverage

## 📊 Contract Statistics

- **Total Deposits**: Track via `get-pool-stats`
- **Total Borrows**: Track via `get-pool-stats`
- **Available Liquidity**: Calculated on-chain
- **Active Users**: Monitored via analytics

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License

## 🔗 Links

- [Stacks Explorer](https://explorer.stacks.co/txid/0x75eb01d33d5256b2b4fff3b4c711d1a0d6173e6e58b2c5c3c3867f855806add6)
- [Contract Address](https://explorer.stacks.co/address/SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool)
- [Stacks Builder Rewards](https://talent.app/~/earn/stacks-builder-rewards-mar)

---

**Built for the Stacks ecosystem** 🚀
