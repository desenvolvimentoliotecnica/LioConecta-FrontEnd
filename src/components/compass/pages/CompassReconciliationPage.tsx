import { useCompassDashboard } from "../../../api/hooks/useCompassDashboard";
import { formatCompassPercent } from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassDiretoriaTipoMatrix } from "../CompassDiretoriaTipoMatrix";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassSeverityBadge } from "../CompassShared";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassReconciliationPage() {
  const { filters } = useCompassFilters();
  const { data, isLoading, isFallback } = useCompassDashboard(filters);

  const criticalCount = data.topGaps.filter((g) => g.severity === "critico").length;

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando reconciliação…</p></main>;
  }

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Reconciliação</h1>
        <p className="compass-page__desc">
          Matriz Diretoria × Tipo — {data.topGaps.length} desvio(s) destacado(s) ({criticalCount} crítico(s)). Variação =
          IBP Atual − IBP Anterior.
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />

      <CompassPanel
        title="Matriz Diretoria × Tipo"
        infoId="reconciliacao-matrix"
        desc="Heatmap de variação YTD Oracle Hyperion EPBCS."
      >
        <CompassDiretoriaTipoMatrix cells={data.reconciliationMatrix} />
      </CompassPanel>

      <CompassPanel title="Lista de desvios" infoId="reconciliacao-gaps-list">
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Desvio</th>
                <th>Diretoria</th>
                <th>Tipo</th>
                <th>Variação</th>
                <th>Var. %</th>
                <th>Severidade</th>
              </tr>
            </thead>
            <tbody>
              {data.topGaps.map((gap) => (
                <tr key={gap.id}>
                  <td>{gap.title}</td>
                  <td>{gap.diretoria}</td>
                  <td>{gap.tipo}</td>
                  <td>{gap.value}</td>
                  <td className={gap.variacaoPct < 0 ? "compass-cell--negative" : "compass-cell--positive"}>
                    {formatCompassPercent(gap.variacaoPct)}
                  </td>
                  <td>
                    <CompassSeverityBadge severity={gap.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CompassPanel>

      <footer className="compass-page__footer">Oracle Hyperion EPBCS — reconciliação YTD</footer>
    </main>
  );
}
