# Nexus Protocol — Agent Memory File

## Wallet
- **Active address**: `SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM` (account index **0**)
- **Key in `.env`**: raw hex private key stored as `SENDER_KEY` — gitignored, never committed
- Key derivation (if regenerating): `generateWallet(...).accounts[0].stxPrivateKey`

## Completed Run Summary
| Metric | Value |
|---|---|
| Total on-chain transactions | **5,638** |
| Final nonce | 5,636 |
| Remaining balance | ~0.002 STX (exhausted) |
| Fee per tx | 2,500 uSTX |
| Deposit per tx | 1 uSTX |
| Contract used | `lending-pool-v2` |

## Transaction Loop Parameters
| Parameter | Value |
|---|---|
| Cycles | 2000 |
| Fee per tx | 2,500 uSTX |
| Deposit amount | 1 uSTX |
| Batch size | 20 txs |
| Delay within batch | 300 ms |
| Batch wait | poll until pending < 5 |
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
cd ~/Stacks-Nexus && npm run loop:checkin
```
Progress is auto-saved to `.loop-progress.json`. Re-running resumes from last completed cycle.

## Fix Stuck Pending Transactions
```bash
cd ~/Stacks-Nexus && npx tsx unstick.ts
```
- Auto-detects all stuck **and missing** nonces (dropped txs that block the queue)
- Replaces each with a 50,000 uSTX fee tx to guarantee eviction
- Safe to run while the loop is waiting — loop resumes automatically

Check mempool status:
```bash
curl -s "https://api.mainnet.hiro.so/extended/v1/address/SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM/nonces"
```

## Run Unattended (survives terminal close)
```bash
cd ~/Stacks-Nexus && nohup ./run-loop.sh > loop.log 2>&1 &
tail -f ~/Stacks-Nexus/loop.log
```

## Key Files
| File | Purpose |
|---|---|
| `loop-txs.ts` | Main loop — batch mode, polls mempool, retries on network errors |
| `unstick.ts` | Fills missing nonces + replaces stuck pending txs with 50k fee |
| `run-loop.sh` | Auto-restart wrapper for unattended runs |
| `check-accounts.ts` | Derives and prints account addresses from mnemonic |
| `.env` | Raw hex private key — gitignored, never committed |
| `.loop-progress.json` | Auto-saved loop progress — delete to reset |
| `package.json` | `loop:checkin` = `npx tsx loop-txs.ts 2000 checkin` |

## Important Notes
- `.env` is in `.gitignore` — keys are never pushed to GitHub ✅
- `TooMuchChaining` = >25 unconfirmed txs — loop polls and waits automatically
- Missing nonces (dropped txs) block the entire queue — `unstick.ts` handles this
- Nonce sourced from `possible_next_nonce` (extended API) — always accurate
- All network calls have retry logic — survives temporary timeouts
- Check-in failure is non-fatal — loop continues to deposits regardless
