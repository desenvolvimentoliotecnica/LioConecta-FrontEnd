import { useMemo } from "react";
import { buildLoopApprovalsView, formatLoopDate } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import "../../../styles/audit-trail-page.css";
import "../../../styles/loop-dashboard.css";

export function LoopApprovalsPage() {
  const { filters } = useLoopFilters();
  const approvals = useMemo(() => buildLoopApprovalsView(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Aprovações</h1>
        <p className="loop-page__desc">Pendências e histórico de decisões aguardando gestores e diretoria.</p>
      </div>

      <div className="loop-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Título</th>
              <th>Projeto</th>
              <th>Solicitante</th>
              <th>Aprovador</th>
              <th>Prazo</th>
              <th>Prioridade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a) => (
              <tr key={a.id} className={a.isOverdue ? "loop-row--overdue" : undefined}>
                <td>{a.type}</td>
                <td>{a.title}</td>
                <td>{a.projectName}</td>
                <td>{a.requesterName}</td>
                <td>{a.approverName}</td>
                <td>{formatLoopDate(a.dueDate)}</td>
                <td>
                  <span className={`loop-priority loop-priority--${a.priority}`}>{a.priority}</span>
                </td>
                <td>
                  <span className={`workers-status workers-status--${a.status === "pendente" ? "warning" : a.status === "aprovado" ? "success" : "neutral"}`}>
                    {a.status}
                  </span>
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
