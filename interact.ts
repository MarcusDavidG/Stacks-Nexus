import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const CONTRACT_NAME = 'lending-pool-v8';
const network = STACKS_MAINNET;

async function getDeposit(user: string) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-deposit',
    functionArgs: [standardPrincipalCV(user)],
    network,
    senderAddress: user,
  });
  console.log('Deposit balance (uSTX):', cvToValue(result));
}

async function getLoan(user: string) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-loan',
    functionArgs: [standardPrincipalCV(user)],
    network,
    senderAddress: user,
  });
  console.log('Loan info:', cvToValue(result));
}

async function deposit(senderKey: string, amountSTX: number) {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'deposit',
    functionArgs: [uintCV(amountSTX * 1_000_000)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 3000,
  });
  const result = await broadcastTransaction({ transaction: tx, network });
  if ('error' in result) { console.error('broadcast error:', result.error, result.reason); process.exit(1); }
  console.log('deposit txid:', result.txid);
}

async function borrow(senderKey: string, amountSTX: number, collateralSTX: number) {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'borrow',
    functionArgs: [uintCV(amountSTX * 1_000_000), uintCV(collateralSTX * 1_000_000)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
  const result = await broadcastTransaction({ transaction: tx, network });
  console.log('borrow txid:', result.txid);
}

async function repay(senderKey: string) {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'repay',
    functionArgs: [],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
  const result = await broadcastTransaction({ transaction: tx, network });
  console.log('repay txid:', result.txid);
}

async function withdraw(senderKey: string, amountSTX: number) {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'withdraw',
    functionArgs: [uintCV(amountSTX * 1_000_000)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });
  const result = await broadcastTransaction({ transaction: tx, network });
  console.log('withdraw txid:', result.txid);
}

// Usage:
//   npx tsx interact.ts get-deposit <address>
//   npx tsx interact.ts get-loan    <address>
//   SENDER_KEY=<hex> npx tsx interact.ts deposit  <stx>
//   SENDER_KEY=<hex> npx tsx interact.ts borrow   <stx> <collateral-stx>
//   SENDER_KEY=<hex> npx tsx interact.ts repay
//   SENDER_KEY=<hex> npx tsx interact.ts withdraw <stx>

const [action, ...args] = process.argv.slice(2);
const senderKey = process.env.SENDER_KEY ?? '';

switch (action) {
  case 'get-deposit': await getDeposit(args[0]); break;
  case 'get-loan':    await getLoan(args[0]);    break;
  case 'deposit':     await deposit(senderKey, Number(args[0])); break;
  case 'borrow':      await borrow(senderKey, Number(args[0]), Number(args[1])); break;
  case 'repay':       await repay(senderKey); break;
  case 'withdraw':    await withdraw(senderKey, Number(args[0])); break;
  default: console.log('Unknown action:', action);
}
