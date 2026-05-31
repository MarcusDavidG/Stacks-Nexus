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

const CYCLES     = Number(process.argv[2] ?? 500);
const DO_CHECKIN = process.argv[3] === 'checkin';
const FEE        = 1_000;
const AMOUNT     = 500;     // 500 uSTX × 2000 = 1 STX deposits; fees 1000 × 2000 = 2 STX → 3 STX total
const TX_DELAY   = 4_000;   // ms between txs — stay under rate limit
const CHAIN_WAIT = 60_000;  // ms to wait when TooMuchChaining is hit

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
async function broadcast(hex: string): Promise<{ txid?: string; error?: string; reason?: string }> {
  const res  = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hex, 'hex'),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { txid: text.replace(/"/g, '') }; }
}

async function getNonce(): Promise<number> {
  const res = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${SENDER_ADDR}/nonces`);
  const data = await res.json() as { possible_next_nonce: number };
  return data.possible_next_nonce;
}

async function getPending(): Promise<number> {
  const res = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${SENDER_ADDR}/mempool?limit=1`);
  const { total } = await res.json() as { total: number };
  return total;
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

// Deposit loop
for (let i = progress.completedCycles; i < CYCLES; i++) {
  process.stdout.write(`\r  Cycle ${i + 1}/${CYCLES} (nonce ${nonce})  `);

  const result = await sendTx(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(AMOUNT)], nonce);

  if (result === 'chaining') {
    // Wait for mempool to drain, then re-fetch nonce and retry same cycle
    console.log(`\n  ⏳ TooMuchChaining — waiting ${CHAIN_WAIT / 1000}s for mempool to clear...`);
    await sleep(CHAIN_WAIT);
    // Poll until pending drops below 10
    let pending = await getPending();
    while (pending >= 10) {
      console.log(`  ⏳ Still ${pending} pending — waiting 30s...`);
      await sleep(30_000);
      pending = await getPending();
    }
    nonce = await getNonce();
    console.log(`  ▶ Resuming at nonce ${nonce}`);
    i--; // retry this cycle
    continue;
  }

  if (result === true) {
    nonce++;
    progress.deposited += AMOUNT;
    progress.completedCycles = i + 1;
    save(progress);
  }

  await sleep(TX_DELAY);
}

console.log(`\n\n✅ Done! ${progress.completedCycles}/${CYCLES} cycles completed.`);
if (existsSync(PROGRESS_FILE)) unlinkSync(PROGRESS_FILE);
