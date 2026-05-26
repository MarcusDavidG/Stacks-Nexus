import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export default function FlashLoanCard({ address }) {
  const [amount, setAmount] = useState('100');

  const fee = amount ? (parseFloat(amount) * 0.0009).toFixed(4) : '0';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>⚡ Flash Loans</h2>
        <span style={s.badge}>Coming Soon</span>
      </div>

      <p style={s.desc}>
        Borrow any amount of STX within a single block — no collateral required.
        Must be repaid + fee within the same transaction.
      </p>

      <div style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Borrow Amount (STX)</label>
          <input
            type="number" min="1" step="1" value={amount}
            onChange={e => setAmount(e.target.value)}
            style={s.input}
          />
        </div>
        <div style={s.feeRow}>
          <span style={s.feeLabel}>Flash fee (0.09%)</span>
          <span style={s.feeVal}>{fee} STX</span>
        </div>
        <Button fullWidth disabled>Execute Flash Loan (Coming Soon)</Button>
      </div>

      <div style={s.useCases}>
        <div style={s.useCaseTitle}>Use cases</div>
        <div style={s.pills}>
          {['Arbitrage', 'Liquidations', 'Collateral Swap', 'Self-Liquidation'].map(u => (
            <span key={u} style={s.pill}>{u}</span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

const s = {
  card:         { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:        { fontSize: '1rem', fontWeight: 600, color: 'var(--text)' },
  badge:        { fontSize: '0.72rem', background: 'rgba(255,107,53,0.12)', color: 'var(--orange)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 20, padding: '0.2rem 0.6rem', fontWeight: 600 },
  desc:         { fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6 },
  form:         { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  field:        { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:        { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.75rem', color: 'var(--text)', fontSize: '0.95rem', fontFamily: 'inherit' },
  feeRow:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0', borderTop: '1px solid var(--border)' },
  feeLabel:     { color: 'var(--text2)' },
  feeVal:       { color: 'var(--orange)', fontWeight: 700 },
  useCases:     { borderTop: '1px solid var(--border)', paddingTop: '0.75rem' },
  useCaseTitle: { fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  pills:        { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pill:         { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.78rem', color: 'var(--text2)' },
};
