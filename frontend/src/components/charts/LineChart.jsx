import { useId, useState } from 'react';
import { formatShortDay } from '../../utils/format';

const W = 560;
const H = 200;
const PAD = { top: 16, right: 28, bottom: 26, left: 34 };

/** Axis domain padded to the nearest 10 around the data, clamped to 0-100. */
export function scoreDomain(values) {
  if (!values.length) return [0, 100];
  const lo = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  const hi = Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10);
  return hi - lo < 20 ? [Math.max(0, hi - 20), Math.max(hi, 20)] : [lo, hi];
}

/**
 * Single-series line (2px) with a soft area, the latest value labelled directly, and a crosshair + tooltip on
 * hover / arrow keys. A visually hidden table carries the same numbers.
 */
export default function LineChart({ data, label, unit = 'points', format = (v) => v }) {
  const [active, setActive] = useState(null);
  const titleId = useId();
  const values = data.map((d) => Number(d.value));
  const [lo, hi] = scoreDomain(values);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - ((v - lo) / (hi - lo || 1)) * innerH;
  const ticks = [0, 1, 2, 3].map((k) => lo + ((hi - lo) * k) / 3);
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = values.length ? `${path}L${x(values.length - 1)},${PAD.top + innerH}L${x(0)},${PAD.top + innerH}Z` : '';
  const labelIdx = [...new Set([0, Math.round((data.length - 1) / 2), data.length - 1])].filter((i) => i >= 0);
  const last = values.length - 1;

  function pick(clientX, rect) {
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / innerW) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  }

  function onKey(e) {
    if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? last) - 1));
    else if (e.key === 'ArrowRight') setActive((a) => Math.min(last, (a ?? -1) + 1));
    else return;
    e.preventDefault();
  }

  const point = active == null ? null : data[active];

  return (
    <div className="linechart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="linechart__svg"
        role="img"
        aria-labelledby={titleId}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onMouseMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setActive(null)}
      >
        <title id={titleId}>{label}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={PAD.left - 8} y={y(t)} className="chart-axis" textAnchor="end" dominantBaseline="middle">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 6} className="chart-axis" textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}>
            {formatShortDay(data[i].date)}
          </text>
        ))}
        {values.length > 1 && <path d={area} className="linechart__area" />}
        <path d={path} className="linechart__line" />
        {last >= 0 && (
          <g>
            <circle cx={x(last)} cy={y(values[last])} r="4" className="linechart__dot" />
            <text x={x(last)} y={y(values[last]) - 10} className="linechart__value" textAnchor="end">
              {format(values[last])}
            </text>
          </g>
        )}
        {point && (
          <g aria-hidden="true">
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} className="linechart__cross" />
            <circle cx={x(active)} cy={y(values[active])} r="5" className="linechart__dot linechart__dot--active" />
          </g>
        )}
      </svg>
      {point && (
        <div className="chart-tip" role="status" style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(values[active]) / H) * 100}%` }}>
          <strong>{format(values[active])}</strong> {unit}
          <span>{formatShortDay(point.date)}</span>
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
              <td>{format(Number(d.value))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
