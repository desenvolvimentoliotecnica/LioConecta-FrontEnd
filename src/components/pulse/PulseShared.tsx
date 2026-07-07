import { Link } from "react-router-dom";
import { PULSE_SPRINT_PHASES, PULSE_SEVERITY_COLORS } from "../../config/pulse/constants";
import type { PulseAlert, PulseSeverity } from "../../config/pulse/types";
import type { EnrichedDailyEntry } from "../../config/pulse/types";

const ALERT_ICONS: Record<string, string> = {
  impedimentos_criticos: "fa-triangle-exclamation",
  impedimentos_abertos: "fa-road-barrier",
  dailys_pendentes: "fa-comments",
};

export function PulseAlertsPanel({ alerts }: { alerts: PulseAlert[] }) {
  if (alerts.length === 0) {
    return (
      <article className="pulse-panel">
        <h2 className="pulse-panel__title">Alertas</h2>
        <p className="pulse-panel__empty">Nenhum alerta no período selecionado.</p>
      </article>
    );
  }

  return (
    <article className="pulse-panel">
      <h2 className="pulse-panel__title">Alertas do sprint</h2>
      <ul className="pulse-alerts">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link to={alert.link} className={`pulse-alert pulse-alert--${alert.severity}`}>
              <div className="pulse-alert__accent" aria-hidden="true">
                <i className={`fa-solid ${ALERT_ICONS[alert.type] ?? "fa-bell"}`} />
              </div>
              <div className="pulse-alert__qty">{alert.quantity}</div>
              <div className="pulse-alert__content">
                <div className="pulse-alert__title">{alert.title}</div>
                <div className="pulse-alert__desc">{alert.description}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function PulseRitualDiagram() {
  return (
    <div className="pulse-ritual" aria-label="Ciclo ágil Scrum">
      {PULSE_SPRINT_PHASES.filter((p) => p.id !== "closed").map((phase, idx, arr) => (
        <div key={phase.id} className="pulse-ritual__item">
          <div className="pulse-ritual__node">
            <i className={`fa-solid ${phase.icon}`} aria-hidden="true" />
            <span>{phase.label}</span>
          </div>
          {idx < arr.length - 1 ? (
            <i className="fa-solid fa-arrow-right pulse-ritual__arrow" aria-hidden="true" />
          ) : (
            <i className="fa-solid fa-rotate pulse-ritual__return" aria-hidden="true" title="Inicia novo sprint" />
          )}
        </div>
      ))}
    </div>
  );
}

export function PulseSeverityBadge({ severity }: { severity: PulseSeverity }) {
  const color = PULSE_SEVERITY_COLORS[severity] ?? "#64748b";
  return (
    <span className="workers-status workers-status--warning" style={{ borderColor: color, color }}>
      {severity}
    </span>
  );
}

export function PulseStatusBadge({ status }: { status: string }) {
  const mod = status === "done" || status === "concluida" || status === "resolvido"
    ? "success"
    : status === "in_progress" || status === "em_andamento"
      ? "info"
      : "neutral";
  return (
    <span className={`workers-status workers-status--${mod}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PulseStandupCard({ entry }: { entry: EnrichedDailyEntry }) {
  return (
    <article className="pulse-standup-card">
      <header className="pulse-standup-card__head">
        <strong>{entry.memberName}</strong>
        <span className="pulse-standup-card__mood" title={entry.moodLabel}>
          {entry.moodLabel}
        </span>
      </header>
      <dl className="pulse-standup-card__body">
        <div>
          <dt>Ontem</dt>
          <dd>{entry.yesterday}</dd>
        </div>
        <div>
          <dt>Hoje</dt>
          <dd>{entry.today}</dd>
        </div>
        {entry.blockers ? (
          <div className="pulse-standup-card__blocker">
            <dt>Impedimentos</dt>
            <dd>{entry.blockers}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export function PulseProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="pulse-progress" title={label ?? `${value}%`}>
      <div className="pulse-progress__track">
        <div className="pulse-progress__fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="pulse-progress__value">{value}%</span>
    </div>
  );
}
