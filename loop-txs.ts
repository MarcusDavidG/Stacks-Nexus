/**
 * loop-txs.ts - Deposit/withdraw cycling for Nexus Protocol
 *
 * Strategy: batch deposits in one block, then batch withdraws in the next block.
 * This avoids withdraw-before-deposit-confirms failures.
 *
 * Usage:
 *   SENDER_KEY=<hex> npx tsx loop-txs.ts [cycles]
 *   SENDER_KEY=<hex> npx tsx loop-txs.ts [cycles] checkin
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

const network   = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY!;
const CYCLES    = Number(process.argv[2] ?? 50);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE       = 2_000;   // 0.002 STX per tx
const AMOUNT    = 1_000;   // 0.001 STX per deposit
const TX_DELAY  = 5_000;   // 5s between txs in same block
const BLOCK_WAIT = 65_000; // ~65s — wait for next block before withdrawing

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

async function getDepositBalance(): Promise<number> {
  const res = await fetch(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${POOL_ADDR}/${POOL_NAME}/get-deposit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: SENDER_ADDR,
        arguments: [`0x0516${Buffer.from(SENDER_ADDR.slice(1).replace(/[^0-9A-Fa-f]/g, ''), 'hex').toString('hex')}`],
      }),
    }
  );
  // Use Hiro API balance endpoint instead - simpler
  const balRes = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${SENDER_ADDR}.${POOL_NAME}?proof=0`);
  return 0; // fallback - we track it ourselves
}

async function sendTx(
  addr: string, name: string, fn: string, args: any[], nonce: number
): Promise<boolean> {
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
      console.error(`  [${fn}] FAILED nonce:${nonce} -`, result.reason ?? result.error);
      return false;
    }
    console.log(`  [${fn}] nonce:${nonce} txid:${result.txid}`);
    return true;
  } catch (e: any) {
    console.error(`  [${fn}] ERROR:`, e.message);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
let nonce = await getNonce();
let totalDeposited = 0; // track accumulated deposit in uSTX

console.log(`\nNexus loop: ${CYCLES} cycles | check-in: ${DO_CHECKIN}`);
console.log(`Start nonce: ${nonce} | Fee: ${FEE} uSTX | Deposit: ${AMOUNT} uSTX`);
console.log(`Strategy: deposit N txs -> wait for block -> withdraw all\n`);

if (DO_CHECKIN) {
  console.log('[ Check-in ]');
  await sendTx(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', [], nonce++);
  await sleep(TX_DELAY);
}

// Run in batches of 10: deposit x10, wait for block, withdraw x10
const BATCH = 10;
const batches = Math.ceil(CYCLES / BATCH);

for (let b = 0; b < batches; b++) {
  const batchSize = Math.min(BATCH, CYCLES - b * BATCH);
  console.log(`\n=== Batch ${b + 1}/${batches} (${batchSize} deposits) ===`);

  // Phase 1: send all deposits
  console.log('Phase 1: Depositing...');
  for (let i = 0; i < batchSize; i++) {
    await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce++);
    totalDeposited += AMOUNT;
    if (i < batchSize - 1) await sleep(TX_DELAY);
  }

  // Phase 2: wait for block confirmation
  console.log(`\nWaiting ${BLOCK_WAIT / 1000}s for block confirmation...`);
  await sleep(BLOCK_WAIT);

  // Phase 3: withdraw the batch amount
  console.log('Phase 2: Withdrawing...');
  const withdrawAmount = batchSize * AMOUNT;
  await sendTx(POOL_ADDR, POOL_NAME, 'withdraw', [uintCV(withdrawAmount)], nonce++);
  totalDeposited -= withdrawAmount;

  await sleep(TX_DELAY);
}

console.log(`\nDone! Total txs sent: ~${CYCLES + Math.ceil(CYCLES / BATCH) + (DO_CHECKIN ? 1 : 0)}`);
