import { useMemo } from "react";
import { buildGovernanceCycleView } from "../../../config/compass/governanceMock";
import { formatCompassDate } from "../../../utils/compassView";
import { CompassCycleDiagram, CompassProgressBar } from "../CompassShared";
import { CompassInfoButton } from "../help/CompassInfoButton";
import { CompassPanel } from "../help/CompassPanel";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassCyclePage() {
  const view = useMemo(() => buildGovernanceCycleView(), []);

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Ciclo IBP
          <CompassInfoButton infoId="nav-ciclo" />
        </h1>
        <p className="compass-page__desc">
          Timeline e checklist das 6 fases — {view.cycleName}. Dados Hyperion EPBCS alimentam a fase Coleta. Patrocinador:{" "}
          {view.sponsorName}.
        </p>
      </div>

      <CompassPanel title="Progresso geral" infoId="ciclo-progresso" className="compass-cycle-summary">
        <div className="compass-cycle-summary__head">
          <span className="compass-cycle-summary__pct">{view.overallProgress}%</span>
        </div>
        <CompassProgressBar value={view.overallProgress} label="Progresso do ciclo IBP" />
        <div className="compass-cycle-summary__stats">
          <span>{view.openGaps} gaps abertos</span>
          <span>{view.pendingDecisions} decisões pendentes</span>
          <span>{view.upcomingMeetings} reuniões agendadas</span>
        </div>
      </CompassPanel>

      <CompassCycleDiagram currentPhaseId={view.currentPhase} />

      <div className="compass-phase-timeline">
        {view.phases.map((phase) => (
          <article key={phase.id} className={`compass-phase-card compass-phase-card--${phase.status}`}>
            <header className="compass-phase-card__head">
              <div className="compass-phase-card__icon">
                <i className={`fa-solid ${phase.icon}`} aria-hidden="true" />
              </div>
              <div>
                <h2>
                  {phase.label}
                  <CompassInfoButton infoId="ciclo-fases" />
                </h2>
                <p>
                  {formatCompassDate(phase.startDate)} — {formatCompassDate(phase.endDate)}
                </p>
              </div>
              <span className={`compass-phase-card__status compass-phase-card__status--${phase.status}`}>
                {phase.status.replace(/_/g, " ")}
              </span>
            </header>
            <CompassProgressBar value={phase.progress} />
            <ul className="compass-checklist">
              {phase.checklist.map((item) => (
                <li key={item.id} className={item.done ? "is-done" : undefined}>
                  <i className={`fa-solid ${item.done ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <footer className="compass-page__footer">Governança IBP · snapshot Hyperion na fase Coleta</footer>
    </main>
  );
}
