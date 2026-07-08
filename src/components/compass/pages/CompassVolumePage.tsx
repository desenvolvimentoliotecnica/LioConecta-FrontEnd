import { useCompassAggregates } from "../../../api/hooks/useCompassAggregates";
import {
  formatCompassPercent,
} from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassVolumePage() {
  const { filters } = useCompassFilters();
  const volumeFilters = filters.tipo ? filters : { ...filters, tipo: "Volume" };
  const { data, isLoading, isFallback } = useCompassAggregates(volumeFilters, "familia");

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando volume…</p></main>;
  }

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Volume</h1>
        <p className="compass-page__desc">
          Volume YTD por família — IBP Atual {data.totals.ibpAtual.toLocaleString("pt-BR")} un vs Anterior{" "}
          {data.totals.ibpAnterior.toLocaleString("pt-BR")} un ({formatCompassPercent(data.totals.variacaoPct)}).
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />

      <CompassPanel title="Volume por família" infoId="volume-table" desc="Tipo Volume · Oracle Hyperion EPBCS.">
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Família</th>
                <th>IBP Atual (un)</th>
                <th>IBP Anterior (un)</th>
                <th>Variação</th>
                <th>Var. %</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.groupKey}>
                  <td>{row.groupLabel}</td>
                  <td>{row.ibpAtual.toLocaleString("pt-BR")}</td>
                  <td>{row.ibpAnterior.toLocaleString("pt-BR")}</td>
                  <td className={row.variacao < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {row.variacao > 0 ? "+" : ""}
                    {row.variacao.toLocaleString("pt-BR")}
                  </td>
                  <td className={row.variacaoPct < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassPercent(row.variacaoPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CompassPanel>

      <footer className="compass-page__footer">Oracle Hyperion EPBCS — tipo Volume YTD</footer>
    </main>
  );
}
