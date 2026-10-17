import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { BrainIcon, ChartIcon, ChecklistIcon, ShieldIcon } from './icons';

const FEATURES = [
  { icon: <ShieldIcon />, title: 'Risk', sub: 'Management' },
  { icon: <ChecklistIcon />, title: 'Compliance', sub: 'Automation' },
  { icon: <ChartIcon />, title: 'Real-time', sub: 'Insights' },
  { icon: <BrainIcon />, title: 'AI-Powered', sub: 'Decisions' },
];

function HeroArt() {
  return (
    <svg className="hero__art" viewBox="0 0 420 300" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="art-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9f5e4" />
        </linearGradient>
        <linearGradient id="art-glow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#22c55e" stopOpacity="0" />
          <stop offset="1" stopColor="#22c55e" stopOpacity=".55" />
        </linearGradient>
        <filter id="art-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse cx="210" cy="250" rx="170" ry="26" fill="url(#art-glow)" filter="url(#art-blur)" />
      <g className="hero__orbits" fill="none" stroke="#22c55e" strokeOpacity=".35">
        <ellipse cx="210" cy="160" rx="190" ry="70" />
        <ellipse cx="210" cy="160" rx="150" ry="52" strokeOpacity=".25" />
        <path d="M10 210C90 150 150 230 230 180s130-40 180-90" strokeOpacity=".5" />
      </g>
      <g fill="#22c55e">
        <circle cx="52" cy="196" r="4" />
        <circle cx="352" cy="102" r="4" />
        <circle cx="318" cy="228" r="3.5" />
        <circle cx="96" cy="120" r="3" />
      </g>
      <rect x="246" y="46" width="96" height="130" rx="14" fill="#fff" opacity=".6" transform="rotate(8 294 111)" />
      <path d="M210 30l86 32v70c0 56-36 98-86 120-50-22-86-64-86-120V62z" fill="url(#art-shield)" stroke="#bfe8cf" strokeWidth="3" />
      <path d="M210 52l66 24v56c0 44-28 78-66 96-38-18-66-52-66-96V76z" fill="#f4fbf7" stroke="#d3efdf" strokeWidth="2" />
      <path d="M170 100h80l-40 78z" fill="#16a34a" />
      <path d="M190 108h40l-20 38z" fill="#fff" />
      <circle cx="210" cy="124" r="5" fill="#16a34a" />
    </svg>
  );
}

/** Two-column marketing + form layout shared by Login and Register. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-page__tools">
        <ThemeToggle />
      </div>

      <section className="hero" aria-label="About TRUVIA">
        <Logo size={44} />
        <h2 className="hero__title">
          Intelligence
          <br />
          for a <span className="accent">Safer Tomorrow.</span>
        </h2>
        <p className="hero__sub">AI-powered cybersecurity risk management &amp; compliance platform.</p>

        <ul className="hero__features">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className="hero__feature-icon">{f.icon}</span>
              <span>
                {f.title}
                <br />
                {f.sub}
              </span>
            </li>
          ))}
        </ul>
        <HeroArt />
      </section>

      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
