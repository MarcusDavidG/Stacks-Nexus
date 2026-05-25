import { useState, useEffect, useCallback } from "react";
import { AppConfig, UserSession, showConnect, openContractCall } from "@stacks/connect";
import { STACKS_MAINNET } from "@stacks/network";
import {
  uintCV,
  boolCV,
  fetchCallReadOnlyFunction,
  cvToValue,
  PostConditionMode,
  AnchorMode,
} from "@stacks/transactions";

// ── Config ────────────────────────────────────────────────────────────────────
const network        = STACKS_MAINNET;
const POOL_ADDR      = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const POOL_NAME      = "lending-pool";
const CHECKIN_ADDR   = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const CHECKIN_NAME   = "nexus-checkin";
const POLLS_ADDR     = "SP3VD1Z3MGKB0MRPBH8DS1ZKXNGYW66NH5R6W74XP";
const POLLS_NAME     = "nexus-polls";
const FEE            = 2000; // 0.002 STX — minimum viable

const appConfig  = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

// ── Helpers ───────────────────────────────────────────────────────────────────
const toMicro = (stx) => Math.floor(parseFloat(stx) * 1_000_000);
const fromMicro = (u) => (Number(u) / 1_000_000).toFixed(6);

async function readOnly(addr, name, fn, args, sender) {
  try {
    const res = await fetchCallReadOnlyFunction({
      contractAddress: addr, contractName: name,
      functionName: fn, functionArgs: args,
      network, senderAddress: sender,
    });
    return cvToValue(res);
  } catch { return null; }
}

// contractCall is used by CLI scripts (interact.ts / loop-txs.ts), not the browser UI.

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [address, setAddress]         = useState("");
  const [status, setStatus]           = useState("");
  const [loading, setLoading]         = useState(false);

  // Pool stats
  const [poolStats, setPoolStats]     = useState(null);
  // User data
  const [deposit, setDeposit]         = useState(null);
  const [loan, setLoan]               = useState(null);
  const [streak, setStreak]           = useState(null);
  // Active poll
  const [poll, setPoll]               = useState(null);
  const [pollId, setPollId]           = useState(0);
  const [hasVoted, setHasVoted]       = useState(false);

  // Form inputs
  const [depositAmt, setDepositAmt]   = useState("1");
  const [withdrawAmt, setWithdrawAmt] = useState("1");
  const [borrowAmt, setBorrowAmt]     = useState("1");
  const [collateralAmt, setCollateral] = useState("1.5");

  // ── Wallet ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setAddress(data.profile.stxAddress.mainnet);
    }
  }, []);

  function connectWallet() {
    showConnect({
      appDetails: { name: "Nexus Protocol", icon: window.location.origin + "/vite.svg" },
      redirectTo: "/",
      onFinish: () => {
        const data = userSession.loadUserData();
        setAddress(data.profile.stxAddress.mainnet);
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut("/");
    setAddress("");
  }

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadUserData = useCallback(async (addr) => {
    const [dep, ln, str] = await Promise.all([
      readOnly(POOL_ADDR, POOL_NAME, "get-deposit", [{ type: "principal", value: addr }], addr),
      readOnly(POOL_ADDR, POOL_NAME, "get-loan",    [{ type: "principal", value: addr }], addr),
      readOnly(CHECKIN_ADDR, CHECKIN_NAME, "get-streak", [{ type: "principal", value: addr }], addr),
    ]);
    setDeposit(dep);
    setLoan(ln);
    setStreak(str);
  }, []);

  const loadPoll = useCallback(async (id, addr) => {
    const p = await readOnly(POLLS_ADDR, POLLS_NAME, "get-poll", [uintCV(id)], addr || POOL_ADDR);
    setPoll(p);
    if (addr) {
      const voted = await readOnly(POLLS_ADDR, POLLS_NAME, "has-voted", [uintCV(id), { type: "principal", value: addr }], addr);
      setHasVoted(!!voted);
    }
  }, []);

  useEffect(() => {
    if (address) {
      loadUserData(address);
      loadPoll(pollId, address);
    } else {
      loadPoll(pollId, null);
    }
  }, [address, pollId, loadUserData, loadPoll]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  function browserCall(addr, name, fn, args, label) {
    if (!address) return setStatus("Connect your wallet first.");
    setLoading(true);
    setStatus(`${label}…`);
    openContractCall({
      contractAddress: addr,
      contractName: name,
      functionName: fn,
      functionArgs: args,
      network,
      fee: FEE,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        setStatus(`✅ ${label} submitted — txid: ${data.txId}`);
        setLoading(false);
        setTimeout(() => loadUserData(address), 5000);
      },
      onCancel: () => { setStatus("Cancelled."); setLoading(false); },
    });
  }

  const doDeposit   = () => browserCall(POOL_ADDR, POOL_NAME, "deposit",  [uintCV(toMicro(depositAmt))], "Deposit");
  const doWithdraw  = () => browserCall(POOL_ADDR, POOL_NAME, "withdraw", [uintCV(toMicro(withdrawAmt))], "Withdraw");
  const doBorrow    = () => browserCall(POOL_ADDR, POOL_NAME, "borrow",   [uintCV(toMicro(borrowAmt)), uintCV(toMicro(collateralAmt))], "Borrow");
  const doRepay     = () => browserCall(POOL_ADDR, POOL_NAME, "repay",    [], "Repay");
  const doCheckIn   = () => browserCall(CHECKIN_ADDR, CHECKIN_NAME, "check-in", [], "Check-in");
  const doVote      = (choice) => browserCall(POLLS_ADDR, POLLS_NAME, "vote", [uintCV(pollId), boolCV(choice)], "Vote");

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>⚡ Nexus</div>
        <div style={styles.headerRight}>
          {address ? (
            <>
              <span style={styles.addr}>{address.slice(0,6)}…{address.slice(-4)}</span>
              <button style={styles.btnSecondary} onClick={disconnectWallet}>Disconnect</button>
            </>
          ) : (
            <button style={styles.btnPrimary} onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {/* Daily Check-in — most prominent */}
        <section style={styles.checkinCard}>
          <div style={styles.checkinLeft}>
            <div style={styles.checkinTitle}>🔥 Daily Check-in</div>
            <div style={styles.checkinSub}>
              {streak
                ? `Streak: ${streak.count} days · Total: ${streak.total} check-ins`
                : "Start your streak today"}
            </div>
          </div>
          <button
            style={styles.btnCheckin}
            onClick={doCheckIn}
            disabled={loading || !address}
          >
            Check In
          </button>
        </section>

        {/* User Position */}
        {address && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Your Position</h2>
            <div style={styles.statsRow}>
              <Stat label="Deposited" value={deposit != null ? `${fromMicro(deposit)} STX` : "—"} />
              <Stat label="Borrowed"  value={loan ? `${fromMicro(loan.borrowed)} STX` : "—"} />
              <Stat label="Collateral" value={loan ? `${fromMicro(loan.collateral)} STX` : "—"} />
              <Stat label="Streak"    value={streak ? `${streak.count} 🔥` : "0"} />
            </div>
          </section>
        )}

        {/* Deposit / Withdraw */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Deposit & Withdraw</h2>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (STX)</label>
              <input style={styles.input} type="number" min="0.000001" step="0.1"
                value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
              <button style={styles.btnPrimary} onClick={doDeposit} disabled={loading || !address}>
                Deposit
              </button>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (STX)</label>
              <input style={styles.input} type="number" min="0.000001" step="0.1"
                value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} />
              <button style={styles.btnSecondary} onClick={doWithdraw} disabled={loading || !address}>
                Withdraw
              </button>
            </div>
          </div>
        </section>

        {/* Borrow / Repay */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Borrow & Repay</h2>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Borrow (STX)</label>
              <input style={styles.input} type="number" min="0.000001" step="0.1"
                value={borrowAmt} onChange={e => setBorrowAmt(e.target.value)} />
              <label style={styles.label}>Collateral (STX, min 1.5×)</label>
              <input style={styles.input} type="number" min="0.000001" step="0.1"
                value={collateralAmt} onChange={e => setCollateral(e.target.value)} />
              <button style={styles.btnPrimary} onClick={doBorrow} disabled={loading || !address}>
                Borrow
              </button>
            </div>
            <div style={styles.inputGroup}>
              <p style={styles.repayNote}>Repays your full outstanding loan + 1% interest and returns collateral.</p>
              <button style={styles.btnSecondary} onClick={doRepay} disabled={loading || !address || !loan}>
                Repay Loan
              </button>
            </div>
          </div>
        </section>

        {/* Active Poll */}
        {poll && poll.active && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Community Poll</h2>
            <p style={styles.pollQuestion}>{poll.question}</p>
            <div style={styles.row}>
              <PollOption
                label={poll["option-a"]}
                votes={poll["votes-a"]}
                total={Number(poll["votes-a"]) + Number(poll["votes-b"])}
                onClick={() => doVote(false)}
                disabled={loading || !address || hasVoted}
              />
              <PollOption
                label={poll["option-b"]}
                votes={poll["votes-b"]}
                total={Number(poll["votes-a"]) + Number(poll["votes-b"])}
                onClick={() => doVote(true)}
                disabled={loading || !address || hasVoted}
              />
            </div>
            {hasVoted && <p style={styles.votedNote}>✅ You voted</p>}
            {!address && <p style={styles.votedNote}>Connect wallet to vote</p>}
            <div style={styles.pollNav}>
              <button style={styles.btnSmall} onClick={() => setPollId(Math.max(0, pollId - 1))} disabled={pollId === 0}>← Prev</button>
              <span style={styles.pollIdLabel}>Poll #{pollId}</span>
              <button style={styles.btnSmall} onClick={() => setPollId(pollId + 1)}>Next →</button>
            </div>
          </section>
        )}

        {/* Status */}
        {status && (
          <div style={styles.statusBox}>
            <p style={styles.statusText}>{status}</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function PollOption({ label, votes, total, onClick, disabled }) {
  const pct = total > 0 ? Math.round((Number(votes) / total) * 100) : 0;
  return (
    <div style={styles.pollOption}>
      <button style={styles.btnPoll} onClick={onClick} disabled={disabled}>{label}</button>
      <div style={styles.pollBar}>
        <div style={{ ...styles.pollFill, width: `${pct}%` }} />
      </div>
      <span style={styles.pollPct}>{votes} votes ({pct}%)</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page:         { minHeight: "100vh", background: "#0f0f13", color: "#e8e8f0", fontFamily: "Inter, system-ui, sans-serif" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #2a2a3a", background: "#13131a" },
  logo:         { fontSize: "1.4rem", fontWeight: 700, color: "#7c6fff" },
  headerRight:  { display: "flex", alignItems: "center", gap: "1rem" },
  addr:         { fontSize: "0.85rem", color: "#888", fontFamily: "monospace" },
  main:         { maxWidth: 800, margin: "0 auto", padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  card:         { background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 12, padding: "1.5rem" },
  cardTitle:    { margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#c0c0d0" },
  checkinCard:  { background: "linear-gradient(135deg, #1e1a3a, #2a1a4a)", border: "1px solid #4a3a7a", borderRadius: 12, padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  checkinLeft:  { display: "flex", flexDirection: "column", gap: 4 },
  checkinTitle: { fontSize: "1.2rem", fontWeight: 700, color: "#c0a0ff" },
  checkinSub:   { fontSize: "0.85rem", color: "#9080b0" },
  statsRow:     { display: "flex", gap: "1rem", flexWrap: "wrap" },
  stat:         { flex: 1, minWidth: 120, background: "#13131a", borderRadius: 8, padding: "0.75rem 1rem", textAlign: "center" },
  statValue:    { fontSize: "1.1rem", fontWeight: 700, color: "#e0e0f0" },
  statLabel:    { fontSize: "0.75rem", color: "#666", marginTop: 4 },
  row:          { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  inputGroup:   { flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 },
  label:        { fontSize: "0.8rem", color: "#888" },
  input:        { background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 6, padding: "0.5rem 0.75rem", color: "#e0e0f0", fontSize: "0.95rem" },
  repayNote:    { fontSize: "0.85rem", color: "#888", lineHeight: 1.5 },
  pollQuestion: { fontSize: "1rem", color: "#c0c0d0", marginBottom: "1rem" },
  pollOption:   { flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 6 },
  pollBar:      { height: 6, background: "#2a2a3a", borderRadius: 3, overflow: "hidden" },
  pollFill:     { height: "100%", background: "#7c6fff", borderRadius: 3, transition: "width 0.3s" },
  pollPct:      { fontSize: "0.75rem", color: "#666" },
  pollNav:      { display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem", justifyContent: "center" },
  pollIdLabel:  { fontSize: "0.85rem", color: "#666" },
  votedNote:    { fontSize: "0.85rem", color: "#7c6fff", marginTop: "0.5rem", textAlign: "center" },
  statusBox:    { background: "#1a2a1a", border: "1px solid #2a4a2a", borderRadius: 8, padding: "1rem 1.5rem" },
  statusText:   { margin: 0, fontSize: "0.85rem", color: "#80c080", wordBreak: "break-all" },
  btnPrimary:   { background: "#7c6fff", color: "#fff", border: "none", borderRadius: 8, padding: "0.6rem 1.2rem", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" },
  btnSecondary: { background: "#2a2a3a", color: "#c0c0d0", border: "1px solid #3a3a4a", borderRadius: 8, padding: "0.6rem 1.2rem", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem" },
  btnCheckin:   { background: "#ff6b35", color: "#fff", border: "none", borderRadius: 8, padding: "0.7rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "1rem" },
  btnPoll:      { background: "#2a2a3a", color: "#c0c0d0", border: "1px solid #3a3a4a", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.9rem" },
  btnSmall:     { background: "#2a2a3a", color: "#888", border: "1px solid #3a3a4a", borderRadius: 6, padding: "0.3rem 0.7rem", cursor: "pointer", fontSize: "0.8rem" },
};
