import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { PULSE_SPRINT_PHASES } from "../../../config/pulse/constants";
import { buildSprintViewList, formatPulseDate, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseBurndownChart } from "../PulseCharts";
import { PulseProgressBar, PulseStatusBadge } from "../PulseShared";
import "../../../styles/pulse-dashboard.css";

export function PulseSprintPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const sprints = useMemo(() => buildSprintViewList(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Sprint</h1>
        <p className="pulse-page__desc">Acompanhamento de sprints, metas e burndown por squad.</p>
      </div>

      {sprints.map((sprint) => {
        const phase = PULSE_SPRINT_PHASES.find((p) => p.id === sprint.phase);
        return (
          <article key={sprint.id} className="pulse-panel pulse-sprint-detail">
            <header className="pulse-sprint-detail__head">
              <div>
                <h2>{sprint.name}</h2>
                <p>{sprint.goal}</p>
              </div>
              <div className="pulse-sprint-detail__meta">
                <span className="pulse-sprint-detail__team">{sprint.teamName}</span>
                {phase ? (
                  <span className="pulse-sprint-detail__phase">
                    <i className={`fa-solid ${phase.icon}`} aria-hidden="true" /> {phase.label}
                  </span>
                ) : null}
              </div>
            </header>

            <div className="pulse-sprint-detail__stats">
              <div>
                <span className="pulse-sprint-detail__stat-label">Período</span>
                <span>{formatPulseDate(sprint.startDate)} — {formatPulseDate(sprint.endDate)}</span>
              </div>
              <div>
                <span className="pulse-sprint-detail__stat-label">Pontos</span>
                <span>{sprint.completedPoints}/{sprint.committedPoints}</span>
              </div>
              <div>
                <span className="pulse-sprint-detail__stat-label">Velocidade</span>
                <span>{sprint.velocity} pts</span>
              </div>
            </div>

            <PulseProgressBar value={sprint.completionPercent} label="Progresso do sprint" />
            <PulseBurndownChart data={sprint.burndown} sprintName={sprint.name} />

            <h3 className="pulse-sprint-detail__stories-title">Histórias do sprint</h3>
            <table className="audit-trail-page__table">
              <thead>
                <tr>
                  <th>História</th>
                  <th>Responsável</th>
                  <th>Pontos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sprint.stories.map((st) => (
                  <tr key={st.id}>
                    <td>{st.title}</td>
                    <td>{st.assigneeName}</td>
                    <td>{st.points}</td>
                    <td>
                      <PulseStatusBadge status={st.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        );
      })}

      {sprints.length === 0 ? <p className="pulse-panel__empty">Nenhum sprint encontrado.</p> : null}

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
