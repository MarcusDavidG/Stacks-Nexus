import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock leaderboard — replace with real on-chain indexer data when available
const MOCK = [
  { rank: 1,  addr: 'SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP', deposits: 48.2, streak: 31, xp: 1820 },
  { rank: 2,  addr: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', deposits: 32.1, streak: 22, xp: 1140 },
  { rank: 3,  addr: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE', deposits: 21.5, streak: 18, xp:  870 },
  { rank: 4,  addr: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', deposits: 15.0, streak: 14, xp:  620 },
  { rank: 5,  addr: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR', deposits:  9.8, streak:  9, xp:  390 },
];

const TABS = ['XP', 'Deposits', 'Streak'];

export default function Leaderboard({ address }) {
  const [tab, setTab] = useState('XP');
  const sorted = [...MOCK].sort((a, b) =>
    tab === 'XP' ? b.xp - a.xp : tab === 'Deposits' ? b.deposits - a.deposits : b.streak - a.streak
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>🏆 Leaderboard</h2>
        <div style={s.tabs}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={s.list}>
        {sorted.map((row, i) => {
          const isMe = address && row.addr === address;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
          const val = tab === 'XP' ? `${row.xp.toLocaleString()} XP`
                    : tab === 'Deposits' ? `${row.deposits} STX`
                    : `${row.streak} 🔥`;
          return (
            <motion.div
              key={row.addr}
              style={{ ...s.row, ...(isMe ? s.rowMe : {}) }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span style={s.medal}>{medal}</span>
              <span style={s.addr}>{row.addr.slice(0, 8)}…{row.addr.slice(-4)}{isMe ? ' (you)' : ''}</span>
              <span style={s.val}>{val}</span>
            </motion.div>
          );
        })}
      </div>

      <p style={s.note}>* Live rankings coming with on-chain indexer integration</p>
    </motion.section>
  );
}

const s = {
  card:      { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' },
  title:     { fontSize: '1rem', fontWeight: 600, color: 'var(--text)' },
  tabs:      { display: 'flex', gap: 4 },
  tab:       { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.25rem 0.65rem', fontSize: '0.78rem', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: 'var(--purple)', color: '#fff', borderColor: 'var(--purple)' },
  list:      { display: 'flex', flexDirection: 'column', gap: 6 },
  row:       { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg3)', borderRadius: 8, padding: '0.65rem 0.9rem', border: '1px solid transparent' },
  rowMe:     { borderColor: 'var(--purple)', background: 'rgba(124,111,255,0.08)' },
  medal:     { fontSize: '1rem', width: 28, flexShrink: 0, textAlign: 'center' },
  addr:      { flex: 1, fontSize: '0.82rem', color: 'var(--text2)', fontFamily: 'monospace' },
  val:       { fontSize: '0.88rem', fontWeight: 700, color: 'var(--purple2)' },
  note:      { fontSize: '0.72rem', color: 'var(--text3)', textAlign: 'center' },
};
