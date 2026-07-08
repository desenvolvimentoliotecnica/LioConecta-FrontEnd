import { useCompassAggregates } from "../../../api/hooks/useCompassAggregates";
import {
  formatCompassCurrency,
  formatCompassPercent,
} from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassCanaisPage() {
  const { filters } = useCompassFilters();
  const { data, isLoading, isFallback } = useCompassAggregates(filters, "unidade");

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando canais…</p></main>;
  }

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Canais</h1>
        <p className="compass-page__desc">
          IBP YTD por unidade/canal — {data.rows.length} unidade(s) com movimento Hyperion.
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />

      <CompassPanel title="IBP por unidade" infoId="canais-table" desc="Agregação groupBy=unidade · EPBCS.">
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Unidade / Canal</th>
                <th>IBP Atual</th>
                <th>IBP Anterior</th>
                <th>Variação</th>
                <th>Var. %</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.groupKey}>
                  <td>{row.groupLabel}</td>
                  <td>{formatCompassCurrency(row.ibpAtual)}</td>
                  <td>{formatCompassCurrency(row.ibpAnterior)}</td>
                  <td className={row.variacao < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassCurrency(row.variacao)}
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

      <footer className="compass-page__footer">Oracle Hyperion EPBCS — canais YTD</footer>
    </main>
  );
}
