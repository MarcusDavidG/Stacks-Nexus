import { makeContractCall, PostConditionMode, uintCV, serializeTransaction } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { config } from 'dotenv';
config();

const POOL_ADDR = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP';
const POOL_NAME = 'lending-pool-v2';

const wallet = generateNewAccount(await generateWallet({ secretKey: process.env.SENDER_KEY!.trim(), password: '' }));
const senderKey = wallet.accounts[1].stxPrivateKey; // SP3VD1Z3...

async function broadcast(hexStr: string) {
  const res = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(hexStr, 'hex'),
  });
  return res.json();
}

for (const nonce of [2004, 2017]) {
  const tx = await makeContractCall({
    contractAddress: POOL_ADDR, contractName: POOL_NAME,
    functionName: 'deposit', functionArgs: [uintCV(1000)],
    senderKey, network: STACKS_MAINNET,
    postConditionMode: PostConditionMode.Allow,
    fee: 10_000, nonce,
  });
  const result = await broadcast(serializeTransaction(tx));
  console.log(`nonce ${nonce}:`, result);
}
