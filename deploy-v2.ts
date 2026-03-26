import { makeContractDeploy, broadcastTransaction, AnchorMode, ClarityVersion } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { readFileSync } from 'fs';

const senderKey = process.env.SENDER_KEY!;
const codeBody = readFileSync('./contracts/lending-pool-v2.clar', 'utf8');

const tx = await makeContractDeploy({
  contractName: 'lending-pool-v8',
  codeBody,
  senderKey,
  network: STACKS_MAINNET,
  anchorMode: AnchorMode.Any,
  fee: 50_000,
  clarityVersion: ClarityVersion.Clarity2,
});

const result = await broadcastTransaction({ transaction: tx, network: STACKS_MAINNET });
if ('error' in result) {
  console.error('Deploy FAILED:', result.error, result.reason);
} else {
  console.log('Deploy txid:', result.txid);
  console.log('Contract:', `SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v8`);
}
