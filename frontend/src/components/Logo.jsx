import { motion } from 'framer-motion';

export default function Logo({ size = 40, animated = false }) {
  return (
    <motion.div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      initial={animated ? { opacity: 0, x: -20 } : false}
      animate={animated ? { opacity: 1, x: 0 } : false}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src="/logo.svg"
        alt="Nexus"
        width={size}
        height={size}
        animate={animated ? { rotate: [0, 360] } : false}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <span style={{
        fontSize: size * 0.55,
        fontWeight: 800,
        background: 'linear-gradient(135deg, #7c6fff, #ff6b35)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
      }}>
        Nexus
      </span>
    </motion.div>
  );
}
