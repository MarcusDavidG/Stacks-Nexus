import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Value Locked', value: '—', unit: 'STX', color: '#7c6fff' },
  { label: 'Active Borrowers',   value: '—', unit: '',    color: '#ff6b35' },
  { label: 'Collateral Ratio',   value: '150', unit: '%', color: '#4ade80' },
  { label: 'Interest Rate',      value: '1',   unit: '%', color: '#f59e0b' },
];

export default function HeroStats() {
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
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: '#1a1a26', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a1a26' },
  stat:  { background: '#12121a', padding: '1.25rem 1rem', textAlign: 'center' },
  value: { fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 },
  unit:  { fontSize: '0.9rem', fontWeight: 500, marginLeft: 2 },
  label: { fontSize: '0.72rem', color: '#5a5a70', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 },
};
