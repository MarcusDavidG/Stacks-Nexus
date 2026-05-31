/**
 * unstick.ts — Replace all pending txs with higher-fee versions to clear the mempool.
 * Reads stuck nonces from the API automatically.
 */
import { makeContractCall, PostConditionMode, uintCV, serializeTransaction } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { config } from 'dotenv';
config();

const SENDER_ADDR = 'SP2F07TCJ006F5E9DF9AGTGSW4TH9TCAMTYYWK0EM';
const POOL_ADDR   = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME   = 'lending-pool-v2';
const senderKey   = process.env.SENDER_KEY!.trim();
const BUMP_FEE    = 10_000; // high enough to evict stuck txs

async function broadcast(hex: string) {
  const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hex, 'hex'),
  });
  return res.json();
}

// Fetch stuck nonces from mempool API
const r = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${SENDER_ADDR}/nonces`);
const { detected_mempool_nonces, possible_next_nonce } = await r.json() as {
  detected_mempool_nonces: number[];
  possible_next_nonce: number;
};

if (detected_mempool_nonces.length === 0) {
  console.log('✅ No stuck transactions found.');
  process.exit(0);
}

console.log(`Found ${detected_mempool_nonces.length} stuck nonces: ${detected_mempool_nonces.join(', ')}`);
console.log(`Replacing with fee=${BUMP_FEE} uSTX...\n`);

for (const nonce of detected_mempool_nonces) {
  const tx = await makeContractCall({
    contractAddress: POOL_ADDR, contractName: POOL_NAME,
    functionName: 'deposit', functionArgs: [uintCV(1)],
    senderKey, network: STACKS_MAINNET,
    postConditionMode: PostConditionMode.Allow,
    fee: BUMP_FEE, nonce,
  });
  const result = await broadcast(serializeTransaction(tx)) as any;
  if (result.txid) {
    console.log(`✅ nonce ${nonce} replaced → ${result.txid}`);
  } else {
    console.log(`❌ nonce ${nonce} failed: ${result.reason ?? result.error}`);
  }
  await new Promise(r => setTimeout(r, 500));
}

console.log('\nDone. Wait ~1 block for replacements to confirm, then run the loop.');
