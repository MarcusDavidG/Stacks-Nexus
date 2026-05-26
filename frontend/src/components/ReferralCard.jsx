import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export default function ReferralCard({ address }) {
  const [copied, setCopied] = useState(false);
  const link = address
    ? `${window.location.origin}?ref=${address.slice(0, 12)}`
    : '';

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.card}
    >
      <div style={s.header}>
        <h2 style={s.title}>🎁 Referral Program</h2>
        <span style={s.badge}>Coming Soon</span>
      </div>

      <p style={s.desc}>
        Invite friends to Nexus and earn <strong style={{ color: 'var(--purple2)' }}>50 XP</strong> for
        every wallet that deposits using your referral link.
      </p>

      <div style={s.linkRow}>
        <div style={s.linkBox}>
          {link || 'Connect wallet to generate your link'}
        </div>
        <Button size="sm" onClick={copy} disabled={!address}>
          {copied ? '✅ Copied!' : 'Copy'}
        </Button>
      </div>

      <div style={s.stats}>
        {[
          { label: 'Referrals', value: '—' },
          { label: 'XP Earned', value: '—' },
          { label: 'Rank Boost', value: '—' },
        ].map(r => (
          <div key={r.label} style={s.stat}>
            <div style={s.statVal}>{r.value}</div>
            <div style={s.statLbl}>{r.label}</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

const s = {
  card:    { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontSize: '1rem', fontWeight: 600, color: 'var(--text)' },
  badge:   { fontSize: '0.72rem', background: 'rgba(255,107,53,0.12)', color: 'var(--orange)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 20, padding: '0.2rem 0.6rem', fontWeight: 600 },
  desc:    { fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6 },
  linkRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  linkBox: { flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.85rem', fontSize: '0.8rem', color: 'var(--text3)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  stats:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' },
  stat:    { textAlign: 'center' },
  statVal: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--text3)' },
  statLbl: { fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 },
};
