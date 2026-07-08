import { Fragment } from "react";
import type { CompassReconciliationCellDto } from "../../api/types";
import { formatCompassCurrency, formatCompassPercent } from "../../utils/compassView";
import "../../styles/compass-help.css";

type Props = {
  cells: CompassReconciliationCellDto[];
};

export function CompassDiretoriaTipoMatrix({ cells }: Props) {
  const directorias = [...new Set(cells.map((c) => c.diretoria))];
  const tipos = [...new Set(cells.map((c) => c.tipo))];

  function cellFor(diretoria: string, tipo: string) {
    return cells.find((c) => c.diretoria === diretoria && c.tipo === tipo);
  }

  function cellClass(pct: number): string {
    if (Math.abs(pct) < 1) return "neutral";
    return pct > 0 ? "positive" : "negative";
  }

  return (
    <div
      className="compass-matrix-dt"
      style={{ gridTemplateColumns: `minmax(7rem, 1fr) repeat(${tipos.length}, minmax(5rem, 1fr))` }}
      aria-label="Matriz Diretoria por Tipo — variação YTD Hyperion"
    >
      <div className="compass-matrix-dt__corner" />
      {tipos.map((tipo) => (
        <div key={`col-${tipo}`} className="compass-matrix-dt__col-header">
          {tipo}
        </div>
      ))}

      {directorias.map((dir) => (
        <Fragment key={dir}>
          <div className="compass-matrix-dt__row-header">{dir}</div>
          {tipos.map((tipo) => {
            const cell = cellFor(dir, tipo);
            if (!cell) {
              return (
                <div key={`${dir}-${tipo}`} className="compass-matrix-dt__cell compass-matrix-dt__cell--neutral">
                  —
                </div>
              );
            }
            return (
              <div
                key={`${dir}-${tipo}`}
                className={`compass-matrix-dt__cell compass-matrix-dt__cell--${cellClass(cell.variacaoPct)}`}
                title={`${dir} × ${tipo}`}
              >
                <span className="compass-matrix-dt__cell-pct">{formatCompassPercent(cell.variacaoPct)}</span>
                <span className="compass-matrix-dt__cell-val">{formatCompassCurrency(cell.variacao)}</span>
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
