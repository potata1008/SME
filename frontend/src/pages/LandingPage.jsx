// frontend/src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { CONTRACT_ADDRESS } from '../config';

const EXPLORER = 'https://amoy.polygonscan.com';
const REPO_URL = 'https://github.com/potata1008/SME';

// The five on-chain states, with the contract call that enters each one.
const LIFECYCLE = [
  { state: 'MINTED',     call: 'mintToken',       who: 'Manufacturer', note: 'Batch created with a hash of its reference fingerprint.' },
  { state: 'IN_TRANSIT', call: 'transferCustody', who: 'Manufacturer', note: 'Shipped. The recipient must be a registered lab.' },
  { state: 'RECEIVED',   call: 'confirmReceipt',  who: 'Lab',          note: 'The receiving lab confirms the shipment arrived.' },
  { state: 'VERIFIED',   call: 'verifyProof',     who: 'Lab',          note: 'Zero-knowledge proof and signed oracle verdict both pass.' },
  { state: 'CONSUMED',   call: 'consumeToken',    who: 'Lab',          note: 'Batch used. Final state.' },
];

const RULES = [
  {
    title: 'Only the right party can act',
    body: 'Minting needs the manufacturer role. Receiving and verifying need the lab role, and the caller must hold the token.',
  },
  {
    title: 'Steps cannot be skipped',
    body: 'Each call checks the current state first. A batch cannot be consumed before it is verified, or verified twice.',
  },
  {
    title: 'Custody only moves one way',
    body: 'Ordinary NFT transfers are switched off. A batch changes hands only by being shipped to a registered lab.',
  },
  {
    title: 'Verification needs two checks',
    body: 'A Groth16 proof that the lab scan matches the committed fingerprint, plus a verdict signed by the oracle key.',
  },
];

const FACTS = [
  { value: '26',     label: 'contract tests passing' },
  { value: '~259k',  label: 'gas to verify a proof on-chain' },
  { value: '1,939',  label: 'constraints in the proof circuit' },
  { value: '0 POL',  label: 'gas paid by users' },
];

const STACK = ['Solidity 0.8.28', 'OpenZeppelin', 'Hardhat', 'Circom + Groth16', 'ERC-4337', 'Polygon Amoy', 'React'];

const label = {
  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 500,
  letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)',
};

function short(address) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

/* ── Hero ────────────────────────────────────────────────────── */
function Hero() {
  const { authenticated, login, ready } = useAuth();
  const { role } = useRole();
  const home = role === 'lab' ? '/lab' : '/dashboard';

  return (
    <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="app-container landing-hero">
        <div>
          <div style={{ ...label, marginBottom: '1.25rem' }}>Polygon Amoy testnet</div>
          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.2vw, 3.25rem)', fontWeight: 600,
            lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.25rem',
          }}>
            Reagent batches you can trace and verify.
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 500, marginBottom: '2rem' }}>
            TraceRx records each reagent batch as a token on Polygon and follows it from
            the manufacturer to the lab. A batch is marked genuine only after a
            zero-knowledge proof checks out on-chain.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {authenticated ? (
              <Link to={home} className="btn btn-chain">Open dashboard <ArrowRight size={16} /></Link>
            ) : (
              <button type="button" onClick={login} disabled={!ready} className="btn btn-chain">
                Sign in <ArrowRight size={16} />
              </button>
            )}
            <Link to="/details" className="btn btn-outline"><Search size={15} /> Look up a batch</Link>
          </div>
        </div>

        {/* A batch record, as the contract stores it */}
        <div className="landing-record">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
            <span style={label}>Batch record</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Token #6</span>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {LIFECYCLE.map((step, i) => (
              <li key={step.state} className="record-row">
                <span className="record-dot"><Check size={11} strokeWidth={3} /></span>
                {i < LIFECYCLE.length - 1 && <span className="record-line" />}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500 }}>{step.state}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.who}</span>
              </li>
            ))}
          </ol>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.25rem', paddingTop: '1rem', display: 'grid', gap: '0.5rem' }}>
            <div className="record-meta"><span>Fingerprint</span><span>hash only, 0x21ab7817…</span></div>
            <div className="record-meta"><span>Tolerance</span><span>±10 per peak</span></div>
            <div className="record-meta">
              <span>Contract</span>
              <a href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                {short(CONTRACT_ADDRESS)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Lifecycle ───────────────────────────────────────────────── */
function Lifecycle() {
  return (
    <section className="landing-section">
      <div className="app-container">
        <div style={label}>How a batch moves</div>
        <h2 className="landing-h2">Five states, each entered by one contract call.</h2>
        <div className="lifecycle-grid">
          {LIFECYCLE.map((step, i) => (
            <div key={step.state} className="lifecycle-step">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '0.9rem' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.3rem' }}>{step.state}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-dim)', marginBottom: '0.75rem' }}>{step.who}</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.9rem' }}>{step.note}</p>
              <code className="mono-tag">{step.call}()</code>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Rules ───────────────────────────────────────────────────── */
function Rules() {
  return (
    <section className="landing-section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="app-container landing-split">
        <div>
          <div style={label}>What the contract enforces</div>
          <h2 className="landing-h2" style={{ marginBottom: '1rem' }}>The rules live in the contract, not in the app.</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 380 }}>
            A call that breaks a rule is rejected by the chain itself, whichever app or script sent it.
          </p>
        </div>
        <div className="rules-grid">
          {RULES.map(rule => (
            <div key={rule.title}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.4rem' }}>{rule.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{rule.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Facts ───────────────────────────────────────────────────── */
function Facts() {
  return (
    <section className="landing-section">
      <div className="app-container">
        <div style={label}>Measured</div>
        <div className="facts-grid">
          {FACTS.map(fact => (
            <div key={fact.label}>
              <div style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{fact.value}</div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{fact.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '2.5rem 0 3rem' }}>
      <div className="app-container" style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {STACK.map(item => <span key={item} className="mono-tag">{item}</span>)}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 760 }}>
          Reference: M. Dashtizadeh, F. Meskaran and D. Tan, &ldquo;A Secure Blockchain-based Pharmaceutical
          Supply Chain Management System: Traceability and Detection of Counterfeit Covid-19 Vaccines,&rdquo;
          IEEE MysuruCon, 2022.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
          <a href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="footer-link">
            Contract on Polygonscan <ArrowUpRight size={14} />
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
            Source code <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ── Page Assembly ───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div>
      <Hero />
      <Lifecycle />
      <Rules />
      <Facts />
      <Footer />

      <style>{`
        .landing-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 4rem;
          align-items: center;
          padding-top: 5rem;
          padding-bottom: 5rem;
        }
        .landing-record {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          background: var(--bg);
        }
        .record-row {
          position: relative;
          display: grid;
          grid-template-columns: 20px 1fr auto;
          align-items: center;
          column-gap: 0.75rem;
          padding: 0.45rem 0;
        }
        .record-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .record-line {
          position: absolute; left: 8.5px; top: 50%;
          width: 1px; height: 100%;
          background: var(--border-strong);
        }
        .record-meta {
          display: flex; justify-content: space-between; gap: 1rem;
          font-size: 0.8rem; color: var(--text-muted);
        }
        .record-meta > :last-child { font-family: var(--font-mono); font-size: 0.76rem; color: var(--text); }
        .record-meta a { color: var(--accent-dim); }
        .landing-section { padding: 4.5rem 0; }
        .landing-h2 {
          font-size: clamp(1.4rem, 2.4vw, 1.85rem);
          font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
          margin: 0.6rem 0 2.25rem; max-width: 620px;
        }
        .lifecycle-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--surface);
          overflow: hidden;
        }
        .lifecycle-step { padding: 1.4rem 1.25rem 1.5rem; border-left: 1px solid var(--border); }
        .lifecycle-step:first-child { border-left: none; }
        .landing-split {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 4rem;
        }
        .rules-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 2.5rem; }
        .facts-grid {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2rem; margin-top: 1.5rem;
        }
        .footer-link { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--text); }
        .footer-link:hover { color: var(--accent-dim); }
        @media (max-width: 960px) {
          .landing-hero, .landing-split { grid-template-columns: 1fr; gap: 2.5rem; }
          .landing-hero { padding-top: 3rem; padding-bottom: 3rem; }
          .lifecycle-grid { grid-template-columns: 1fr; }
          .lifecycle-step { border-left: none; border-top: 1px solid var(--border); }
          .lifecycle-step:first-child { border-top: none; }
          .facts-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .rules-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
