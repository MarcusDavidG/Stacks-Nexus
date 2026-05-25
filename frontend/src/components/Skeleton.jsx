import { motion } from 'framer-motion';

const shimmer = {
  animate: { backgroundPosition: ['200% 0', '-200% 0'] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
};

const base = {
  background: 'linear-gradient(90deg, #1a1a26 25%, #2a2a3a 50%, #1a1a26 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 6,
};

export function SkeletonLine({ width = '100%', height = 16, style = {} }) {
  return (
    <motion.div
      {...shimmer}
      style={{ ...base, width, height, ...style }}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonLine width="40%" height={18} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={`${70 + Math.random() * 30}%`} height={14} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div style={{ background: '#0a0a0f', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <SkeletonLine width="60%" height={22} />
      <SkeletonLine width="40%" height={12} />
    </div>
  );
}
