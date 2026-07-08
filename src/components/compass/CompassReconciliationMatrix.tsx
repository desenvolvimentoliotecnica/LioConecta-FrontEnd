import { Fragment } from "react";
import { GAP_AREA_LABELS } from "../../config/compass/constants";
import "../../styles/compass-reconciliation.css";

type CompassReconciliationMatrixProps = {
  matrix: Record<string, number>;
};

const ROWS = ["demand", "supply", "finance"] as const;
const COLS = ["demand", "supply", "finance"] as const;

function cellLevel(count: number): "none" | "low" | "medium" | "high" {
  if (count === 0) return "none";
  if (count === 1) return "low";
  if (count === 2) return "medium";
  return "high";
}

export function CompassReconciliationMatrix({ matrix }: CompassReconciliationMatrixProps) {
  return (
    <div className="compass-matrix" aria-label="Matriz de gaps entre demanda, supply e financeiro">
      <div className="compass-matrix__corner" />
      {COLS.map((col) => (
        <div key={`col-${col}`} className="compass-matrix__col-header">
          {GAP_AREA_LABELS[col]}
        </div>
      ))}

      {ROWS.map((row) => (
        <Fragment key={row}>
          <div className="compass-matrix__row-header">{GAP_AREA_LABELS[row]}</div>
          {COLS.map((col) => {
            if (row === col) {
              return (
                <div key={`${row}-${col}`} className="compass-matrix__cell compass-matrix__cell--diag">
                  —
                </div>
              );
            }
            const count = matrix[`${row}-${col}`] ?? 0;
            const level = cellLevel(count);
            return (
              <div
                key={`${row}-${col}`}
                className={`compass-matrix__cell compass-matrix__cell--${level}`}
                title={`${GAP_AREA_LABELS[row]} → ${GAP_AREA_LABELS[col]}`}
              >
                {count > 0 ? count : ""}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
