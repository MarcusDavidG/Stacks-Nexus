/**
 * loop-txs.ts - High-volume transaction loop for Nexus Protocol
 *
 * Strategy: send deposits rapidly (one per ~5s), then withdraw all at end.
 * Deposits confirm independently; single withdraw at the end clears balance.
 *
 * Usage:
 *   SENDER_KEY=<hex> npx tsx loop-txs.ts [cycles] [checkin]
 */
import {
  makeContractCall, PostConditionMode, uintCV, serializeTransaction,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const POOL_ADDR    = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME    = 'lending-pool';
const CHECKIN_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME = 'nexus-checkin';
const SENDER_ADDR  = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';

const network    = STACKS_MAINNET;
const senderKey  = process.env.SENDER_KEY!;
const CYCLES     = Number(process.argv[2] ?? 100);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE        = 2_000;   // 0.002 STX per tx
const AMOUNT     = 1_000;   // 0.001 STX per deposit
const TX_DELAY   = 3_000;   // 3s between txs (safe for mempool)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function broadcast(hexStr: string): Promise<{ txid?: string; error?: string; reason?: string }> {
  const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hexStr, 'hex'),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

async function getNonce(): Promise<number> {
  const res = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${SENDER_ADDR}?proof=0`);
  const { nonce } = await res.json() as { nonce: number };
  return nonce;
}

async function sendTx(addr: string, name: string, fn: string, args: any[], nonce: number): Promise<boolean> {
  try {
    const tx = await makeContractCall({
      contractAddress: addr, contractName: name,
      functionName: fn, functionArgs: args,
      senderKey, network,
      postConditionMode: PostConditionMode.Allow,
      fee: FEE, nonce,
    });
    const result = await broadcast(serializeTransaction(tx));
    if (result.error || result.reason) {
      console.error(`  ❌ [${fn}] nonce:${nonce} - ${result.reason ?? result.error}`);
      return false;
    }
    console.log(`  ✅ [${fn}] nonce:${nonce} | txid: ${result.txid}`);
    return true;
  } catch (e: any) {
    console.error(`  ❌ [${fn}] ERROR: ${e.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
let nonce = await getNonce();
const totalTxs = CYCLES + (DO_CHECKIN ? 1 : 0) + 1; // deposits + checkin + 1 final withdraw
const totalFees = (totalTxs * FEE / 1_000_000).toFixed(4);

console.log(`\n⚡ Nexus Loop Starting`);
console.log(`   Cycles:     ${CYCLES} deposits`);
console.log(`   Check-in:   ${DO_CHECKIN}`);
console.log(`   Start nonce:${nonce}`);
console.log(`   Total txs:  ~${totalTxs}`);
console.log(`   Total fees: ~${totalFees} STX`);
console.log(`   Est. time:  ~${Math.ceil(totalTxs * TX_DELAY / 60000)} min\n`);

if (DO_CHECKIN) {
  await sendTx(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', [], nonce++);
  await sleep(TX_DELAY);
}

// Send all deposits sequentially with incrementing nonce
let deposited = 0;
for (let i = 0; i < CYCLES; i++) {
  process.stdout.write(`\r  Deposit ${i + 1}/${CYCLES} (nonce ${nonce})...`);
  const ok = await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce++);
  if (ok) deposited++;
  await sleep(TX_DELAY);
}

console.log(`\n\n  ${deposited}/${CYCLES} deposits sent. Waiting 2 min for confirmations before withdraw...\n`);
await sleep(120_000);

// Single withdraw for total accumulated amount
if (deposited > 0) {
  const withdrawAmount = deposited * AMOUNT;
  console.log(`  Withdrawing ${withdrawAmount} uSTX (${withdrawAmount / 1e6} STX)...`);
  // Re-fetch nonce in case of any drift
  nonce = await getNonce();
  await sendTx(POOL_ADDR, POOL_NAME, 'withdraw', [uintCV(withdrawAmount)], nonce);
}

console.log(`\n✅ Done! Sent ~${deposited + (DO_CHECKIN ? 1 : 0) + 1} transactions.`);
