import { motion } from 'framer-motion';
import { fromMicro } from '../lib/contracts';

export default function UserDashboard({ address, deposit, loan, streak }) {
  const stats = [
    { label: 'Deposited', value: deposit != null ? `${fromMicro(deposit)} STX` : '—', color: '#7c6fff' },
    { label: 'Borrowed',  value: loan ? `${fromMicro(loan.borrowed)} STX` : '—',   color: '#ff6b35' },
    { label: 'Collateral',value: loan ? `${fromMicro(loan.collateral)} STX` : '—', color: '#f59e0b' },
    { label: 'Streak',    value: streak ? `${streak.count} 🔥` : '0 🔥',           color: '#4ade80' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>Your Position</h2>
        <span style={s.addr}>{address.slice(0,8)}…{address.slice(-6)}</span>
      </div>
      <div style={s.grid}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            style={s.stat}
          >
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
      {streak && streak.count > 0 && (
        <div style={s.streakBar}>
          <div style={s.streakFill(Math.min(streak.count, 30))} />
          <span style={s.streakText}>Streak progress to 30 days</span>
        </div>
      )}
    </motion.section>
  );
}

const s = {
  card:      { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '1.5rem' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title:     { fontSize: '1rem', fontWeight: 600, color: '#c0c0d0' },
  addr:      { fontSize: '0.75rem', color: '#5a5a70', fontFamily: 'monospace', background: '#1a1a26', padding: '0.25rem 0.5rem', borderRadius: 6 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' },
  stat:      { background: '#0a0a0f', borderRadius: 8, padding: '0.75rem 1rem', textAlign: 'center' },
  statValue: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: '0.72rem', color: '#5a5a70', textTransform: 'uppercase', letterSpacing: '0.05em' },
  streakBar: { marginTop: '1rem', position: 'relative', height: 6, background: '#1a1a26', borderRadius: 3, overflow: 'hidden' },
  streakFill: (count) => ({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(count / 30) * 100}%`, background: 'linear-gradient(90deg, #7c6fff, #ff6b35)', borderRadius: 3, transition: 'width 0.5s ease' }),
  streakText: { display: 'none' },
};
