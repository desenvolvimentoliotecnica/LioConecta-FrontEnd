import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildPulseDashboardView, formatPulseDate, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseBurndownChart } from "../PulseCharts";
import { PulseKpiGrid } from "../PulseKpiGrid";
import { PulseAlertsPanel, PulseProgressBar, PulseRitualDiagram, PulseStatusBadge } from "../PulseShared";
import "../../../styles/analytics-page.css";
import "../../../styles/pulse-dashboard.css";

export function PulseDashboardPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const view = useMemo(() => buildPulseDashboardView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Visão Geral</h1>
        <p className="pulse-page__desc">
          Painel ágil com sprints ativos, dailys, impedimentos e rituais Scrum.
        </p>
      </div>

      <PulseRitualDiagram />
      <PulseKpiGrid kpis={view.kpis} />

      <div className="pulse-dashboard__grid">
        <PulseAlertsPanel alerts={view.alerts} />
        <article className="pulse-panel">
          <h2 className="pulse-panel__title">Burndown — sprint principal</h2>
          {view.activeSprints[0] ? (
            <>
              <p className="pulse-panel__desc">
                {view.activeSprints[0].name} · {view.activeSprints[0].completionPercent}% concluído
              </p>
              <PulseBurndownChart data={view.activeSprints[0].burndown} />
            </>
          ) : (
            <p className="pulse-panel__empty">Nenhum sprint ativo.</p>
          )}
        </article>
      </div>

      <div className="pulse-dashboard__grid pulse-dashboard__grid--2">
        <article className="pulse-panel">
          <h2 className="pulse-panel__title">Sprints ativos</h2>
          <ul className="pulse-sprint-list">
            {view.activeSprints.map((s) => (
              <li key={s.id} className="pulse-sprint-list__item">
                <div className="pulse-sprint-list__head">
                  <strong>{s.name}</strong>
                  <span>{s.teamName}</span>
                </div>
                <p>{s.goal}</p>
                <PulseProgressBar value={s.completionPercent} />
                <span className="pulse-sprint-list__meta">
                  {s.completedPoints}/{s.committedPoints} pts · até {formatPulseDate(s.endDate)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="pulse-panel">
          <h2 className="pulse-panel__title">Impedimentos abertos</h2>
          <div className="pulse-table-wrap">
            <table className="audit-trail-page__table">
              <thead>
                <tr>
                  <th>Impedimento</th>
                  <th>Squad</th>
                  <th>Severidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {view.openImpediments.map((i) => (
                  <tr key={i.id}>
                    <td>{i.title}</td>
                    <td>{i.teamName}</td>
                    <td>{i.severity}</td>
                    <td>
                      <PulseStatusBadge status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
