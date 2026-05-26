import { motion } from 'framer-motion';

const variants = {
  primary:   { bg: 'var(--purple)',  color: '#fff',           border: 'none' },
  secondary: { bg: 'var(--bg3)',     color: 'var(--text2)',   border: '1px solid var(--border)' },
  danger:    { bg: 'var(--bg3)',     color: 'var(--red)',     border: '1px solid var(--border)' },
  success:   { bg: 'var(--bg3)',     color: 'var(--green)',   border: '1px solid var(--border)' },
  orange:    { bg: 'var(--orange)',  color: '#fff',           border: 'none' },
  ghost:     { bg: 'transparent',   color: 'var(--text2)',   border: '1px solid var(--border)' },
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
