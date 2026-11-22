import { LEVEL_LABELS, levelOf } from '../../utils/risk';

/**
 * 5x5 likelihood x impact grid. Each cell is tinted by its score band and shows how many active risks sit
 * there (residual position) plus the band name, so meaning never rests on colour alone.
 * `cells[likelihood-1][impact-1]` = count.
 */
export default function HeatMap({ cells }) {
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];
  return (
    <div className="heatmap">
      <span className="heatmap__ylabel" aria-hidden="true">
        Likelihood
      </span>
      <table className="heatmap__grid" aria-label="Active risks by residual likelihood and impact">
        <thead className="sr-only">
          <tr>
            <th scope="col">Likelihood</th>
            {cols.map((i) => (
              <th key={i} scope="col">
                Impact {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l}>
              <th scope="row" className="heatmap__axis">
                {l}
              </th>
              {cols.map((i) => {
                const level = levelOf(l * i);
                const count = cells?.[l - 1]?.[i - 1] ?? 0;
                return (
                  <td
                    key={i}
                    className={`heatmap__cell lvl-bg--${level.toLowerCase()}${count ? '' : ' is-empty'}`}
                    title={`Likelihood ${l} × Impact ${i} = ${l * i} (${LEVEL_LABELS[level]}): ${count} risk${count === 1 ? '' : 's'}`}
                  >
                    <span className="heatmap__count">{count}</span>
                    <span className="heatmap__band">{LEVEL_LABELS[level].toLowerCase()}</span>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr aria-hidden="true">
            <th />
            {cols.map((i) => (
              <th key={i} className="heatmap__axis">
                {i}
              </th>
            ))}
          </tr>
        </tbody>
      </table>
      <span className="heatmap__xlabel" aria-hidden="true">
        Impact
      </span>
    </div>
  );
}
