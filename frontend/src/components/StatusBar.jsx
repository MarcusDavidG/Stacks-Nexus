import { motion, AnimatePresence } from 'framer-motion';

export default function StatusBar({ status, onClear }) {
  if (!status) return null;
  const isError = status.startsWith('Error') || status.startsWith('❌');
  const isSuccess = status.startsWith('✅');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: isError ? '#2a1a1a' : isSuccess ? '#1a2a1a' : '#1a1a26',
          border: `1px solid ${isError ? '#4a2a2a' : isSuccess ? '#2a4a2a' : '#2a2a3a'}`,
          borderRadius: 10,
          padding: '0.75rem 1.25rem',
          maxWidth: 600,
          width: 'calc(100vw - 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
      >
        <span style={{
          fontSize: '0.85rem',
          color: isError ? '#f87171' : isSuccess ? '#4ade80' : '#c0c0d0',
          wordBreak: 'break-all',
          flex: 1,
        }}>
          {status}
        </span>
        <button
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: '#5a5a70', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
        >✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
