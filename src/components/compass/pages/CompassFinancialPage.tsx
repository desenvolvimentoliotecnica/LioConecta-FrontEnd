import { useCompassAggregates } from "../../../api/hooks/useCompassAggregates";
import { useCompassDashboard } from "../../../api/hooks/useCompassDashboard";
import {
  formatCompassCurrency,
  formatCompassPercent,
} from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassVarianceChart } from "../CompassCharts";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassFinancialPage() {
  const { filters } = useCompassFilters();
  const { data: aggregates, isLoading: aggLoading, isFallback: aggFallback } = useCompassAggregates(filters, "tipo");
  const { data: dashboard, isLoading: dashLoading, isFallback: dashFallback } = useCompassDashboard(filters);

  const isLoading = aggLoading || dashLoading;
  const isFallback = aggFallback || dashFallback;

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando financeiro…</p></main>;
  }

  const revenueRow = aggregates.rows.find((r) => r.groupLabel === "Receita");
  const marginPct =
    revenueRow && revenueRow.ibpAtual > 0
      ? Math.round(((revenueRow.ibpAtual - (aggregates.rows.find((r) => r.groupLabel === "COGS")?.ibpAtual ?? 0)) / revenueRow.ibpAtual) * 100)
      : 0;

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Financeiro</h1>
        <p className="compass-page__desc">
          P&L cascade Hyperion YTD — receita {formatCompassCurrency(aggregates.totals.ibpAtual)}, variação{" "}
          {formatCompassPercent(aggregates.totals.variacaoPct)}, margem estimada {marginPct}%.
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />

      <CompassPanel title="Bridge de variância — receita" infoId="financeiro-bridge" desc="IBP Anterior → IBP Atual.">
        <CompassVarianceChart
          data={dashboard.varianceBridge.map((d) => ({
            label: d.label,
            value: d.value ?? 0,
            color: d.color ?? "#2563eb",
          }))}
        />
      </CompassPanel>

      <CompassPanel title="Cascade P&L por tipo" infoId="financeiro-pl" desc="Agregação groupBy=tipo · EPBCS.">
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>IBP Atual</th>
                <th>IBP Anterior</th>
                <th>Variação</th>
                <th>Var. %</th>
              </tr>
            </thead>
            <tbody>
              {aggregates.rows.map((row) => (
                <tr key={row.groupKey}>
                  <td>{row.groupLabel}</td>
                  <td>{formatCompassCurrency(row.ibpAtual, row.groupLabel === "Volume" ? "UN" : "BRL")}</td>
                  <td>{formatCompassCurrency(row.ibpAnterior, row.groupLabel === "Volume" ? "UN" : "BRL")}</td>
                  <td className={row.variacao < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassCurrency(row.variacao, row.groupLabel === "Volume" ? "UN" : "BRL")}
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

      <footer className="compass-page__footer">Oracle Hyperion EPBCS — P&L YTD</footer>
    </main>
  );
}
