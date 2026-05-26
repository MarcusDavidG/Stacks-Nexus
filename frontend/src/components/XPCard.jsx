import { motion } from 'framer-motion';

const TIERS = [
  { name: 'Newcomer',   min: 0,    color: '#9090a8', icon: '🌱' },
  { name: 'Depositor',  min: 100,  color: '#4ade80', icon: '💎' },
  { name: 'Borrower',   min: 300,  color: '#60a5fa', icon: '🏦' },
  { name: 'Veteran',    min: 700,  color: '#a78bfa', icon: '⚔️' },
  { name: 'Legend',     min: 1500, color: '#ff6b35', icon: '🔥' },
];

function calcXP({ deposit, loan, streak }) {
  let xp = 0;
  if (deposit) xp += Math.floor(Number(deposit) / 1_000_000) * 2;
  if (loan)    xp += Math.floor(Number(loan.borrowed ?? 0) / 1_000_000) * 3;
  if (streak)  xp += (streak.count ?? 0) * 10 + (streak.total ?? 0) * 2;
  return xp;
}

export default function XPCard({ deposit, loan, streak }) {
  const xp = calcXP({ deposit, loan, streak });
  const tier = [...TIERS].reverse().find(t => xp >= t.min) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier
    ? Math.min(((xp - tier.min) / (nextTier.min - tier.min)) * 100, 100)
    : 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>Reputation & XP</h2>
        <div style={{ ...s.tierBadge, color: tier.color, borderColor: tier.color }}>
          {tier.icon} {tier.name}
        </div>
      </div>

      <div style={s.xpRow}>
        <span style={s.xpNum}>{xp.toLocaleString()}</span>
        <span style={s.xpLabel}>XP</span>
      </div>

      <div style={s.barBg}>
        <motion.div
          style={{ ...s.barFill, background: tier.color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div style={s.barMeta}>
        <span style={{ color: tier.color }}>{tier.name}</span>
        {nextTier && <span style={{ color: 'var(--text3)' }}>{nextTier.name} at {nextTier.min} XP</span>}
      </div>

      <div style={s.breakdown}>
        {[
          { label: 'Deposits',  val: deposit ? `+${Math.floor(Number(deposit) / 1_000_000) * 2} XP` : '—' },
          { label: 'Borrows',   val: loan    ? `+${Math.floor(Number(loan.borrowed ?? 0) / 1_000_000) * 3} XP` : '—' },
          { label: 'Streak',    val: streak  ? `+${(streak.count ?? 0) * 10} XP` : '—' },
          { label: 'Check-ins', val: streak  ? `+${(streak.total ?? 0) * 2} XP` : '—' },
        ].map(r => (
          <div key={r.label} style={s.row}>
            <span style={s.rowLabel}>{r.label}</span>
            <span style={s.rowVal}>{r.val}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

const s = {
  card:      { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:     { fontSize: '1rem', fontWeight: 600, color: 'var(--text)' },
  tierBadge: { fontSize: '0.8rem', fontWeight: 700, border: '1px solid', borderRadius: 20, padding: '0.2rem 0.7rem' },
  xpRow:     { display: 'flex', alignItems: 'baseline', gap: 6 },
  xpNum:     { fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #7c6fff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  xpLabel:   { fontSize: '1rem', color: 'var(--text3)', fontWeight: 600 },
  barBg:     { height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: 4 },
  barMeta:   { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: -4 },
  breakdown: { display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: '0.75rem' },
  row:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' },
  rowLabel:  { color: 'var(--text2)' },
  rowVal:    { color: 'var(--purple2)', fontWeight: 600 },
};
