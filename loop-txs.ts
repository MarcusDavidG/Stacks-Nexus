import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CONTRACT_NAME = 'lending-pool-v8';
const network = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY!;
const CYCLES = Number(process.argv[2] ?? 50);
const FEE = 20_000; // 0.02 STX per tx → 50 cycles × 2 txs × 0.02 = 2 STX in fees
const DELAY_MS = 20_000;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function call(functionName: string, args: any[], retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tx = await makeContractCall({
        contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_NAME,
        functionName, functionArgs: args, senderKey, network,
        anchorMode: AnchorMode.Any, postConditionMode: PostConditionMode.Allow,
        fee: FEE,
      });
      const result = await broadcastTransaction({ transaction: tx, network });
      if ('error' in result) {
        console.error(`[${functionName}] FAILED (attempt ${attempt}):`, result.reason);
        if (attempt < retries) await sleep(10_000);
        continue;
      }
      console.log(`[${functionName}] txid: ${result.txid}`);
      return true;
    } catch (e: any) {
      console.error(`[${functionName}] ERROR (attempt ${attempt}):`, e.message ?? e);
      if (attempt < retries) await sleep(10_000);
    }
  }
  return false;
}

console.log(`Running ${CYCLES} withdraw→deposit cycles (~${CYCLES * 2 * FEE / 1_000_000} STX in fees)...\n`);

const AMOUNT = 1_000; // 0.001 STX deposit

for (let i = 0; i < CYCLES; i++) {
  console.log(`── Cycle ${i + 1}/${CYCLES} ──`);
  const ok = await call('deposit', [uintCV(AMOUNT)]);
  await sleep(DELAY_MS);
  if (ok) await call('withdraw', [uintCV(AMOUNT)]);
  await sleep(DELAY_MS);
}

console.log('\nDone!');
