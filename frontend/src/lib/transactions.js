import { openContractCall } from '@stacks/connect';
import { uintCV, boolCV, stringAsciiCV, PostConditionMode } from '@stacks/transactions';
import { network, FEE, CONTRACTS, toMicro } from './contracts';

function call(contract, fn, args, onFinish, onCancel) {
  openContractCall({
    contractAddress: contract.addr,
    contractName: contract.name,
    functionName: fn,
    functionArgs: args,
    network,
    fee: FEE,
    postConditionMode: PostConditionMode.Allow,
    onFinish,
    onCancel,
  });
}

export const txDeposit   = (amt, cb, err) => call(CONTRACTS.pool,    'deposit',   [uintCV(toMicro(amt))], cb, err);
export const txWithdraw  = (amt, cb, err) => call(CONTRACTS.pool,    'withdraw',  [uintCV(toMicro(amt))], cb, err);
export const txBorrow    = (amt, col, cb, err) => call(CONTRACTS.pool, 'borrow',  [uintCV(toMicro(amt)), uintCV(toMicro(col))], cb, err);
export const txRepay     = (cb, err)      => call(CONTRACTS.pool,    'repay',     [], cb, err);
export const txCheckIn   = (cb, err)      => call(CONTRACTS.checkin, 'check-in',  [], cb, err);
export const txVote      = (id, choice, cb, err) => call(CONTRACTS.polls, 'vote', [uintCV(id), boolCV(choice)], cb, err);
