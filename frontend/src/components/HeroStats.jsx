import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CONTRACT = 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP.lending-pool-v2';

export default function HeroStats() {
  const [tvl, setTvl] = useState(null);

  useEffect(() => {
    fetch(`https://api.mainnet.hiro.so/v2/accounts/${CONTRACT}?proof=0`)
      .then(r => r.json())
      .then(d => setTvl(d.balance ? (Number(BigInt(d.balance)) / 1_000_000).toFixed(2) : null))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Value Locked', value: tvl ?? '…', unit: 'STX', color: '#7c6fff' },
    { label: 'Collateral Ratio',   value: '150',        unit: '%',  color: '#4ade80' },
    { label: 'Interest Rate',      value: '1',          unit: '%',  color: '#f59e0b' },
    { label: 'Network',            value: 'Mainnet',    unit: '',   color: '#ff6b35' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={s.grid}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          style={s.stat}
        >
          <div style={{ ...s.value, color: stat.color }}>
            {stat.value}<span style={s.unit}>{stat.unit}</span>
          </div>
          <div style={s.label}>{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

const s = {
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' },
  stat:  { background: 'var(--bg2)', padding: '1.25rem 1rem', textAlign: 'center' },
  value: { fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 },
  unit:  { fontSize: '0.9rem', fontWeight: 500, marginLeft: 2 },
  label: { fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 },
};
