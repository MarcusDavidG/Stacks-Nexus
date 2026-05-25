import { motion } from 'framer-motion';

const TIERS = [
  { name: 'Bronze',    min: 0,    color: '#cd7f32', bg: '#2a1a0a' },
  { name: 'Silver',    min: 100,  color: '#c0c0c0', bg: '#1a1a1a' },
  { name: 'Gold',      min: 500,  color: '#ffd700', bg: '#2a2000' },
  { name: 'Diamond',   min: 1000, color: '#7c6fff', bg: '#1a1530' },
  { name: 'Legendary', min: 5000, color: '#ff6b35', bg: '#2a1500' },
];

function getTier(xp) {
  return [...TIERS].reverse().find(t => xp >= t.min) ?? TIERS[0];
}

function getNextTier(xp) {
  return TIERS.find(t => t.min > xp) ?? null;
}

export default function XPBadge({ xp = 0 }) {
  const tier = getTier(xp);
  const next = getNextTier(xp);
  const pct  = next
    ? ((xp - tier.min) / (next.min - tier.min)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ ...s.card, background: tier.bg, borderColor: tier.color + '40' }}
    >
      <div style={s.top}>
        <span style={{ ...s.badge, color: tier.color, borderColor: tier.color + '60' }}>
          {tier.name}
        </span>
        <span style={s.xp}>{xp.toLocaleString()} XP</span>
      </div>
      <div style={s.barBg}>
        <motion.div
          style={{ ...s.barFill, background: tier.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {next && <div style={s.next}>{next.min - xp} XP to {next.name}</div>}
    </motion.div>
  );
}

const s = {
  card:  { border: '1px solid', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 },
  top:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: 6, padding: '0.2rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  xp:    { fontSize: '0.85rem', fontWeight: 700, color: '#e8e8f0' },
  barBg: { height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  barFill:{ height: '100%', borderRadius: 2 },
  next:  { fontSize: '0.7rem', color: '#5a5a70' },
};
