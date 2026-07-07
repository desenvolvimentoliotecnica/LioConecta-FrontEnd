import { useMemo } from "react";
import { buildLoopRisksView, formatLoopDate } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import { LoopRiskDonutChart } from "../LoopCharts";
import "../../../styles/audit-trail-page.css";
import "../../../styles/loop-dashboard.css";

export function LoopRisksPage() {
  const { filters } = useLoopFilters();
  const risks = useMemo(() => buildLoopRisksView(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Riscos</h1>
        <p className="loop-page__desc">Gestão e visualização de riscos por severidade e projeto.</p>
      </div>

      <div className="loop-dashboard__grid">
        <article className="loop-panel">
          <LoopRiskDonutChart data={risks.bySeverity} total={risks.total} />
        </article>
        <article className="loop-panel">
          <h2 className="loop-panel__title">Matriz de risco</h2>
          <div className="loop-risk-matrix" aria-label="Matriz probabilidade x impacto">
            {[5, 4, 3, 2, 1].map((prob) => (
              <div key={prob} className="loop-risk-matrix__row">
                <span className="loop-risk-matrix__axis">{prob}</span>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const count = risks.items.filter((r) => r.probability === prob && r.impact === impact).length;
                  const score = prob * impact;
                  const level = score >= 20 ? "critical" : score >= 12 ? "high" : score >= 6 ? "medium" : "low";
                  return (
                    <div key={impact} className={`loop-risk-matrix__cell loop-risk-matrix__cell--${level}`}>
                      {count > 0 ? count : ""}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="loop-risk-matrix__footer">
              <span />
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>
        </article>
      </div>

      <div className="loop-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Risco</th>
              <th>Projeto</th>
              <th>Severidade</th>
              <th>Responsável</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {risks.items.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.title}</strong>
                  <div className="loop-table__sub">{r.category}</div>
                </td>
                <td>{r.projectName}</td>
                <td>
                  <span className={`loop-severity loop-severity--${r.severity}`}>{r.severity}</span>
                </td>
                <td>{r.ownerName}</td>
                <td>{formatLoopDate(r.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
