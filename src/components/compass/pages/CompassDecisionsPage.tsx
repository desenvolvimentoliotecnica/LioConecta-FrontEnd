import { useMemo } from "react";
import { buildGovernanceDecisionsView } from "../../../config/compass/governanceMock";
import { formatCompassDate } from "../../../utils/compassView";
import { CompassInfoButton } from "../help/CompassInfoButton";
import "../../../styles/audit-trail-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassDecisionsPage() {
  const view = useMemo(() => buildGovernanceDecisionsView(), []);

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Decisões
          <CompassInfoButton infoId="nav-decisoes" />
        </h1>
        <p className="compass-page__desc">
          {view.pending.length} pendente(s), {view.approved.length} aprovada(s) — impactos refletem próxima versão IBP no
          Hyperion.
        </p>
      </div>

      <div className="compass-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Decisão</th>
              <th>Reunião</th>
              <th>Responsável</th>
              <th>Prazo</th>
              <th>Impacto</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {view.all.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.meetingTitle}</td>
                <td>{d.ownerName}</td>
                <td>{formatCompassDate(d.dueDate)}</td>
                <td>{d.impact}</td>
                <td>
                  <span
                    className={`workers-status workers-status--${d.status === "pendente" ? "warning" : d.status === "aprovada" ? "success" : "neutral"}`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="compass-page__footer">Governança IBP · Oracle Hyperion EPBCS</footer>
    </main>
  );
}
