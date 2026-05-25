// Shared contract config and helpers
import { STACKS_MAINNET } from '@stacks/network';
import { fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';

export const network = STACKS_MAINNET;
export const FEE = 2000;

export const CONTRACTS = {
  pool:    { addr: 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP', name: 'lending-pool' },
  checkin: { addr: 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP', name: 'nexus-checkin' },
  polls:   { addr: 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP', name: 'nexus-polls' },
};

export const toMicro = (stx) => Math.floor(parseFloat(stx) * 1_000_000);
export const fromMicro = (u) => (Number(u) / 1_000_000).toFixed(4);

export async function readOnly(contract, fn, args, sender) {
  try {
    const res = await fetchCallReadOnlyFunction({
      contractAddress: contract.addr,
      contractName: contract.name,
      functionName: fn,
      functionArgs: args,
      network,
      senderAddress: sender || contract.addr,
    });
    return cvToValue(res);
  } catch { return null; }
}
