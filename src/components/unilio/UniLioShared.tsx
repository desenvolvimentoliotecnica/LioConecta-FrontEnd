import { Link } from "react-router-dom";
import { CONTENT_TYPE_LABELS, ENROLLMENT_STATUS_LABELS } from "../../config/unilio/constants";
import type { UniLioAlert, UniLioContentType } from "../../config/unilio/types";

const ALERT_ICONS: Record<string, string> = {
  warning: "fa-triangle-exclamation",
  info: "fa-circle-info",
  critical: "fa-circle-exclamation",
};

export function UniLioAlertsPanel({ alerts }: { alerts: UniLioAlert[] }) {
  if (alerts.length === 0) {
    return (
      <article className="unilio-panel">
        <h2 className="unilio-panel__title">Alertas</h2>
        <p className="unilio-panel__empty">Nenhum alerta no momento.</p>
      </article>
    );
  }

  return (
    <article className="unilio-panel">
      <h2 className="unilio-panel__title">Alertas de aprendizagem</h2>
      <ul className="unilio-alerts">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link to={alert.link} className={`unilio-alert unilio-alert--${alert.severity}`}>
              <div className="unilio-alert__accent" aria-hidden="true">
                <i className={`fa-solid ${ALERT_ICONS[alert.severity] ?? "fa-bell"}`} />
              </div>
              <div className="unilio-alert__content">
                <div className="unilio-alert__title">{alert.title}</div>
                <div className="unilio-alert__desc">{alert.description}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function UniLioProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="unilio-progress" title={label ?? `${value}%`}>
      <div className="unilio-progress__track">
        <div className="unilio-progress__fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="unilio-progress__value">{value}%</span>
    </div>
  );
}

export function UniLioContentTypeBadge({ type }: { type: string }) {
  const label = CONTENT_TYPE_LABELS[type as UniLioContentType] ?? type;
  return <span className="unilio-type-badge">{label}</span>;
}

export function UniLioDepartmentBadge({ department }: { department?: string | null }) {
  const label = department?.trim();
  if (!label) return null;
  return <span className="unilio-department-badge">{label}</span>;
}

export function UniLioStatusBadge({ status }: { status: string }) {
  const label = ENROLLMENT_STATUS_LABELS[status] ?? status;
  return <span className={`unilio-status unilio-status--${status.replaceAll("_", "-")}`}>{label}</span>;
}

export function UniLioMandatoryBadge() {
  return (
    <span className="unilio-mandatory-badge">
      <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Obrigatório
    </span>
  );
}

export function UniLioParticipantsBadge({ count }: { count: number }) {
  const label = count === 1 ? "1 fez" : `${count} fizeram`;
  return (
    <span className="unilio-participants-badge" title={`${count} colaborador(es) iniciaram este curso`}>
      <i className="fa-solid fa-users" aria-hidden="true" /> {label}
    </span>
  );
}

export function UniLioPanel({
  title,
  desc,
  children,
  link,
  linkLabel,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <article className="unilio-panel">
      <h2 className="unilio-panel__title">{title}</h2>
      {desc ? <p className="unilio-panel__desc">{desc}</p> : null}
      {children}
      {link ? (
        <Link to={link} className="unilio-panel__link">
          {linkLabel ?? "Ver mais"}
        </Link>
      ) : null}
    </article>
  );
}
