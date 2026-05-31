# Nexus Protocol — Agent Memory File

## Wallet
- **Active address**: `SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM` (account index **0**)
- **Key in `.env`**: raw hex private key stored as `SENDER_KEY` — never committed to git
- Key derivation (if regenerating from mnemonic): `generateWallet(...).accounts[0].stxPrivateKey`

## Transaction Loop Parameters
| Parameter | Value |
|---|---|
| Cycles (deposits) | 2000 |
| Fee per tx | 1,400 uSTX |
| Deposit amount | 1 uSTX |
| Delay between txs | 4,000 ms |
| Total cost | ~2.8 STX (almost entirely gas fees) |
| Estimated duration | ~135 minutes |
| Contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v2` |
| Check-in contract | `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.nexus-checkin` |

## Run a Fresh Round
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

## Fix Stuck Pending Transactions
```bash
cd ~/Stacks-Nexus && npx tsx unstick.ts
```
- Auto-detects all stuck nonces from the mempool API
- Replaces each with a 50,000 uSTX fee tx to guarantee eviction
- Wait ~1 block after running, then restart the loop

Check mempool status:
```bash
curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM/nonces"
curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM/mempool?limit=1"
```

## Run Unattended (survives terminal close)
```bash
cd ~/Stacks-Nexus && nohup ./run-loop.sh > loop.log 2>&1 &
tail -f ~/Stacks-Nexus/loop.log
```

## Key Files
| File | Purpose |
|---|---|
| `loop-txs.ts` | Main transaction loop — account 0, 1,400 uSTX fee, 1 uSTX deposit |
| `unstick.ts` | Auto-detects and replaces stuck pending txs with 50,000 uSTX fee |
| `run-loop.sh` | Auto-restart wrapper for unattended runs |
| `check-accounts.ts` | Derives and prints all account addresses from mnemonic |
| `.env` | Raw hex private key — gitignored, never committed |
| `.loop-progress.json` | Auto-saved loop progress — delete to reset |
| `package.json` | `loop:checkin` = `npx tsx loop-txs.ts 2000 checkin` |

## Important Notes
- `.env` is in `.gitignore` — keys are never pushed to GitHub
- `TooMuchChaining` means >25 unconfirmed txs in mempool — run `unstick.ts` to clear
- The loop auto-pauses and waits when `TooMuchChaining` is detected, then resumes
- Nonce is fetched from `possible_next_nonce` (extended API) — accounts for pending txs
- Check-in failure is non-fatal — loop continues to deposits regardless
