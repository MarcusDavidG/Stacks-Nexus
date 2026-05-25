import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { txVote } from '../lib/transactions';

export default function PollCard({ address, poll, pollId, hasVoted, onTx, onError, onNav }) {
  if (!poll) return null;

  const totalVotes = Number(poll['votes-a'] ?? 0) + Number(poll['votes-b'] ?? 0);
  const pctA = totalVotes > 0 ? Math.round((Number(poll['votes-a']) / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  function vote(choice) {
    if (!address) return onError('Connect your wallet first.');
    if (hasVoted) return onError('You already voted on this poll.');
    txVote(pollId, choice, (data) => onTx(data.txId), () => {});
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={s.card}
    >
      <div style={s.header}>
        <div style={s.badge}>📊 Poll #{pollId}</div>
        {poll.active ? <span style={s.live}>● Live</span> : <span style={s.closed}>Closed</span>}
      </div>

      <p style={s.question}>{poll.question}</p>

      <div style={s.options}>
        {[
          { label: poll['option-a'], votes: poll['votes-a'], pct: pctA, choice: false },
          { label: poll['option-b'], votes: poll['votes-b'], pct: pctB, choice: true },
        ].map((opt) => (
          <motion.div key={opt.label} style={s.option} whileHover={{ borderColor: '#7c6fff' }}>
            <div style={s.optTop}>
              <span style={s.optLabel}>{opt.label}</span>
              <span style={s.optPct}>{opt.pct}%</span>
            </div>
            <div style={s.barBg}>
              <motion.div
                style={s.barFill}
                initial={{ width: 0 }}
                animate={{ width: `${opt.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div style={s.optBottom}>
              <span style={s.optVotes}>{String(opt.votes)} votes</span>
              {!hasVoted && poll.active && (
                <Button size="sm" variant="ghost" onClick={() => vote(opt.choice)}>Vote</Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {hasVoted && <p style={s.voted}>✅ You voted on this poll</p>}
      {!address && <p style={s.voted}>Connect wallet to vote</p>}

      <div style={s.nav}>
        <Button size="sm" variant="ghost" onClick={() => onNav(-1)} disabled={pollId === 0}>← Prev</Button>
        <Button size="sm" variant="ghost" onClick={() => onNav(1)}>Next →</Button>
      </div>
    </motion.section>
  );
}

const s = {
  card:     { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge:    { fontSize: '0.8rem', color: '#7c6fff', fontWeight: 600 },
  live:     { fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 },
  closed:   { fontSize: '0.75rem', color: '#5a5a70' },
  question: { fontSize: '1rem', color: '#e8e8f0', fontWeight: 500, lineHeight: 1.5 },
  options:  { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  option:   { background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.75rem 1rem', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: 6 },
  optTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  optLabel: { fontSize: '0.9rem', color: '#c0c0d0', fontWeight: 500 },
  optPct:   { fontSize: '0.85rem', color: '#7c6fff', fontWeight: 700 },
  barBg:    { height: 4, background: '#1a1a26', borderRadius: 2, overflow: 'hidden' },
  barFill:  { height: '100%', background: 'linear-gradient(90deg, #7c6fff, #9d8fff)', borderRadius: 2 },
  optBottom:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  optVotes: { fontSize: '0.75rem', color: '#5a5a70' },
  voted:    { fontSize: '0.82rem', color: '#7c6fff', textAlign: 'center' },
  nav:      { display: 'flex', justifyContent: 'center', gap: '0.75rem', paddingTop: '0.25rem' },
};
