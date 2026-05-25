/**
 * seed-poll.ts - Create the first community poll on nexus-polls
 * Usage (after nexus-polls is confirmed on-chain):
 *   SENDER_KEY=<hex> npx tsx seed-poll.ts
 */
import {
  makeContractCall, PostConditionMode, stringAsciiCV, uintCV, serializeTransaction,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const POLLS_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POLLS_NAME = 'nexus-polls';
const SENDER_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';

const network   = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY!;

const nonceRes = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${SENDER_ADDR}?proof=0`);
const { nonce } = await nonceRes.json() as { nonce: number };

const tx = await makeContractCall({
  contractAddress: POLLS_ADDR,
  contractName: POLLS_NAME,
  functionName: 'create-poll',
  functionArgs: [
    stringAsciiCV('What should Nexus build next?'),
    stringAsciiCV('Liquidation engine'),
    stringAsciiCV('Multi-asset support'),
  ],
  senderKey, network,
  postConditionMode: PostConditionMode.Allow,
  fee: 2_000, nonce,
});

const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/octet-stream' },
  body: Buffer.from(serializeTransaction(tx), 'hex'),
});
const result = await res.json();
if (result.error) {
  console.error('FAILED:', result.reason ?? result.error);
} else {
  console.log('Poll created - txid:', result.txid);
}
