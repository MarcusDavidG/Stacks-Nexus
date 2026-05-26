import { motion } from 'framer-motion';
import Logo from './Logo';
import Button from './Button';

export default function Navbar({ address, onConnect, onDisconnect, theme, onToggleTheme }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.nav}
    >
      <Logo size={36} animated />

      <div style={s.right}>
        <button onClick={onToggleTheme} style={s.themeBtn} title="Toggle theme" aria-label="Toggle light/dark mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {address ? (
          <div style={s.connected}>
            <div style={s.dot} />
            <span style={s.addr}>{address.slice(0, 6)}…{address.slice(-4)}</span>
            <Button variant="ghost" size="sm" onClick={onDisconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button onClick={onConnect} size="sm">Connect Wallet</Button>
        )}
      </div>
    </motion.header>
  );
}

const s = {
  nav:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  right:     { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  themeBtn:  { background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0.3rem 0.55rem', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, transition: 'border-color 0.2s' },
  connected: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.75rem' },
  dot:       { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' },
  addr:      { fontSize: '0.82rem', color: 'var(--text2)', fontFamily: 'monospace' },
};
