import { motion } from 'framer-motion';
import Button from './Button';
import { txCheckIn } from '../lib/transactions';

export default function CheckInCard({ address, streak, onTx, onError }) {
  const count = streak?.count ?? 0;
  const total = streak?.total ?? 0;

  function handleCheckIn() {
    if (!address) return onError('Connect your wallet first.');
    txCheckIn(
      (data) => onTx(data.txId),
      () => {}
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.left}>
        <div style={s.flames}>
          {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              style={{ fontSize: i === 0 ? '1.8rem' : '1.2rem', opacity: 1 - i * 0.1 }}
            >🔥</motion.span>
          ))}
          {count === 0 && <span style={{ fontSize: '1.8rem' }}>🔥</span>}
        </div>
        <div>
          <div style={s.title}>Daily Check-in</div>
          <div style={s.sub}>
            {count > 0
              ? `${count}-day streak · ${total} total check-ins`
              : 'Start your streak today — check in daily to build it up'}
          </div>
        </div>
      </div>
      <Button variant="orange" onClick={handleCheckIn} disabled={!address} size="lg">
        Check In
      </Button>
    </motion.section>
  );
}

const s = {
  card:   { background: 'linear-gradient(135deg, #1a1530, #1e1020)', border: '1px solid #3a2a5a', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  left:   { display: 'flex', alignItems: 'center', gap: '1rem' },
  flames: { display: 'flex', gap: 2, alignItems: 'flex-end' },
  title:  { fontSize: '1.1rem', fontWeight: 700, color: '#d0b0ff' },
  sub:    { fontSize: '0.82rem', color: '#8060a0', marginTop: 2 },
};
