/**
 * seed-poll.ts — Create the first community poll on nexus-polls
 *
 * Usage (after nexus-polls is confirmed on-chain):
 *   SENDER_KEY=<hex> POLLS_CONTRACT=<address.nexus-polls> npx tsx seed-poll.ts
 */
import {
  makeContractCall, broadcastTransaction,
  AnchorMode, PostConditionMode, stringAsciiCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const network   = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY!;
const [addr, name] = (process.env.POLLS_CONTRACT ?? '').split('.');

if (!addr || !name) {
  console.error('Set POLLS_CONTRACT=<address>.<contract-name>');
  process.exit(1);
}

const tx = await makeContractCall({
  contractAddress: addr,
  contractName: name,
  functionName: 'create-poll',
  functionArgs: [
    stringAsciiCV('What should Nexus build next?'),
    stringAsciiCV('Liquidation engine'),
    stringAsciiCV('Multi-asset support'),
  ],
  senderKey, network,
  anchorMode: AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
  fee: 2_000,
});

const result = await broadcastTransaction({ transaction: tx, network });
if ('error' in result) {
  console.error('FAILED:', result.reason ?? result.error);
} else {
  console.log('✅ Poll created — txid:', result.txid);
}
