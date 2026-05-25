/**
 * deploy-engagement.ts — Deploy nexus-checkin and nexus-polls to mainnet
 *
 * Usage:
 *   SENDER_KEY=<hex> npx tsx deploy-engagement.ts
 */
import { readFileSync } from 'fs';
import {
  makeContractDeploy, broadcastTransaction,
  AnchorMode, PostConditionMode,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const network   = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY!;
const FEE       = 50_000; // 0.05 STX per deployment

const contracts = [
  { name: 'nexus-checkin', path: 'contracts/nexus-checkin.clar' },
  { name: 'nexus-polls',   path: 'contracts/nexus-polls.clar'   },
];

for (const { name, path } of contracts) {
  console.log(`\nDeploying ${name}…`);
  const codeBody = readFileSync(path, 'utf8');
  const tx = await makeContractDeploy({
    contractName: name,
    codeBody,
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: FEE,
  });
  const result = await broadcastTransaction({ transaction: tx, network });
  if ('error' in result) {
    console.error(`  FAILED: ${result.reason ?? result.error}`);
  } else {
    console.log(`  ✅ txid: ${result.txid}`);
    console.log(`  Contract: ${result.txid} — confirm on explorer then update App.jsx addresses`);
  }
}

console.log('\nAll deployments submitted.');
