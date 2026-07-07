import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildReviewView, formatPulseDateTime, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseAgendaBuilder } from "../PulseAgendaBuilder";
import { PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulseReviewPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const view = useMemo(() => buildReviewView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Review</h1>
        <p className="pulse-page__desc">Demonstração de entregas e validação com stakeholders.</p>
      </div>

      <article className="pulse-panel">
        <h2 className="pulse-panel__title">Histórias entregues</h2>
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>História</th>
              <th>Squad</th>
              <th>Responsável</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {view.doneStories.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.teamName}</td>
                <td>{s.assigneeName}</td>
                <td>{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {view.doneStories.length === 0 ? (
          <p className="pulse-panel__empty">Nenhuma história concluída no período.</p>
        ) : null}
      </article>

      <h2 className="pulse-page__subtitle">Sprints em review</h2>
      <ul className="pulse-sprint-list">
        {view.sprints.map((s) => (
          <li key={s.id} className="pulse-sprint-list__item">
            <strong>{s.name}</strong>
            <p>{s.goal}</p>
            <PulseStatusBadge status={s.phase} />
          </li>
        ))}
      </ul>

      <h2 className="pulse-page__subtitle">Reuniões de review</h2>
      {view.meetings.map((m) => (
        <div key={m.id}>
          <p>{formatPulseDateTime(m.scheduledAt)}</p>
          <PulseAgendaBuilder meeting={m} />
        </div>
      ))}

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
