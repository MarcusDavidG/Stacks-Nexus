# Nexus Protocol — Agent Memory File

## Wallet
- **Active address**: `SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM` (account index **0**)
- **Key in `.env`**: raw hex private key as `SENDER_KEY`
- Key derivation: `generateWallet(...).accounts[0].stxPrivateKey` via `@stacks/wallet-sdk`

## Transaction Loop Parameters
| Parameter | Value |
|---|---|
| Cycles (deposits) | 2000 |
| Fee per tx | 1,000 uSTX |
| Deposit amount | 500 uSTX |
| Delay between txs | 4,000 ms |
| Total cost | ~3 STX (2 STX fees + 1 STX deposits) |
| Estimated duration | ~135 minutes |
| Contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v2` |
| Check-in contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-checkin` |

## Run a Fresh Round (1 check-in + 2000 deposits, ~3 STX)
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
> curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM/nonces"
> curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM/mempool?limit=5"
> ```

## Auto-Restart Loop (runs unattended, survives crashes)
```bash
cd ~/Stacks-Nexus && ./run-loop.sh
```
- Restarts automatically on any crash/error (10s delay between restarts)
- Stops cleanly once all 2000 cycles complete
- Always resumes from last saved cycle via `.loop-progress.json`

### Run in background (survives terminal close)
```bash
cd ~/Stacks-Nexus && nohup ./run-loop.sh > loop.log 2>&1 &
```
Check progress:
```bash
tail -f ~/Stacks-Nexus/loop.log
```

## Key Files
| File | Purpose |
|---|---|
| `loop-txs.ts` | Main transaction loop script |
| `run-loop.sh` | Auto-restart wrapper — use this for unattended runs |
| `unstick.ts` | Replace stuck pending txs with higher fee |
| `check-accounts.ts` | Verify which account index maps to which address |
| `.env` | Raw hex private key as SENDER_KEY |
| `.loop-progress.json` | Auto-saved loop progress (delete to reset) |
| `package.json` | `loop:checkin` script = `npx tsx loop-txs.ts 2000 checkin` |
