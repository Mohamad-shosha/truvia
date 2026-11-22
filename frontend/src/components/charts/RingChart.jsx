import { useId } from 'react';

const SIZE = 150;
const STROKE = 9;
const GAP = 5;
const SWEEP = 270; // degrees available to the largest value

function arc(r, degrees) {
  const c = SIZE / 2;
  const start = -90;
  const end = start + Math.max(0.01, Math.min(degrees, 359.99));
  const rad = (d) => (d * Math.PI) / 180;
  const [x1, y1] = [c + r * Math.cos(rad(start)), c + r * Math.sin(rad(start))];
  const [x2, y2] = [c + r * Math.cos(rad(end)), c + r * Math.sin(rad(end))];
  return `M${x1.toFixed(2)},${y1.toFixed(2)}A${r},${r} 0 ${end - start > 180 ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

/**
 * Concentric radial bars: one ring per category, angle proportional to its count (largest = 270°).
 * The legend names every ring with its count and share, so identity never depends on colour alone.
 * items: [{ key, label, count, tone }] where tone is a CSS class suffix (e.g. 'cat-1', 'lvl-critical').
 */
export default function RingChart({ items, label }) {
  const titleId = useId();
  const total = items.reduce((a, i) => a + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));
  const outer = SIZE / 2 - STROKE / 2 - 2;

  return (
    <div className="ring">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="ring__svg" role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {label}: {items.map((i) => `${i.label} ${i.count}`).join(', ')}
        </title>
        {items.map((item, idx) => {
          const r = outer - idx * (STROKE + GAP);
          return (
            <g key={item.key}>
              <circle cx={SIZE / 2} cy={SIZE / 2} r={r} className="ring__track" strokeWidth={STROKE} />
              {item.count > 0 && (
                <path d={arc(r, (item.count / max) * SWEEP)} className={`ring__arc tone--${item.tone}`} strokeWidth={STROKE} />
              )}
            </g>
          );
        })}
      </svg>
      <ul className="ring__legend">
        {items.map((item) => (
          <li key={item.key}>
            <span className={`ring__swatch tone--${item.tone}`} aria-hidden="true" />
            <span className="ring__name">{item.label}</span>
            <span className="ring__count">
              {item.count}
              <span className="muted"> · {total ? Math.round((item.count / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
