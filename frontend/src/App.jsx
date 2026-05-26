import { useState, useEffect, useCallback } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { uintCV, standardPrincipalCV } from '@stacks/transactions';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar              from './components/Navbar';
import LandingPage         from './components/LandingPage';
import HeroStats           from './components/HeroStats';
import UserDashboard       from './components/UserDashboard';
import LendingPanel        from './components/LendingPanel';
import CheckInCard         from './components/CheckInCard';
import PollCard            from './components/PollCard';
import XPCard              from './components/XPCard';
import Leaderboard         from './components/Leaderboard';
import ReferralCard        from './components/ReferralCard';
import FlashLoanCard       from './components/FlashLoanCard';
import LiquidationMonitor  from './components/LiquidationMonitor';
import StatusBar           from './components/StatusBar';
import { CONTRACTS, readOnly } from './lib/contracts';

const appConfig   = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const APP_TABS = ['Overview', 'Lend & Borrow', 'Governance', 'Reputation', 'Explore'];

export default function App() {
  const [address,  setAddress]  = useState('');
  const [status,   setStatus]   = useState('');
  const [deposit,  setDeposit]  = useState(null);
  const [loan,     setLoan]     = useState(null);
  const [streak,   setStreak]   = useState(null);
  const [poll,     setPoll]     = useState(null);
  const [pollId,   setPollId]   = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [tab,      setTab]      = useState('Overview');
  const [theme,    setTheme]    = useState(() => localStorage.getItem('nexus-theme') ?? 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

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
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <AnimatePresence mode="wait">
        {!address ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onConnect={connectWallet} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Tab bar */}
            <div style={s.tabBar}>
              <div style={s.tabInner}>
                {APP_TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ ...s.tabBtn, ...(tab === t ? s.tabActive : {}) }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <main style={s.main}>
              {tab === 'Overview' && (
                <div style={s.grid}>
                  <HeroStats />
                  <UserDashboard address={address} deposit={deposit} loan={loan} streak={streak} />
                  <CheckInCard address={address} streak={streak} onTx={onTx} onError={onError} />
                  <XPCard deposit={deposit} loan={loan} streak={streak} />
                </div>
              )}

              {tab === 'Lend & Borrow' && (
                <div style={s.grid}>
                  <UserDashboard address={address} deposit={deposit} loan={loan} streak={streak} />
                  <LendingPanel address={address} loan={loan} onTx={onTx} onError={onError} />
                  <FlashLoanCard address={address} />
                  <LiquidationMonitor address={address} />
                </div>
              )}

              {tab === 'Governance' && (
                <div style={s.grid}>
                  <PollCard
                    address={address} poll={poll} pollId={pollId}
                    hasVoted={hasVoted} onTx={onTx} onError={onError}
                    onNav={(dir) => setPollId(Math.max(0, pollId + dir))}
                  />
                </div>
              )}

              {tab === 'Reputation' && (
                <div style={s.grid}>
                  <XPCard deposit={deposit} loan={loan} streak={streak} />
                  <CheckInCard address={address} streak={streak} onTx={onTx} onError={onError} />
                  <ReferralCard address={address} />
                </div>
              )}

              {tab === 'Explore' && (
                <div style={s.grid}>
                  <Leaderboard address={address} />
                  <LiquidationMonitor address={address} />
                  <FlashLoanCard address={address} />
                </div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

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
  page:      { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden', transition: 'background 0.25s' },
  blob1:     { position: 'fixed', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--blob1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  blob2:     { position: 'fixed', bottom: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--blob2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  tabBar:    { borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'sticky', top: 65, zIndex: 90 },
  tabInner:  { maxWidth: 900, margin: '0 auto', padding: '0 1.25rem', display: 'flex', gap: 4, overflowX: 'auto' },
  tabBtn:    { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '0.85rem 1rem', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'color 0.15s, border-color 0.15s' },
  tabActive: { color: 'var(--purple)', borderBottomColor: 'var(--purple)', fontWeight: 700 },
  main:      { maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem', position: 'relative', zIndex: 1 },
  grid:      { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  footer:    { borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', position: 'relative', zIndex: 1 },
  footerText:{ fontSize: '0.78rem', color: 'var(--text3)' },
  footerLinks:{ display: 'flex', gap: '1rem' },
  link:      { fontSize: '0.78rem', color: 'var(--text2)', textDecoration: 'none' },
};
