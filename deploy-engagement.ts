/**
 * deploy-engagement.ts — Deploy nexus-checkin and nexus-polls to mainnet
 * Usage: SENDER_KEY=<hex> SENDER_ADDR=<stx-address> npx tsx deploy-engagement.ts
 */
import { readFileSync } from 'fs';
import { makeContractDeploy, PostConditionMode, serializeTransaction } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const network    = STACKS_MAINNET;
const senderKey  = process.env.SENDER_KEY!;
const senderAddr = process.env.SENDER_ADDR!;
const FEE        = 100_000;

const contracts = [
  { name: 'nexus-checkin', path: 'contracts/nexus-checkin.clar' },
  { name: 'nexus-polls',   path: 'contracts/nexus-polls.clar'   },
];

async function broadcast(hexStr: string): Promise<any> {
  const bytes = Buffer.from(hexStr, 'hex');
  const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: bytes,
  });
  const text = await res.text();
  try { return { status: res.status, ...JSON.parse(text) }; }
  catch { return { status: res.status, raw: text }; }
}

const nonceRes = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${senderAddr}?proof=0`);
const { nonce: baseNonce } = await nonceRes.json() as { nonce: number };
console.log(`Current nonce: ${baseNonce}\n`);

for (let i = 0; i < contracts.length; i++) {
  const { name, path } = contracts[i];
  const nonce = baseNonce + i;
  console.log(`Deploying ${name} (nonce ${nonce})…`);
  const codeBody = readFileSync(path, 'utf8');
  const tx = await makeContractDeploy({
    contractName: name, codeBody, senderKey, network,
    postConditionMode: PostConditionMode.Allow,
    fee: FEE, nonce,
  });
  const result = await broadcast(serializeTransaction(tx));
  if (result.status === 200) {
    console.log(`  ✅ txid: ${result.txid ?? result}`);
  } else {
    console.error(`  ❌ FAILED:`, result.raw ?? result.reason ?? result.error);
  }
}

console.log('\nDone. Wait ~10 min for confirmation on explorer.hiro.so');
