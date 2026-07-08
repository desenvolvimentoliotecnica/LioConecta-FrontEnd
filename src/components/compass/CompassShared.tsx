import { Link } from "react-router-dom";
import { COMPASS_IBP_PHASES } from "../../config/compass/constants";
import { SEVERITY_LABELS } from "../../config/compass/constants";
import type { CompassAlertDto } from "../../api/types";

const ALERT_ICONS: Record<string, string> = {
  gaps_criticos: "fa-triangle-exclamation",
  gaps_abertos: "fa-scale-unbalanced",
  decisoes_pendentes: "fa-gavel",
  reunioes_proximas: "fa-calendar-check",
};

export function CompassAlertsPanel({ alerts }: { alerts: CompassAlertDto[] }) {
  if (alerts.length === 0) {
    return (
      <article className="compass-panel">
        <h2 className="compass-panel__title">Alertas</h2>
        <p className="compass-panel__empty">Nenhum alerta no período selecionado.</p>
      </article>
    );
  }

  return (
    <article className="compass-panel">
      <h2 className="compass-panel__title">Alertas executivos</h2>
      <ul className="compass-alerts">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link to={alert.link} className={`compass-alert compass-alert--${alert.severity}`}>
              <div className="compass-alert__accent" aria-hidden="true">
                <i className={`fa-solid ${ALERT_ICONS[alert.type ?? ""] ?? "fa-bell"}`} />
              </div>
              <div className="compass-alert__qty">{alert.quantity}</div>
              <div className="compass-alert__content">
                <div className="compass-alert__title">{alert.title}</div>
                <div className="compass-alert__desc">{alert.description}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

type CompassCycleDiagramProps = {
  currentPhaseId?: string;
};

export function CompassCycleDiagram({ currentPhaseId }: CompassCycleDiagramProps) {
  return (
    <div className="compass-cycle" aria-label="Ciclo IBP — 6 fases">
      {COMPASS_IBP_PHASES.map((phase, idx) => {
        const isActive = currentPhaseId === phase.id;
        return (
          <div key={phase.id} className="compass-cycle__item">
            <div className={`compass-cycle__node${isActive ? " is-active" : ""}`}>
              <i className={`fa-solid ${phase.icon}`} aria-hidden="true" />
              <span>{phase.label}</span>
            </div>
            {idx < COMPASS_IBP_PHASES.length - 1 ? (
              <i className="fa-solid fa-arrow-right compass-cycle__arrow" aria-hidden="true" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function CompassGapBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="compass-gap-badge">{count}</span>;
}

import type { GapSeverity } from "../../config/compass/types";

export function CompassSeverityBadge({ severity }: { severity: GapSeverity }) {
  return (
    <span className={`compass-severity compass-severity--${severity}`}>{SEVERITY_LABELS[severity]}</span>
  );
}

export function CompassProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="compass-progress" title={label ?? `${value}%`}>
      <div className="compass-progress__track">
        <div className="compass-progress__fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="compass-progress__value">{value}%</span>
    </div>
  );
}