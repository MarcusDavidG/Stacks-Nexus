import { motion } from 'framer-motion';
import Button from './Button';

const FEATURES = [
  {
    icon: '💰',
    title: 'Earn Yield',
    desc: 'Deposit STX into the lending pool and earn passive yield from borrower interest.',
  },
  {
    icon: '🏦',
    title: 'Borrow Instantly',
    desc: 'Lock collateral and borrow STX at a fixed 1% rate with a 150% collateral ratio.',
  },
  {
    icon: '🔥',
    title: 'Daily Streaks',
    desc: 'Check in every day to build your streak and earn XP toward on-chain reputation.',
  },
  {
    icon: '🗳️',
    title: 'Govern Together',
    desc: 'Vote on community polls that shape the future direction of the protocol.',
  },
  {
    icon: '⚡',
    title: 'Flash Loans',
    desc: 'Access uncollateralised liquidity within a single block — coming soon.',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Compete for top positions based on deposits, streaks, and governance activity.',
  },
];

const STEPS = [
  { n: '01', title: 'Connect Wallet', desc: 'Link your Leather or Xverse wallet in one click.' },
  { n: '02', title: 'Deposit STX',    desc: 'Add STX to the pool and start earning immediately.' },
  { n: '03', title: 'Borrow or Earn', desc: 'Borrow against collateral or sit back and collect yield.' },
  { n: '04', title: 'Build Reputation', desc: 'Daily check-ins, votes, and activity grow your on-chain XP.' },
];

export default function LandingPage({ onConnect }) {
  return (
    <div>
      {/* ── Hero ── */}
      <section style={s.hero}>
        {/* Background image */}
        <div style={s.heroBg} />
        <div style={s.heroOverlay} />

        <motion.div
          style={s.heroContent}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div style={s.heroBadge}>🔗 Live on Stacks Mainnet</div>
          <h1 style={s.heroTitle}>
            The Connected<br />
            <span style={s.heroGrad}>Lending Protocol</span>
          </h1>
          <p style={s.heroSub}>
            Deposit STX to earn yield. Borrow against your assets.<br />
            Build reputation. Govern on-chain. All secured by Bitcoin.
          </p>
          <div style={s.heroCtas}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={onConnect}>Launch App →</Button>
            </motion.div>
            <a
              href="https://github.com/MarcusDavidG/Stacks-Nexus"
              target="_blank" rel="noreferrer"
              style={s.ghostLink}
            >
              View on GitHub
            </a>
          </div>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          style={s.heroStats}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {[
            { label: 'Collateral Ratio', value: '150%' },
            { label: 'Interest Rate',    value: '1%' },
            { label: 'Network',          value: 'Mainnet' },
          ].map(s2 => (
            <div key={s2.label} style={s.heroStat}>
              <div style={s.heroStatVal}>{s2.value}</div>
              <div style={s.heroStatLbl}>{s2.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Everything you need in DeFi</h2>
          <p style={s.sectionSub}>One protocol. Lending, borrowing, reputation, and governance — all on Stacks.</p>
          <div style={s.featureGrid}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                style={s.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ borderColor: 'var(--purple)', transform: 'translateY(-2px)' }}
              >
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ ...s.section, background: 'var(--bg2)' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div style={s.steps}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                style={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={s.stepNum}>{step.n}</div>
                <div>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepDesc}>{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image section ── */}
      <section style={s.imgSection}>
        <img
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1400&q=80&auto=format&fit=crop"
          alt="DeFi blockchain network"
          style={s.imgFull}
        />
        <div style={s.imgOverlay}>
          <motion.div
            style={s.imgContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ ...s.sectionTitle, color: '#fff', marginBottom: '1rem' }}>
              Secured by Bitcoin.<br />Powered by Stacks.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, lineHeight: 1.7 }}>
              Every transaction settles on the Bitcoin blockchain via Stacks' Proof of Transfer.
              Your assets are protected by the most secure network in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...s.section, textAlign: 'center' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Ready to get started?</h2>
          <p style={{ ...s.sectionSub, marginBottom: '2rem' }}>
            Connect your Leather or Xverse wallet and start earning in seconds.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Button size="lg" onClick={onConnect}>Connect Wallet →</Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const s = {
  // Hero
  hero:        { position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4rem 6vw', gap: '2rem', flexWrap: 'wrap', overflow: 'hidden' },
  heroBg:      { position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1600&q=80&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.75) 60%, rgba(10,10,15,0.88) 100%)', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 580 },
  heroBadge:   { display: 'inline-block', background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)', borderRadius: 20, padding: '0.3rem 0.9rem', fontSize: '0.8rem', color: 'var(--purple2)', marginBottom: '1.5rem' },
  heroTitle:   { fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text)', marginBottom: '1.25rem' },
  heroGrad:    { background: 'linear-gradient(135deg, #7c6fff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub:     { fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '2rem' },
  heroCtas:    { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' },
  ghostLink:   { fontSize: '0.95rem', color: 'var(--text2)', textDecoration: 'none', padding: '0.75rem 1.5rem', border: '1px solid var(--border2)', borderRadius: 10, fontWeight: 600 },
  heroStats:   { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' },
  heroStat:    { background: 'rgba(18,18,26,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.5rem', minWidth: 160 },
  heroStatVal: { fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #7c6fff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroStatLbl: { fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 },
  // Sections
  section:     { padding: '5rem 6vw', background: 'var(--bg)' },
  sectionInner:{ maxWidth: 1100, margin: '0 auto' },
  sectionTitle:{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: '0.75rem', textAlign: 'center' },
  sectionSub:  { fontSize: '1rem', color: 'var(--text2)', textAlign: 'center', marginBottom: '3rem' },
  // Features
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' },
  featureCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.75rem', transition: 'border-color 0.2s, transform 0.2s' },
  featureIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
  featureTitle:{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' },
  featureDesc: { fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.65 },
  // Steps
  steps:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginTop: '1rem' },
  step:        { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  stepNum:     { fontSize: '1.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #7c6fff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0, lineHeight: 1 },
  stepTitle:   { fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' },
  stepDesc:    { fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6 },
  // Image section
  imgSection:  { position: 'relative', height: 420, overflow: 'hidden' },
  imgFull:     { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgOverlay:  { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.5) 100%)', display: 'flex', alignItems: 'center', padding: '0 6vw' },
  imgContent:  { maxWidth: 560 },
};
