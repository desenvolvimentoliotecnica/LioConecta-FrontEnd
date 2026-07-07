import { useMemo } from "react";
import { buildLoopActivitiesView, formatLoopDate } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import "../../../styles/audit-trail-page.css";
import "../../../styles/loop-dashboard.css";

export function LoopActivitiesPage() {
  const { filters, setStatus } = useLoopFilters();
  const activities = useMemo(() => buildLoopActivitiesView(filters), [filters]);

  const statuses = ["planejada", "pendente", "em_andamento", "bloqueada", "em_revisao", "concluida"];

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Atividades</h1>
        <p className="loop-page__desc">Acompanhamento operacional de tarefas e próximos passos.</p>
      </div>

      <div className="audit-trail-page__controls loop-activities-controls">
        <div className="audit-trail-page__filters loop-activities-filters" role="group" aria-label="Status">
          <button
            type="button"
            className={`filter-chip${!filters.status ? " is-active" : ""}`}
            onClick={() => setStatus(undefined)}
          >
            Todos
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip${filters.status === s ? " is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="loop-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Atividade</th>
              <th>Projeto</th>
              <th>Responsável</th>
              <th>Prazo</th>
              <th>Progresso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className={a.isOverdue ? "loop-row--overdue" : undefined}>
                <td>
                  {a.title}
                  {a.blocker ? <div className="loop-table__sub">Bloqueio: {a.blocker}</div> : null}
                </td>
                <td>{a.projectName}</td>
                <td>{a.assigneeName}</td>
                <td>{formatLoopDate(a.dueDate)}</td>
                <td>{a.progress}%</td>
                <td>
                  <span className={`workers-status workers-status--${a.isOverdue ? "warning" : a.status === "bloqueada" ? "danger" : "neutral"}`}>
                    {a.status.replace(/_/g, " ")}
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
