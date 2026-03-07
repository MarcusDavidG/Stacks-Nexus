# Nexus

**The Connected Lending Protocol on Stacks**

Nexus is a decentralized lending protocol on the Stacks blockchain that connects lenders and borrowers seamlessly. Deposit STX to earn yield, or borrow against your collateral with transparent, on-chain terms.

##  Live on Stacks Mainnet

**Contract**: `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool`  
**TX**: `0x75eb01d33d5256b2b4fff3b4c711d1a0d6173e6e58b2c5c3c3867f855806add6`  
**Status**:  Active

[View on Explorer](https://explorer.stacks.co/txid/0x75eb01d33d5256b2b4fff3b4c711d1a0d6173e6e58b2c5c3c3867f855806add6)

##  Why Nexus?

- **Connected**: Seamlessly links lenders and borrowers in a trustless environment
- **Transparent**: All terms and rates visible on-chain
- **Secure**: Built with Clarity for maximum security and predictability
- **Yield-Generating**: Earn passive income on deposited STX
- **Flexible**: Borrow against your assets without selling
- **Decentralized**: No intermediaries, pure DeFi

##  Architecture

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

##  Quick Start

### Prerequisites

- Node.js 18+
- Clarinet CLI
- Stacks wallet (Hiro Wallet or Leather)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus.git
cd nexus

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

##  Usage Examples

### Deposit & Earn

```typescript
import { LendingPoolSDK } from './src/stacks-sdk';

const nexus = new LendingPoolSDK(true); // mainnet
await nexus.deposit(senderKey, 1000000); // Deposit 1 STX, start earning
```

### Borrow Against Collateral

```typescript
await nexus.borrow(senderKey, 500000); // Borrow 0.5 STX
```

### Track Your Position

```typescript
const balance = await nexus.getUserBalance(userAddress);
const stats = await nexus.getPoolStats();
```

##  Roadmap

- [ ] Add liquidation mechanism for under-collateralized loans
- [ ] Implement dynamic interest rates based on utilization
- [ ] Multi-asset support (SIP-010 tokens)
- [ ] Governance token for protocol decisions
- [ ] Flash loan functionality
- [ ] Risk management dashboard
- [ ] Automated market maker integration

##  Security

- Collateralization ratio enforced on-chain
- Input validation for all functions
- Access control for sensitive operations
- Comprehensive test coverage

##  Contract Statistics

- **Total Deposits**: Track via `get-pool-stats`
- **Total Borrows**: Track via `get-pool-stats`
- **Available Liquidity**: Calculated on-chain
- **Active Users**: Monitored via analytics

##  Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

##  License

MIT License

##  Links

- [Stacks Explorer](https://explorer.stacks.co/txid/0x75eb01d33d5256b2b4fff3b4c711d1a0d6173e6e58b2c5c3c3867f855806add6)
- [Contract Address](https://explorer.stacks.co/address/SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool)
- [Stacks Builder Rewards](https://talent.app/~/earn/stacks-builder-rewards-mar)

---

**Nexus - Connecting Capital on Stacks** 
