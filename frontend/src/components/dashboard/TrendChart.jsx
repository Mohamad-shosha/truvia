import { useId, useState } from 'react';
import { formatShortDay } from '../../utils/format';

const W = 560;
const H = 180;
const PAD = { top: 12, right: 8, bottom: 24, left: 30 };

/** Smallest "nice" axis maximum (1, 2, 5 x 10^k) that is >= value; at least 4 so tiny counts read well. */
export function niceMax(value) {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) {
    if (step * pow >= value) return step * pow;
  }
  return 10 * pow;
}

/** Bar with 4px rounded data-end, anchored square to the baseline. */
function barPath(x, y, w, h) {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

/**
 * Single-series daily bar chart (one hue, no legend: the card title names the series).
 * Hover or keyboard focus on a day shows its value; a visually hidden table carries the same data.
 */
export default function TrendChart({ data, unit = 'sign-ins', label }) {
  const [active, setActive] = useState(null);
  const titleId = useId();
  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.max(4, Math.min(26, band - 6));
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelIdx = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);
  const activePoint = active == null ? null : data[active];

  return (
    <div className="trend">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="trend__svg"
        role="img"
        aria-labelledby={titleId}
        onMouseLeave={() => setActive(null)}
      >
        <title id={titleId}>{label}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="trend__grid" />
            <text x={PAD.left - 8} y={y(t)} className="trend__axis" textAnchor="end" dominantBaseline="middle">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = PAD.left + i * band + (band - barW) / 2;
          const h = (d.count / max) * innerH;
          return (
            <g key={d.date}>
              {d.count > 0 && (
                <path d={barPath(x, y(d.count), barW, h)} className={`trend__bar${active === i ? ' is-active' : ''}`} />
              )}
              {labelIdx.has(i) && (
                <text x={x + barW / 2} y={H - 6} className="trend__axis" textAnchor="middle">
                  {formatShortDay(d.date)}
                </text>
              )}
              {/* Hit target: the whole day band, taller than the mark. */}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={innerH}
                className="trend__hit"
                tabIndex={0}
                aria-label={`${formatShortDay(d.date)}: ${d.count} ${unit}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>
      {activePoint && (
        <div
          className="trend__tip"
          role="status"
          style={{ left: `${((PAD.left + (active + 0.5) * band) / W) * 100}%` }}
        >
          <strong>{activePoint.count}</strong> {unit}
          <span>{formatShortDay(activePoint.date)}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
