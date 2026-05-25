import { motion } from 'framer-motion';
import Logo from './Logo';
import Button from './Button';

export default function Navbar({ address, onConnect, onDisconnect }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={s.nav}
    >
      <Logo size={36} animated />

      <div style={s.right}>
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
  nav:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1a1a26', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  right:     { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  connected: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.35rem 0.75rem' },
  dot:       { width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' },
  addr:      { fontSize: '0.82rem', color: '#9090a8', fontFamily: 'monospace' },
};
