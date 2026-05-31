/**
 * loop-txs.ts — Nexus Protocol transaction loop
 * Pause: Ctrl+C  |  Resume: rerun  |  Reset: delete .loop-progress.json
 */
import {
  makeContractCall, PostConditionMode, uintCV, serializeTransaction,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { config } from 'dotenv';
config();

const POOL_ADDR     = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME     = 'lending-pool-v2';
const CHECKIN_ADDR  = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME  = 'nexus-checkin';
const SENDER_ADDR   = 'SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM';
const PROGRESS_FILE = '.loop-progress.json';

const network = STACKS_MAINNET;
const rawKey  = process.env.SENDER_KEY!;

function isMnemonic(k: string) { return k.trim().includes(' '); }
async function resolveKey(k: string): Promise<string> {
  if (!isMnemonic(k)) return k;
  const wallet = await generateWallet({ secretKey: k.trim(), password: '' });
  return wallet.accounts[0].stxPrivateKey; // account 0 = SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM
}
const senderKey = await resolveKey(rawKey);

const CYCLES      = Number(process.argv[2] ?? 500);
const DO_CHECKIN  = process.argv[3] === 'checkin';
const FEE         = 2_500;  // 2,500 uSTX × 2000 = 5 STX — spends remaining balance on gas
const AMOUNT      = 1;      // 1 uSTX deposit — negligible
const TX_DELAY    = 300;    // ms between txs within a batch
const BATCH_SIZE  = 20;     // send 20 txs then wait for confirmation
const BATCH_WAIT  = 15_000; // initial wait before polling
const POLL_INTERVAL = 15_000; // poll every 15s until pending < 5

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Progress ──────────────────────────────────────────────────────────────────
interface Progress { completedCycles: number; checkinDone: boolean; deposited: number; }

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) as Progress & { target?: number };
      if (p.target === CYCLES) {
        console.log(`\n⏩ Resuming from cycle ${p.completedCycles}/${CYCLES}\n`);
        return p;
      }
      unlinkSync(PROGRESS_FILE);
    } catch {}
  }
  return { completedCycles: 0, checkinDone: false, deposited: 0 };
}

function save(p: Progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify({ ...p, target: CYCLES }, null, 2));
}

// ── Network ───────────────────────────────────────────────────────────────────
async function fetchWithRetry(url: string, opts?: RequestInit, retries = 5): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try { return await fetch(url, opts); } catch {
      if (i < retries - 1) await sleep(5_000 * (i + 1));
    }
  }
  throw new Error(`fetch failed after ${retries} retries: ${url}`);
}

async function broadcast(hex: string): Promise<{ txid?: string; error?: string; reason?: string }> {
  const res  = await fetchWithRetry('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hex, 'hex'),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { txid: text.replace(/"/g, '') }; }
}

async function waitForMempool() {
  await sleep(BATCH_WAIT);
  let pending = await getPending();
  while (pending >= 5) {
    process.stdout.write(`\r  ⏳ ${pending} pending — waiting...  `);
    await sleep(POLL_INTERVAL);
    pending = await getPending();
  }
}

async function getPending(): Promise<number> {
  const res = await fetchWithRetry(`https://api.mainnet.hiro.so/extended/v1/address/${SENDER_ADDR}/mempool?limit=1`);
  const { total } = await res.json() as { total: number };
  return total;
}

async function getNonce(): Promise<number> {
  const res = await fetchWithRetry(`https://api.mainnet.hiro.so/extended/v1/address/${SENDER_ADDR}/nonces`);
  const data = await res.json() as { possible_next_nonce: number };
  return data.possible_next_nonce;
}

// Returns true on success, false on permanent failure, 'chaining' on TooMuchChaining
async function sendTx(
  addr: string, name: string, fn: string, args: any[], nonce: number
): Promise<true | false | 'chaining'> {
  try {
    const tx = await makeContractCall({
      contractAddress: addr, contractName: name,
      functionName: fn, functionArgs: args,
      senderKey, network,
      postConditionMode: PostConditionMode.Allow,
      fee: FEE, nonce,
    });
    const result = await broadcast(serializeTransaction(tx));
    if (result.reason === 'TooMuchChaining') return 'chaining';
    if (result.error || result.reason) {
      console.error(`  ❌ [${fn}] nonce:${nonce} — ${result.reason ?? result.error}`);
      return false;
    }
    console.log(`  ✅ [${fn}] nonce:${nonce} | ${result.txid ?? 'ok'}`);
    return true;
  } catch (e: any) {
    console.error(`  ❌ [${fn}] ERROR: ${e.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const progress = loadProgress();
let nonce = await getNonce();

console.log(`⚡ Nexus Loop`);
console.log(`   Target: ${CYCLES} | Remaining: ${CYCLES - progress.completedCycles}`);
console.log(`   Nonce: ${nonce} | Fee: ${FEE} uSTX | Delay: ${TX_DELAY}ms`);
console.log(`   Pause: Ctrl+C\n`);

process.on('SIGINT', () => { console.log('\n\n⏸  Paused.'); process.exit(0); });

// Check-in once — skip gracefully if already done or rejected
if (DO_CHECKIN && !progress.checkinDone) {
  const ok = await sendTx(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', [], nonce);
  if (ok === true) nonce++;
  // Mark done regardless — don't let a failed check-in block the deposit loop
  progress.checkinDone = true;
  save(progress);
  await sleep(TX_DELAY);
}

// Deposit loop — send in batches of BATCH_SIZE, wait for confirmation between batches
for (let i = progress.completedCycles; i < CYCLES; ) {
  const batchEnd = Math.min(i + BATCH_SIZE, CYCLES);
  const batchCount = batchEnd - i;

  // Send batch
  for (let j = 0; j < batchCount; j++) {
    const cycle = i + j;
    process.stdout.write(`\r  Cycle ${cycle + 1}/${CYCLES} (nonce ${nonce})  `);
    const result = await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce);
    if (result === true) {
      nonce++;
      progress.deposited += AMOUNT;
      progress.completedCycles = cycle + 1;
      save(progress);
    } else if (result === 'chaining') {
      console.log(`\n  ⏳ TooMuchChaining — waiting for block (~10 min)...`);
      await waitForMempool();
      nonce = await getNonce();
    }
    if (j < batchCount - 1) await sleep(TX_DELAY);
  }

  i = progress.completedCycles;

  // Wait for batch to confirm before sending next batch
  if (i < CYCLES) {
    console.log(`\n  ⏸  Batch done (${i}/${CYCLES}) — waiting for mempool to clear...`);
    await waitForMempool();
    nonce = await getNonce();
    console.log(`  ▶ Next batch at nonce ${nonce}\n`);
  }
}

console.log(`\n\n✅ Done! ${progress.completedCycles}/${CYCLES} cycles completed.`);
if (existsSync(PROGRESS_FILE)) unlinkSync(PROGRESS_FILE);
