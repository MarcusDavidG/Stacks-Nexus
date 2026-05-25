/**
 * interact.ts - CLI for Nexus Protocol
 *
 * Usage:
 *   npx tsx interact.ts get-deposit <address>
 *   npx tsx interact.ts get-loan    <address>
 *   SENDER_KEY=<hex> npx tsx interact.ts deposit  <stx>
 *   SENDER_KEY=<hex> npx tsx interact.ts withdraw <stx>
 *   SENDER_KEY=<hex> npx tsx interact.ts borrow   <stx> <collateral-stx>
 *   SENDER_KEY=<hex> npx tsx interact.ts repay
 *   SENDER_KEY=<hex> npx tsx interact.ts checkin
 *   npx tsx interact.ts get-streak  <address>
 */
import {
  makeContractCall, PostConditionMode, uintCV, serializeTransaction,
  fetchCallReadOnlyFunction, cvToValue, standardPrincipalCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const POOL_ADDR    = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME    = 'lending-pool-v2'; // v1 has broken withdraw; v2 is correct
const CHECKIN_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CHECKIN_NAME = 'nexus-checkin';
const SENDER_ADDR  = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';

const network   = STACKS_MAINNET;
const senderKey = process.env.SENDER_KEY ?? '';
const FEE       = 2_000;

async function broadcast(hexStr: string) {
  const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hexStr, 'hex'),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

async function getNonce() {
  const res = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${SENDER_ADDR}?proof=0`);
  const { nonce } = await res.json() as { nonce: number };
  return nonce;
}

async function send(addr: string, name: string, fn: string, args: any[]) {
  const nonce = await getNonce();
  const tx = await makeContractCall({
    contractAddress: addr, contractName: name,
    functionName: fn, functionArgs: args,
    senderKey, network,
    postConditionMode: PostConditionMode.Allow,
    fee: FEE, nonce,
  });
  const result = await broadcast(serializeTransaction(tx));
  if (result.error || result.reason) {
    console.error('FAILED:', result.reason ?? result.error);
  } else {
    console.log(`${fn} txid:`, result.txid ?? JSON.stringify(result));
  }
}

async function readOnly(addr: string, name: string, fn: string, args: any[], sender: string) {
  const res = await fetchCallReadOnlyFunction({
    contractAddress: addr, contractName: name,
    functionName: fn, functionArgs: args,
    network, senderAddress: sender,
  });
  return cvToValue(res);
}

const [action, ...args] = process.argv.slice(2);

switch (action) {
  case 'get-deposit':
    console.log('Deposit (uSTX):', await readOnly(POOL_ADDR, POOL_NAME, 'get-deposit', [standardPrincipalCV(args[0])], args[0]));
    break;
  case 'get-loan':
    console.log('Loan:', await readOnly(POOL_ADDR, POOL_NAME, 'get-loan', [standardPrincipalCV(args[0])], args[0]));
    break;
  case 'get-streak':
    console.log('Streak:', await readOnly(CHECKIN_ADDR, CHECKIN_NAME, 'get-streak', [standardPrincipalCV(args[0])], args[0]));
    break;
  case 'deposit':
    await send(POOL_ADDR, POOL_NAME, 'deposit', [uintCV(Number(args[0]) * 1_000_000)]);
    break;
  case 'withdraw':
    await send(POOL_ADDR, POOL_NAME, 'withdraw', [uintCV(Number(args[0]) * 1_000_000)]);
    break;
  case 'borrow':
    await send(POOL_ADDR, POOL_NAME, 'borrow', [uintCV(Number(args[0]) * 1_000_000), uintCV(Number(args[1]) * 1_000_000)]);
    break;
  case 'repay':
    await send(POOL_ADDR, POOL_NAME, 'repay', []);
    break;
  case 'checkin':
    await send(CHECKIN_ADDR, CHECKIN_NAME, 'check-in', []);
    break;
  default:
    console.log('Unknown action:', action);
    console.log('Actions: get-deposit, get-loan, get-streak, deposit, withdraw, borrow, repay, checkin');
}
