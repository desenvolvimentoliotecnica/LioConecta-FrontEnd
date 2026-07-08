import { useMemo } from "react";
import { buildGovernanceMeetingsView } from "../../../config/compass/governanceMock";
import { formatCompassDate } from "../../../utils/compassView";
import { CompassInfoButton } from "../help/CompassInfoButton";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassMeetingsPage() {
  const view = useMemo(() => buildGovernanceMeetingsView(), []);

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Reuniões
          <CompassInfoButton infoId="nav-reunioes" />
        </h1>
        <p className="compass-page__desc">
          {view.upcoming.length} reunião(ões) agendada(s) — pautas referenciam IBP Atual vs Anterior do Hyperion EPBCS.
        </p>
      </div>

      <h2 className="compass-section-title">Próximas</h2>
      <div className="compass-meetings-grid">
        {view.upcoming.map((m) => (
          <article key={m.id} className={`compass-meeting-card compass-meeting-card--${m.status}`}>
            <header className="compass-meeting-card__head">
              <span className="compass-meeting-card__phase">{m.phaseLabel}</span>
              <span
                className={`workers-status workers-status--${m.status === "agendada" ? "warning" : m.status === "concluida" ? "success" : "neutral"}`}
              >
                {m.status}
              </span>
            </header>
            <h2>{m.title}</h2>
            <p className="compass-meeting-card__datetime">
              <i className="fa-solid fa-calendar" aria-hidden="true" /> {formatCompassDate(m.date)} · {m.time}
            </p>
            <p className="compass-meeting-card__agenda">{m.agendaSummary}</p>
            <footer>
              <i className="fa-solid fa-users" aria-hidden="true" /> {m.attendeeIds.length} participantes ·{" "}
              {m.facilitatorName}
            </footer>
          </article>
        ))}
      </div>

      {view.past.length > 0 ? (
        <>
          <h2 className="compass-section-title">Histórico</h2>
          <div className="compass-meetings-grid">
            {view.past.slice(0, 6).map((m) => (
              <article key={m.id} className="compass-meeting-card compass-meeting-card--concluida">
                <header className="compass-meeting-card__head">
                  <span className="compass-meeting-card__phase">{m.typeLabel}</span>
                  <span className="workers-status workers-status--success">{m.status}</span>
                </header>
                <h2>{m.title}</h2>
                <p className="compass-meeting-card__datetime">
                  {formatCompassDate(m.date)} · {m.time}
                </p>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <footer className="compass-page__footer">Rituais IBP · Oracle Hyperion EPBCS</footer>
    </main>
  );
}
