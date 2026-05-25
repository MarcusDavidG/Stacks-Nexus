import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { txDeposit, txWithdraw, txBorrow, txRepay } from '../lib/transactions';

export default function LendingPanel({ address, loan, onTx, onError }) {
  const [depositAmt, setDeposit]   = useState('1');
  const [withdrawAmt, setWithdraw] = useState('1');
  const [borrowAmt, setBorrow]     = useState('1');
  const [colAmt, setCol]           = useState('1.5');
  const [loading, setLoading]      = useState('');

  const wrap = (key, fn) => {
    if (!address) return onError('Connect your wallet first.');
    setLoading(key);
    fn(
      (data) => { setLoading(''); onTx(data.txId); },
      ()     => { setLoading(''); }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={s.card}
    >
      <div style={s.tabs}>
        <Tab label="Deposit & Withdraw">
          <div style={s.row}>
            <Field label="Amount (STX)" value={depositAmt} onChange={setDeposit}>
              <Button disabled={!address || loading === 'deposit'} onClick={() => wrap('deposit', (ok, err) => txDeposit(depositAmt, ok, err))}>
                {loading === 'deposit' ? 'Pending…' : 'Deposit'}
              </Button>
            </Field>
            <Field label="Amount (STX)" value={withdrawAmt} onChange={setWithdraw}>
              <Button variant="secondary" disabled={!address || loading === 'withdraw'} onClick={() => wrap('withdraw', (ok, err) => txWithdraw(withdrawAmt, ok, err))}>
                {loading === 'withdraw' ? 'Pending…' : 'Withdraw'}
              </Button>
            </Field>
          </div>
        </Tab>
        <Tab label="Borrow & Repay">
          <div style={s.row}>
            <div style={s.col}>
              <Field label="Borrow (STX)" value={borrowAmt} onChange={setBorrow} />
              <Field label="Collateral (STX, min 1.5×)" value={colAmt} onChange={setCol}>
                <Button disabled={!address || loading === 'borrow'} onClick={() => wrap('borrow', (ok, err) => txBorrow(borrowAmt, colAmt, ok, err))}>
                  {loading === 'borrow' ? 'Pending…' : 'Borrow'}
                </Button>
              </Field>
            </div>
            <div style={{ ...s.col, justifyContent: 'center', gap: 12 }}>
              <p style={s.note}>Repays full loan + 1% interest and returns your collateral.</p>
              <Button variant="secondary" disabled={!address || !loan || loading === 'repay'} onClick={() => wrap('repay', (ok, err) => txRepay(ok, err))}>
                {loading === 'repay' ? 'Pending…' : 'Repay Loan'}
              </Button>
            </div>
          </div>
        </Tab>
      </div>
    </motion.section>
  );
}

function Tab({ label, children }) {
  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#c0c0d0', marginBottom: '1.25rem' }}>{label}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 180 }}>
      <label style={{ fontSize: '0.78rem', color: '#5a5a70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type="number" min="0.000001" step="0.1" value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#e8e8f0', fontSize: '0.95rem', fontFamily: 'inherit' }}
      />
      {children}
    </div>
  );
}

const s = {
  card: { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  tabs: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  row:  { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  col:  { display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 180 },
  note: { fontSize: '0.85rem', color: '#5a5a70', lineHeight: 1.5 },
};
