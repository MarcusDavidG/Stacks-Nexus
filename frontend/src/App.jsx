import { useState, useEffect, useCallback } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { uintCV, standardPrincipalCV } from '@stacks/transactions';
import { motion } from 'framer-motion';

import Navbar        from './components/Navbar';
import CheckInCard   from './components/CheckInCard';
import UserDashboard from './components/UserDashboard';
import LendingPanel  from './components/LendingPanel';
import PollCard      from './components/PollCard';
import HeroStats     from './components/HeroStats';
import StatusBar     from './components/StatusBar';
import { CONTRACTS, readOnly } from './lib/contracts';

const appConfig   = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function App() {
  const [address,  setAddress]  = useState('');
  const [status,   setStatus]   = useState('');
  const [deposit,  setDeposit]  = useState(null);
  const [loan,     setLoan]     = useState(null);
  const [streak,   setStreak]   = useState(null);
  const [poll,     setPoll]     = useState(null);
  const [pollId,   setPollId]   = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [theme,    setTheme]    = useState(() => localStorage.getItem('nexus-theme') ?? 'dark');

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  // ── Wallet ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setAddress(userSession.loadUserData().profile.stxAddress.mainnet);
    }
  }, []);

  function connectWallet() {
    showConnect({
      appDetails: { name: 'Nexus Protocol', icon: window.location.origin + '/logo.svg' },
      redirectTo: '/',
      onFinish: () => setAddress(userSession.loadUserData().profile.stxAddress.mainnet),
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut('/');
    setAddress('');
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  const loadUser = useCallback(async (addr) => {
    const [dep, ln, str] = await Promise.all([
      readOnly(CONTRACTS.pool,    'get-deposit', [standardPrincipalCV(addr)], addr),
      readOnly(CONTRACTS.pool,    'get-loan',    [standardPrincipalCV(addr)], addr),
      readOnly(CONTRACTS.checkin, 'get-streak',  [standardPrincipalCV(addr)], addr),
    ]);
    setDeposit(dep);
    setLoan(ln && typeof ln === 'object' && 'borrowed' in ln ? ln : null);
    setStreak(str);
  }, []);

  const loadPoll = useCallback(async (id, addr) => {
    const p = await readOnly(CONTRACTS.polls, 'get-poll', [uintCV(id)], addr || CONTRACTS.polls.addr);
    setPoll(p?.value ?? null);
    if (addr) {
      const voted = await readOnly(CONTRACTS.polls, 'has-voted', [uintCV(id), standardPrincipalCV(addr)], addr);
      setHasVoted(!!voted);
    }
  }, []);

  useEffect(() => { if (address) loadUser(address); }, [address, loadUser]);
  useEffect(() => { loadPoll(pollId, address || null); }, [pollId, address, loadPoll]);

  function onTx(txId) {
    setStatus(`✅ Transaction submitted — txid: ${txId}`);
    setTimeout(() => { if (address) loadUser(address); }, 8000);
  }

  function onError(msg) { setStatus(`❌ ${msg}`); }

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />

      <Navbar
        address={address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={s.main}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={s.hero}
        >
          <h1 style={s.heroTitle}>
            The Connected<br />
            <span style={s.heroGradient}>Lending Protocol</span>
          </h1>
          <p style={s.heroSub}>
            Deposit STX to earn yield. Borrow against collateral.<br />
            Build streaks. Govern together. All on-chain.
          </p>
          {!address && (
            <motion.button
              onClick={connectWallet}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={s.heroCta}
            >
              Launch App →
            </motion.button>
          )}
        </motion.div>

        <HeroStats />
        <CheckInCard address={address} streak={streak} onTx={onTx} onError={onError} />
        {address && <UserDashboard address={address} deposit={deposit} loan={loan} streak={streak} />}
        <LendingPanel address={address} loan={loan} onTx={onTx} onError={onError} />
        <PollCard
          address={address} poll={poll} pollId={pollId}
          hasVoted={hasVoted} onTx={onTx} onError={onError}
          onNav={(dir) => setPollId(Math.max(0, pollId + dir))}
        />
      </main>

      <footer style={s.footer}>
        <span style={s.footerText}>Nexus Protocol · Built on Stacks · Secured by Bitcoin</span>
        <div style={s.footerLinks}>
          <a href="https://github.com/MarcusDavidG/Stacks-Nexus" target="_blank" rel="noreferrer" style={s.link}>GitHub</a>
          <a href="https://explorer.hiro.so/address/SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP?chain=mainnet" target="_blank" rel="noreferrer" style={s.link}>Explorer</a>
        </div>
      </footer>

      <StatusBar status={status} onClear={() => setStatus('')} />
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden', transition: 'background 0.25s' },
  blob1:       { position: 'fixed', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--blob1) 0%, transparent 70%)', pointerEvents: 'none' },
  blob2:       { position: 'fixed', bottom: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--blob2) 0%, transparent 70%)', pointerEvents: 'none' },
  main:        { maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 },
  hero:        { textAlign: 'center', padding: '2rem 0 1rem' },
  heroTitle:   { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--text)', marginBottom: '1rem' },
  heroGradient:{ background: 'linear-gradient(135deg, #7c6fff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub:     { fontSize: '1rem', color: 'var(--text3)', lineHeight: 1.7, marginBottom: '1.5rem' },
  heroCta:     { background: 'linear-gradient(135deg, #7c6fff, #9d6fff)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(124,111,255,0.3)' },
  footer:      { borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', position: 'relative', zIndex: 1 },
  footerText:  { fontSize: '0.78rem', color: 'var(--text3)' },
  footerLinks: { display: 'flex', gap: '1rem' },
  link:        { fontSize: '0.78rem', color: 'var(--text2)', textDecoration: 'none' },
};
