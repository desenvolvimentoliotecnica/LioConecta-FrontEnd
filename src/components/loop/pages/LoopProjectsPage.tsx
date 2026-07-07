import { useMemo } from "react";
import { buildLoopProjectsView } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import { LoopHealthBadge, LoopProgressBar } from "../LoopShared";
import "../../../styles/audit-trail-page.css";
import "../../../styles/loop-dashboard.css";

export function LoopProjectsPage() {
  const { filters } = useLoopFilters();
  const projects = useMemo(() => buildLoopProjectsView(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Projetos</h1>
        <p className="loop-page__desc">Portfólio de projetos com saúde, progresso e responsáveis.</p>
      </div>

      <div className="loop-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Squad</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Saúde</th>
              <th>Progresso</th>
              <th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <div className="loop-table__sub">{p.code}</div>
                </td>
                <td>{p.teamName}</td>
                <td>{p.ownerName}</td>
                <td>{p.status.replace(/_/g, " ")}</td>
                <td>
                  <LoopHealthBadge health={p.computedHealth} />
                </td>
                <td>
                  <LoopProgressBar value={p.computedProgress} />
                </td>
                <td>
                  <span className={`loop-priority loop-priority--${p.priority}`}>{p.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
