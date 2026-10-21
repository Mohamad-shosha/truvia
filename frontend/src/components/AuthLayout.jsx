import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { BrainIcon, ChartIcon, ChecklistIcon, GlobeIcon, ShieldIcon } from './icons';

const FEATURES = [
  { icon: <ShieldIcon />, title: 'Risk', sub: 'Management' },
  { icon: <ChecklistIcon />, title: 'Compliance', sub: 'Automation' },
  { icon: <ChartIcon />, title: 'Real-time', sub: 'Insights' },
  { icon: <BrainIcon />, title: 'AI-Powered', sub: 'Decisions' },
];

/**
 * Background illustration. Drawn in the coordinate space of the 1024x576 reference
 * canvas so every element sits exactly where it does in the design.
 */
function StageArt() {
  return (
    <svg className="stage-art" viewBox="0 0 1024 576" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sa-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--sa-face-1)" />
          <stop offset="1" stopColor="var(--sa-face-2)" />
        </linearGradient>
        <linearGradient id="sa-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sa-rim-1)" />
          <stop offset="1" stopColor="var(--sa-rim-2)" />
        </linearGradient>
        <linearGradient id="sa-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7be3a8" stopOpacity=".5" />
          <stop offset="1" stopColor="#1fae5b" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="sa-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fd57f" />
          <stop offset="1" stopColor="#12934a" />
        </linearGradient>
        <linearGradient id="sa-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1fae5b" stopOpacity="0" />
          <stop offset=".25" stopColor="#1fae5b" stopOpacity=".95" />
          <stop offset=".85" stopColor="#3fd57f" stopOpacity=".7" />
          <stop offset="1" stopColor="#3fd57f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sa-globe" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="var(--sa-globe-fill)" stopOpacity=".7" />
          <stop offset="1" stopColor="var(--sa-globe-fill)" stopOpacity="0" />
        </radialGradient>
        <filter id="sa-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="sa-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="9" stdDeviation="9" floodColor="var(--sa-shadow)" />
        </filter>
      </defs>

      {/* faint architectural panels on the right / bottom */}
      <g fill="var(--sa-panel-fill)" stroke="var(--sa-panel-stroke)" strokeWidth="1">
        <polygon points="968,126 1060,96 1060,236 968,262" />
        <polygon points="1000,300 1090,262 1090,420 1000,462" />
        <polygon points="470,520 640,470 760,500 590,576 470,576" />
        <polygon points="760,500 900,470 1000,500 860,576 740,576" />
      </g>

      {/* faint holographic globe */}
      <g className="stage-art__globe">
        <circle cx="436" cy="128" r="112" fill="url(#sa-globe)" />
        <g stroke="var(--sa-globe-stroke)" strokeWidth="1" strokeDasharray="2 4">
          <circle cx="436" cy="128" r="112" />
          <ellipse cx="436" cy="128" rx="112" ry="40" />
          <ellipse cx="436" cy="128" rx="112" ry="78" />
          <ellipse cx="436" cy="128" rx="40" ry="112" />
          <ellipse cx="436" cy="128" rx="78" ry="112" />
        </g>
        <g stroke="var(--sa-link)" strokeWidth="1">
          <path d="M437 89L521 151L473 218L423 401" />
          <path d="M437 89L360 160L400 250" strokeOpacity=".6" />
        </g>
        <g fill="#1fae5b">
          <circle cx="437" cy="89" r="3.2" />
          <circle cx="521" cy="151" r="3" />
          <circle cx="473" cy="218" r="3.2" />
          <circle cx="360" cy="160" r="2.2" opacity=".6" />
        </g>
        <g stroke="#1fae5b" strokeOpacity=".45">
          <circle cx="521" cy="151" r="6" />
          <circle cx="473" cy="218" r="6" />
        </g>
      </g>

      {/* thin accent lines */}
      <path d="M476 30L616 -4" stroke="var(--sa-link)" strokeWidth="1" />
      <path d="M940 306L1100 232" stroke="#1fae5b" strokeOpacity=".75" strokeWidth="1.4" />

      {/* circuit ribbons */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M-200 520C-90 505 -30 505 58 517C130 528 190 548 260 536C300 528 316 516 326 513C380 506 430 488 520 450"
          stroke="#1fae5b"
          strokeOpacity=".35"
          strokeWidth="9"
          filter="url(#sa-blur)"
        />
        <path
          d="M-200 520C-90 505 -30 505 58 517C130 528 190 548 260 536C300 528 316 516 326 513C380 506 430 488 520 450"
          stroke="url(#sa-line)"
          strokeWidth="2"
        />
        <path d="M-200 392C-110 392 -40 396 0 408C30 417 50 428 66 439C85 452 100 470 120 492" stroke="url(#sa-line)" strokeWidth="1.6" />
        <path d="M62 404V439" stroke="#1fae5b" strokeOpacity=".55" strokeWidth="1.2" />
        <path d="M318 455C350 446 392 428 423 401" stroke="#1fae5b" strokeOpacity=".65" strokeWidth="1.4" />
        <path d="M326 513L318 455" stroke="#1fae5b" strokeOpacity=".65" strokeWidth="1.4" />
        <path d="M168 527C150 548 100 556 40 548" stroke="#1fae5b" strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="4 4" />
      </g>
      <g fill="#1fae5b">
        <circle cx="62" cy="404" r="3" />
        <circle cx="66" cy="439" r="3.6" />
        <circle cx="58" cy="517" r="3.6" />
        <circle cx="318" cy="455" r="3.2" />
        <circle cx="326" cy="513" r="3.8" />
        <circle cx="423" cy="401" r="3.4" />
      </g>
      <g stroke="#1fae5b" strokeOpacity=".5" strokeWidth="1.2">
        <circle cx="66" cy="439" r="7.5" />
        <circle cx="326" cy="513" r="7.5" />
      </g>

      {/* floating 3D shield */}
      <g className="stage-art__shield">
        <ellipse cx="164" cy="540" rx="86" ry="12" fill="#1fae5b" fillOpacity=".4" filter="url(#sa-blur)" />

        {/* glass slabs behind the shield */}
        <path d="M172 372L238 356L247 480L178 500Z" fill="url(#sa-glass)" stroke="#5fd391" strokeOpacity=".8" strokeWidth="1.4" />
        <path d="M188 384L244 370L250 470L192 488Z" fill="var(--sa-glass-2)" stroke="#8be6b2" strokeOpacity=".7" strokeWidth="1.2" />

        {/* shield body */}
        <g filter="url(#sa-shadow)">
          <path
            d="M108 404C132 396 196 394 222 404V442C222 492 197 516 166 531C163 532 158 532 155 531C124 516 108 492 108 442Z"
            fill="url(#sa-rim)"
          />
        </g>
        <path
          d="M117 413C139 406 191 405 213 413V442C213 485 192 506 164 519C162 520 160 520 158 519C130 506 117 485 117 442Z"
          fill="url(#sa-face)"
          stroke="var(--sa-face-stroke)"
          strokeWidth="1.2"
        />
        <path d="M122 418C146 411 184 411 208 418C186 424 150 432 122 450Z" fill="var(--sa-gloss)" />

        {/* TRUVIA mark */}
        <g transform="translate(163 459)">
          <path
            d="M-22 -19H22C25 -19 27 -16 25 -13L3 20C1.5 22 -1.5 22 -3 20L-25 -13C-27 -16 -25 -19 -22 -19Z"
            stroke="url(#sa-mark)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path d="M0 -9V2" stroke="#22b862" strokeWidth="4.6" strokeLinecap="round" />
          <circle cx="0" cy="10" r="2.6" fill="#22b862" />
        </g>
      </g>
    </svg>
  );
}

/** Two-column marketing + form layout, built on a 1024x576 reference canvas. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-stage">
        <StageArt />

        <div className="auth-page__tools">
          <ThemeToggle />
          <span className="auth-page__tools-divider" aria-hidden="true" />
          <button type="button" className="icon-btn" aria-label="Language selection" title="Language selection">
            <GlobeIcon />
          </button>
        </div>

        <section className="hero" aria-label="About TRUVIA">
          <header className="hero__header">
            <Logo size={42} className="logo--hero" />
          </header>

          <h2 className="hero__title">
            Intelligence
            <br />
            for a <span className="accent">Safer Tomorrow.</span>
          </h2>
          <p className="hero__sub">AI-powered cybersecurity risk management &amp; compliance platform.</p>

          <ul className="hero__features">
            {FEATURES.map((f) => (
              <li key={f.title} className="hero__feature">
                <span className="hero__feature-icon">{f.icon}</span>
                <span className="hero__feature-label">
                  {f.title}
                  <br />
                  {f.sub}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <main className="auth-panel">
          <div className="auth-card">{children}</div>
        </main>
      </div>
    </div>
  );
}
