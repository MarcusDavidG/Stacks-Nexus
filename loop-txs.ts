/**
 * loop-txs.ts — Optimized deposit/withdraw cycling
 * Fee reduced from 20,000 → 2,000 µSTX (10× more efficient)
 *
 * Usage:
 *   SENDER_KEY=<hex> npx tsx loop-txs.ts [cycles]
 *   SENDER_KEY=<hex> npx tsx loop-txs.ts [cycles] checkin   ← also seeds check-ins
 */
import {
  makeContractCall, broadcastTransaction,
  AnchorMode, PostConditionMode, uintCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const POOL_ADDR     = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME     = 'lending-pool';
const CHECKIN_ADDR  = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME  = 'nexus-checkin';

const network    = STACKS_MAINNET;
const senderKey  = process.env.SENDER_KEY!;
const CYCLES     = Number(process.argv[2] ?? 50);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE        = 2_000;   // 0.002 STX — was 20,000
const DELAY_MS   = 15_000;  // 15s between txs
const AMOUNT     = 1_000;   // 0.001 STX deposit amount

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function call(
  addr: string, name: string,
  fn: string, args: any[],
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tx = await makeContractCall({
        contractAddress: addr, contractName: name,
        functionName: fn, functionArgs: args,
        senderKey, network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: FEE,
      });
      const result = await broadcastTransaction({ transaction: tx, network });
      if ('error' in result) {
        console.error(`[${fn}] FAILED (attempt ${attempt}):`, result.reason);
        if (attempt < retries) await sleep(10_000);
        continue;
      }
      console.log(`[${fn}] txid: ${result.txid}`);
      return true;
    } catch (e: any) {
      console.error(`[${fn}] ERROR (attempt ${attempt}):`, e.message ?? e);
      if (attempt < retries) await sleep(10_000);
    }
  }
  return false;
}

const totalTxs = CYCLES * 2 + (DO_CHECKIN ? 1 : 0);
const totalFees = (totalTxs * FEE / 1_000_000).toFixed(4);
console.log(`\nRunning ${CYCLES} deposit/withdraw cycles`);
console.log(`Check-in: ${DO_CHECKIN ? 'yes (1 tx)' : 'no'}`);
console.log(`Total txs: ~${totalTxs} | Total fees: ~${totalFees} STX\n`);

// Optional: check-in once at the start
if (DO_CHECKIN) {
  console.log('── Check-in ──');
  await call(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', []);
  await sleep(DELAY_MS);
}

for (let i = 0; i < CYCLES; i++) {
  console.log(`── Cycle ${i + 1}/${CYCLES} ──`);
  const ok = await call(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)]);
  await sleep(DELAY_MS);
  if (ok) await call(POOL_ADDR, POOL_NAME, 'withdraw', [uintCV(AMOUNT)]);
  await sleep(DELAY_MS);
}

console.log('\nDone!');
