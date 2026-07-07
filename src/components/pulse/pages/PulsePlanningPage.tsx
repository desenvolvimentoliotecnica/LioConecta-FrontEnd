import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildPlanningView, formatPulseDateTime, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseAgendaBuilder } from "../PulseAgendaBuilder";
import { PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulsePlanningPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const view = useMemo(() => buildPlanningView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Planning</h1>
        <p className="pulse-page__desc">Planejamento de sprint, refinamento e priorização do backlog.</p>
      </div>

      <div className="pulse-dashboard__grid pulse-dashboard__grid--2">
        <article className="pulse-panel">
          <h2 className="pulse-panel__title">Backlog para planejamento</h2>
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>História</th>
                <th>Squad</th>
                <th>Pontos</th>
                <th>Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {view.backlog.map((s) => (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td>{s.teamName}</td>
                  <td>{s.points}</td>
                  <td>
                    <PulseStatusBadge status={s.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="pulse-panel">
          <h2 className="pulse-panel__title">Sprints em planejamento</h2>
          <ul className="pulse-sprint-list">
            {view.planningSprints.map((s) => (
              <li key={s.id} className="pulse-sprint-list__item">
                <strong>{s.name}</strong>
                <p>{s.goal}</p>
                <span className="pulse-sprint-list__meta">Fase: {s.phase}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <h2 className="pulse-page__subtitle">Reuniões de planning e refinamento</h2>
      {view.meetings.map((m) => (
        <div key={m.id} className="pulse-planning-meeting">
          <p className="pulse-planning-meeting__when">{formatPulseDateTime(m.scheduledAt)}</p>
          <PulseAgendaBuilder meeting={m} />
        </div>
      ))}

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
