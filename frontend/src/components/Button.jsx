import { motion } from 'framer-motion';

const variants = {
  primary:   { bg: '#7c6fff', color: '#fff', border: 'none' },
  secondary: { bg: '#1a1a26', color: '#c0c0d0', border: '1px solid #2a2a3a' },
  danger:    { bg: '#2a1a1a', color: '#f87171', border: '1px solid #4a2a2a' },
  success:   { bg: '#1a2a1a', color: '#4ade80', border: '1px solid #2a4a2a' },
  orange:    { bg: '#ff6b35', color: '#fff', border: 'none' },
  ghost:     { bg: 'transparent', color: '#9090a8', border: '1px solid #2a2a3a' },
};

export default function Button({ children, variant = 'primary', disabled, onClick, fullWidth, size = 'md', style = {} }) {
  const v = variants[variant];
  const padding = size === 'sm' ? '0.4rem 0.8rem' : size === 'lg' ? '0.8rem 1.8rem' : '0.6rem 1.2rem';
  const fontSize = size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.9rem';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, filter: 'brightness(1.1)' }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: 8,
        padding,
        fontSize,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
