import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { BrainIcon, ChartIcon, ChecklistIcon, GlobeIcon, ShieldIcon } from './icons';

const FEATURES = [
  { icon: <ShieldIcon />, title: 'Risk', sub: 'Management' },
  { icon: <ChecklistIcon />, title: 'Compliance', sub: 'Automation' },
  { icon: <ChartIcon />, title: 'Real-time', sub: 'Insights' },
  { icon: <BrainIcon />, title: 'AI-Powered', sub: 'Decisions' },
];

function HeroArt() {
  return (
    <div className="hero__art-container">
      <svg className="hero__art" viewBox="0 0 620 440" fill="none" aria-hidden="true" focusable="false">
        <defs>
          {/* Gradients */}
          <linearGradient id="shield-front-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--shield-front-1, #ffffff)" />
            <stop offset="60%" stopColor="var(--shield-front-2, #f3faf6)" />
            <stop offset="100%" stopColor="var(--shield-front-3, #d7f5e3)" />
          </linearGradient>

          <linearGradient id="shield-bevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--shield-bevel-1, #ffffff)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--shield-bevel-2, #34d399)" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="glass-pane-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="glass-pane-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="circuit-grad-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="circuit-grad-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.15" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shield-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-10" dy="24" stdDeviation="18" floodColor="var(--shield-shadow-color, rgba(16, 185, 129, 0.28))" />
          </filter>

          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Ambient Floor Glow */}
        <ellipse cx="160" cy="360" rx="140" ry="40" fill="var(--art-floor-glow, rgba(16, 185, 129, 0.2))" filter="url(#soft-glow)" />
        <ellipse cx="360" cy="380" rx="200" ry="30" fill="var(--art-floor-glow-2, rgba(52, 211, 153, 0.15))" filter="url(#soft-glow)" />

        {/* Holographic Wireframe Globe in upper area */}
        <g className="hero__globe" opacity="var(--globe-opacity, 0.75)">
          {/* Main sphere outlines */}
          <circle cx="410" cy="160" r="140" stroke="var(--globe-stroke, rgba(16, 185, 129, 0.18))" strokeWidth="1" strokeDasharray="3 4" />
          <ellipse cx="410" cy="160" rx="140" ry="50" stroke="var(--globe-stroke, rgba(16, 185, 129, 0.18))" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="410" cy="160" rx="140" ry="95" stroke="var(--globe-stroke, rgba(16, 185, 129, 0.18))" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="410" cy="160" rx="50" ry="140" stroke="var(--globe-stroke, rgba(16, 185, 129, 0.18))" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="410" cy="160" rx="95" ry="140" stroke="var(--globe-stroke, rgba(16, 185, 129, 0.18))" strokeWidth="1" strokeDasharray="4 4" />

          {/* Holographic globe nodes */}
          <circle cx="410" cy="65" r="3" fill="#10b981" />
          <circle cx="475" cy="115" r="3" fill="#10b981" />
          <circle cx="340" cy="130" r="2.5" fill="#34d399" />
          <circle cx="445" cy="175" r="3.5" fill="#10b981" filter="url(#neon-glow)" />
          <circle cx="370" cy="210" r="2.5" fill="#34d399" />
          <circle cx="510" cy="190" r="3" fill="#10b981" />
          <circle cx="410" cy="255" r="2.5" fill="#34d399" />
          <circle cx="310" cy="180" r="3" fill="#10b981" />

          {/* Connecting holographic grid lines */}
          <path d="M 340 130 L 410 65 L 475 115 L 445 175 L 370 210 Z" stroke="var(--globe-connect, rgba(16, 185, 129, 0.25))" strokeWidth="1" fill="none" />
          <path d="M 445 175 L 510 190 L 410 255" stroke="var(--globe-connect, rgba(16, 185, 129, 0.22))" strokeWidth="1" fill="none" />
        </g>

        {/* High-tech Isometric Ground Circuit Tracks */}
        <g className="hero__circuits" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Main primary energy stream sweeping right */}
          <path
            d="M 15 365 C 70 345, 120 375, 175 360 C 240 340, 290 390, 365 370 C 430 355, 490 380, 595 320"
            stroke="url(#circuit-grad-1)"
            strokeWidth="3"
            filter="url(#neon-glow)"
          />
          {/* Secondary lower track */}
          <path
            d="M 50 395 C 110 405, 180 375, 245 400 C 310 425, 385 385, 455 405 C 515 420, 560 380, 615 360"
            stroke="url(#circuit-grad-2)"
            strokeWidth="2"
          />
          {/* Branch connecting to shield base */}
          <path
            d="M 125 320 C 145 345, 175 350, 205 340 C 235 330, 265 345, 290 335"
            stroke="url(#circuit-grad-1)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {/* Upward diagonal data stream */}
          <path
            d="M 245 400 L 290 335 C 330 305, 375 330, 420 315 L 490 280"
            stroke="var(--circuit-stream, rgba(16, 185, 129, 0.45))"
            strokeWidth="1.8"
          />

          {/* Circuit nodes / luminous pulses */}
          <g className="hero__circuit-nodes" fill="#10b981">
            <circle cx="75" cy="358" r="4" filter="url(#neon-glow)" />
            <circle cx="175" cy="360" r="5" />
            <circle cx="175" cy="360" r="9" stroke="#10b981" strokeWidth="1.5" opacity="0.4" fill="none" />

            <circle cx="245" cy="400" r="4.5" />
            <circle cx="290" cy="335" r="4" filter="url(#neon-glow)" />

            <circle cx="365" cy="370" r="5.5" />
            <circle cx="365" cy="370" r="11" stroke="#34d399" strokeWidth="1.5" opacity="0.35" fill="none" />

            <circle cx="455" cy="405" r="4" />
            <circle cx="490" cy="280" r="3.5" filter="url(#neon-glow)" />
            <circle cx="560" cy="340" r="4" />
          </g>
        </g>

        {/* 3D Isometric Layered Shield Floating at bottom left */}
        <g className="hero__shield-3d" filter="url(#shield-shadow)">
          {/* Back Glass Pane (Angled in Isometric Perspective) */}
          <path
            d="M 130 160 L 210 205 L 210 325 L 130 280 Z"
            transform="rotate(6 170 242) skewY(-8)"
            fill="url(#glass-pane-1)"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeOpacity="0.7"
          />

          {/* Middle Glass Pane with Neon Edge */}
          <path
            d="M 115 175 L 195 220 L 195 335 L 115 290 Z"
            transform="rotate(3 155 255) skewY(-5)"
            fill="url(#glass-pane-2)"
            stroke="#10b981"
            strokeWidth="2.8"
            strokeOpacity="0.85"
            filter="url(#neon-glow)"
          />

          {/* Front Glossy Shield */}
          <g transform="matrix(0.96 0 -0.15 0.98 50 20)">
            {/* Outer Shield Shell */}
            <path
              d="M 70 185 Q 120 180, 160 195 C 160 250, 145 295, 70 330 C -5 295, -20 250, -20 195 Q 20 180, 70 185 Z"
              fill="url(#shield-front-grad)"
              stroke="url(#shield-bevel)"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Inner Shield Bevel Rim */}
            <path
              d="M 70 197 Q 112 193, 146 206 C 146 250, 133 286, 70 316 C 7 286, -6 250, -6 206 Q 28 193, 70 197 Z"
              fill="var(--shield-inner, #ffffff)"
              stroke="var(--shield-inner-stroke, #a7f3d0)"
              strokeWidth="2"
              opacity="0.95"
            />

            {/* TRUVIA Exclamation Emblem inside Shield */}
            <g transform="translate(70, 245) scale(0.9)">
              {/* Inverted Triangle Badge */}
              <path
                d="M -30 -30 H 30 C 34 -30 36 -26 34 -22 L 4 28 C 2 31 -2 31 -4 28 L -34 -22 C -36 -26 -34 -30 -30 -30 Z"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              {/* Exclamation Bar */}
              <line
                x1="0"
                y1="-20"
                x2="0"
                y2="-3"
                stroke="#10b981"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Exclamation Dot */}
              <circle
                cx="0"
                cy="9"
                r="3"
                fill="#10b981"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

/** Two-column marketing + form layout matching the TRUVIA reference design. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      {/* Top Right Controls: Theme Toggle | Language */}
      <div className="auth-page__tools">
        <ThemeToggle />
        <span className="auth-page__tools-divider" aria-hidden="true" />
        <button
          type="button"
          className="icon-btn icon-btn--ghost"
          aria-label="Language selection"
          title="Language selection"
        >
          <GlobeIcon />
        </button>
      </div>

      {/* Left Column: Hero branding, features, and 3D illustration */}
      <section className="hero" aria-label="About TRUVIA">
        <header className="hero__header">
          <Logo size={42} />
        </header>

        <div className="hero__intro">
          <h2 className="hero__title">
            Intelligence
            <br />
            for a <span className="accent">Safer Tomorrow.</span>
          </h2>
          <p className="hero__sub">AI-powered cybersecurity risk management &amp; compliance platform.</p>
        </div>

        <ul className="hero__features">
          {FEATURES.map((f) => (
            <li key={f.title} className="hero__feature-card">
              <span className="hero__feature-icon">{f.icon}</span>
              <span className="hero__feature-label">
                <span className="hero__feature-title">{f.title}</span>
                <span className="hero__feature-sub">{f.sub}</span>
              </span>
            </li>
          ))}
        </ul>

        <HeroArt />
      </section>

      {/* Right Column: Floating Auth Card */}
      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
