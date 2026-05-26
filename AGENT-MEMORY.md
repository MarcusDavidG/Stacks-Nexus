# Nexus Protocol — Agent Memory File

## Wallet
- **Mnemonic**: stored in `.env` as `SENDER_KEY`
- **Active address**: `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP` (account index **1**, not 0)
- Key derivation: `generateNewAccount(wallet).accounts[1].stxPrivateKey` via `@stacks/wallet-sdk`

## Transaction Loop Parameters
| Parameter | Value |
|---|---|
| Cycles (deposits) | 500 |
| Fee per tx | 1,000 uSTX |
| Deposit amount | 1,000 uSTX |
| Delay between txs | 3,000 ms |
| Total cost per round | ~0.5 STX |
| Estimated duration | ~25 minutes |
| Contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v2` |
| Check-in contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-checkin` |

## Run a Fresh Round (1 check-in + 2000 deposits, ~2 STX)
```bash
cd ~/Stacks-Nexus
rm -f .loop-progress.json
npm run loop:checkin
```

## Resume an Interrupted Round
```bash
cd ~/Stacks-Nexus
npm run loop:checkin
```
Progress is auto-saved to `.loop-progress.json`. Re-running resumes from last completed cycle.

## Reset and Start Over
```bash
rm ~/Stacks-Nexus/.loop-progress.json
```

## Fix Stuck Pending Transactions
If you see `TooMuchChaining` errors and transactions are stuck in the mempool:
```bash
cd ~/Stacks-Nexus
npx tsx unstick.ts
```
Then wait ~30 seconds and re-run the loop.

> **Note**: Edit `unstick.ts` and update `STUCK_NONCES` to the actual stuck nonce values before running.
> Check current nonce and mempool with:
> ```bash
> curl -s "https://api.mainnet.hiro.so/v2/accounts/SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP?proof=0"
> curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP/mempool?limit=5"
> ```

## Key Files
| File | Purpose |
|---|---|
| `loop-txs.ts` | Main transaction loop script |
| `unstick.ts` | Replace stuck pending txs with higher fee |
| `check-accounts.ts` | Verify which account index maps to which address |
| `.env` | Wallet mnemonic and sender address |
| `.loop-progress.json` | Auto-saved loop progress (delete to reset) |
| `package.json` | `loop:checkin` script = `npx tsx loop-txs.ts 500 checkin` |
