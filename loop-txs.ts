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
import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { config } from 'dotenv';
config();

const POOL_ADDR    = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME    = 'lending-pool-v2'; // v1 has broken withdraw; v2 is correct
const CHECKIN_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME = 'nexus-checkin';
const SENDER_ADDR  = 'SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM';
const PROGRESS_FILE = '.loop-progress.json';

const network    = STACKS_MAINNET;
const rawKey     = process.env.SENDER_KEY!;

// Derive hex private key from mnemonic if needed
function isMnemonic(k: string) { return k.trim().includes(' '); }
async function resolveKey(k: string): Promise<string> {
  if (!isMnemonic(k)) return k;
  const wallet = generateNewAccount(await generateWallet({ secretKey: k.trim(), password: '' }));
  return wallet.accounts[0].stxPrivateKey; // account 0 = SP2F07TCJ...
}
const senderKey = await resolveKey(rawKey);
const CYCLES     = Number(process.argv[2] ?? 500);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE        = 1_000;
const AMOUNT     = 1_000;
const TX_DELAY   = 3_000;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Progress tracking ─────────────────────────────────────────────────────────
interface Progress { completedCycles: number; checkinDone: boolean; deposited: number; }

function loadProgress(cycles: number): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) as Progress & { target?: number };
      if (p.target === cycles) {
        console.log(`\n⏩ Resuming from cycle ${p.completedCycles}/${cycles} (${p.deposited} uSTX deposited)\n`);
        return p;
      }
      // Different target — start fresh
      unlinkSync(PROGRESS_FILE);
    } catch {}
  }
  return { completedCycles: 0, checkinDone: false, deposited: 0 };
}

function saveProgress(p: Progress, cycles: number) {
  writeFileSync(PROGRESS_FILE, JSON.stringify({ ...p, target: cycles }, null, 2));
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
  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    // Plain string txid on success
    return { txid: text.replace(/"/g, '') };
  }
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
const progress = loadProgress(CYCLES);
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
  saveProgress(progress, CYCLES);
  await sleep(TX_DELAY);
}

// Deposit loop
for (let i = progress.completedCycles; i < CYCLES; i++) {
  process.stdout.write(`\r  Cycle ${i + 1}/${CYCLES} (nonce ${nonce})  `);
  const ok = await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce++);
  if (ok) {
    progress.deposited += AMOUNT;
    progress.completedCycles = i + 1;
    saveProgress(progress, CYCLES);
  }
  await sleep(TX_DELAY);
}

// Final withdraw skipped — lending-pool v1 withdraw sends back to contract (known bug).
// Deposits accumulate in the pool. All deposit txs count toward leaderboard.
console.log(`\n\n  ✅ ${progress.deposited}/${CYCLES} deposits complete. STX remains in pool.`);
clearProgress();
console.log(`\n✅ Done! Total cycles completed: ${progress.completedCycles}`);
