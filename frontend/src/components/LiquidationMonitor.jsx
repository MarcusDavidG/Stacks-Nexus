import { motion } from 'framer-motion';
import Button from './Button';

// Mock at-risk positions — replace with indexer data
const MOCK_POSITIONS = [
  { addr: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', borrowed: 10, collateral: 15.2, ratio: 152 },
  { addr: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE', borrowed:  5, collateral:  7.6, ratio: 152 },
  { addr: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', borrowed:  8, collateral: 12.5, ratio: 156 },
];

function ratioColor(r) {
  if (r < 155) return '#f87171';
  if (r < 165) return '#f59e0b';
  return '#4ade80';
}

export default function LiquidationMonitor({ address }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>🚨 Liquidation Monitor</h2>
        <span style={s.badge}>Coming Soon</span>
      </div>

      <p style={s.desc}>
        Positions approaching the 150% minimum collateral ratio. Liquidators earn a
        <strong style={{ color: 'var(--green)' }}> 5% bonus</strong> for closing under-collateralised loans.
      </p>

      <div style={s.list}>
        <div style={s.listHeader}>
          <span>Address</span>
          <span>Borrowed</span>
          <span>Collateral</span>
          <span>Ratio</span>
          <span />
        </div>
        {MOCK_POSITIONS.map((p, i) => (
          <motion.div
            key={p.addr}
            style={s.row}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.07 }}
          >
            <span style={s.addr}>{p.addr.slice(0, 8)}…{p.addr.slice(-4)}</span>
            <span style={s.cell}>{p.borrowed} STX</span>
            <span style={s.cell}>{p.collateral} STX</span>
            <span style={{ ...s.cell, color: ratioColor(p.ratio), fontWeight: 700 }}>{p.ratio}%</span>
            <Button size="sm" variant="danger" disabled>Liquidate</Button>
          </motion.div>
        ))}
      </div>

      <p style={s.note}>* Live data requires on-chain indexer integration</p>
    </motion.section>
  );
}

const s = {
  card:       { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:      { fontSize: '1rem', fontWeight: 600, color: 'var(--text)' },
  badge:      { fontSize: '0.72rem', background: 'rgba(255,107,53,0.12)', color: 'var(--orange)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 20, padding: '0.2rem 0.6rem', fontWeight: 600 },
  desc:       { fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6 },
  list:       { display: 'flex', flexDirection: 'column', gap: 6 },
  listHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem' },
  row:        { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '0.5rem', alignItems: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '0.6rem 0.75rem', border: '1px solid var(--border)' },
  addr:       { fontSize: '0.8rem', color: 'var(--text2)', fontFamily: 'monospace' },
  cell:       { fontSize: '0.85rem', color: 'var(--text)' },
  note:       { fontSize: '0.72rem', color: 'var(--text3)', textAlign: 'center' },
};
