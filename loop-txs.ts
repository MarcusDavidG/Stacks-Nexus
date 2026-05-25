/**
 * loop-txs.ts - High-volume transaction loop for Nexus Protocol
 * Supports pause/resume — progress saved to .loop-progress.json
 *
 * Usage:
 *   SENDER_KEY=<hex> npm run loop:checkin          # 1000 cycles + checkin
 *   SENDER_KEY=<hex> npm run loop -- 500           # custom cycles
 *   SENDER_KEY=<hex> npm run loop -- 500 checkin   # custom + checkin
 *
 * Pause:  Ctrl+C
 * Resume: run the same command again — it continues from last saved cycle
 * Reset:  delete .loop-progress.json
 */
import {
  makeContractCall, PostConditionMode, uintCV, serializeTransaction,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

const POOL_ADDR    = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME    = 'lending-pool';
const CHECKIN_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME = 'nexus-checkin';
const SENDER_ADDR  = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const PROGRESS_FILE = '.loop-progress.json';

const network    = STACKS_MAINNET;
const senderKey  = process.env.SENDER_KEY!;
const CYCLES     = Number(process.argv[2] ?? 1000);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE        = 2_000;
const AMOUNT     = 1_000;
const TX_DELAY   = 3_000;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Progress tracking ─────────────────────────────────────────────────────────
interface Progress { completedCycles: number; checkinDone: boolean; deposited: number; }

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) as Progress;
      console.log(`\n⏩ Resuming from cycle ${p.completedCycles}/${CYCLES} (${p.deposited} uSTX deposited)\n`);
      return p;
    } catch {}
  }
  return { completedCycles: 0, checkinDone: false, deposited: 0 };
}

function saveProgress(p: Progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function clearProgress() {
  if (existsSync(PROGRESS_FILE)) {
    unlinkSync(PROGRESS_FILE);
  }
}

// ── Network helpers ───────────────────────────────────────────────────────────
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
      console.error(`  ❌ [${fn}] nonce:${nonce} — ${result.reason ?? result.error}`);
      return false;
    }
    console.log(`  ✅ [${fn}] nonce:${nonce} | ${result.txid}`);
    return true;
  } catch (e: any) {
    console.error(`  ❌ [${fn}] ERROR: ${e.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const progress = loadProgress();
let nonce = await getNonce();

const remaining = CYCLES - progress.completedCycles;
console.log(`⚡ Nexus Loop`);
console.log(`   Target:    ${CYCLES} cycles | Remaining: ${remaining}`);
console.log(`   Check-in:  ${DO_CHECKIN} | Done: ${progress.checkinDone}`);
console.log(`   Nonce:     ${nonce} | Fee: ${FEE} uSTX/tx`);
console.log(`   Est. time: ~${Math.ceil(remaining * TX_DELAY / 60000)} min`);
console.log(`   Pause:     Ctrl+C (progress saved, rerun to resume)\n`);

// Graceful shutdown — save progress on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏸  Paused. Run the same command to resume.');
  process.exit(0);
});

// Check-in (once per session if not done)
if (DO_CHECKIN && !progress.checkinDone) {
  await sendTx(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', [], nonce++);
  progress.checkinDone = true;
  saveProgress(progress);
  await sleep(TX_DELAY);
}

// Deposit loop
for (let i = progress.completedCycles; i < CYCLES; i++) {
  process.stdout.write(`\r  Cycle ${i + 1}/${CYCLES} (nonce ${nonce})  `);
  const ok = await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce++);
  if (ok) {
    progress.deposited += AMOUNT;
    progress.completedCycles = i + 1;
    saveProgress(progress);
  }
  await sleep(TX_DELAY);
}

// Final withdraw
console.log(`\n\n  All ${CYCLES} deposits sent. Waiting 2 min before withdraw...`);
await sleep(120_000);

nonce = await getNonce();
console.log(`  Withdrawing ${progress.deposited} uSTX...`);
await sendTx(POOL_ADDR, POOL_NAME, 'withdraw', [uintCV(progress.deposited)], nonce);

clearProgress();
console.log(`\n✅ Done! Total cycles completed: ${progress.completedCycles}`);
