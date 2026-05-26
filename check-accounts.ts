import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { getAddressFromPrivateKey } from '@stacks/transactions';
import { config } from 'dotenv';
config();

const wallet0 = await generateWallet({ secretKey: process.env.SENDER_KEY!.trim(), password: '' });
const wallet1 = generateNewAccount(wallet0);
for (let i = 0; i < 2; i++) {
  const key = wallet1.accounts[i].stxPrivateKey;
  const addr = getAddressFromPrivateKey(key);
  console.log(`account ${i}: ${addr}`);
}
