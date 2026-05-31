import { generateWallet, generateNewAccount } from '@stacks/wallet-sdk';
import { getAddressFromPrivateKey } from '@stacks/transactions';
import { config } from 'dotenv';
config();

const wallet0 = await generateWallet({ secretKey: process.env.SENDER_KEY!.trim(), password: '' });
let w = wallet0;
for (let i = 0; i < 8; i++) {
  if (i > 0) w = generateNewAccount(w);
  const key = w.accounts[i].stxPrivateKey;
  const addr = getAddressFromPrivateKey(key);
  console.log(`account ${i}: ${addr}`);
  if (i === 0) console.log(`  private key: ${key}`);
}
