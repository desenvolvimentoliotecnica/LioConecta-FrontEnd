import { Link } from "react-router-dom";
import { HEALTH_LABELS } from "../../config/loop/constants";
import type { LoopAlert } from "../../config/loop/types";

export function LoopAlertsPanel({ alerts }: { alerts: LoopAlert[] }) {
  if (alerts.length === 0) {
    return (
      <article className="loop-panel">
        <h2 className="loop-panel__title">Alertas</h2>
        <p className="loop-panel__empty">Nenhum alerta no período selecionado.</p>
      </article>
    );
  }

  return (
    <article className="loop-panel">
      <h2 className="loop-panel__title">Alertas executivos</h2>
      <ul className="loop-alerts">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link to={alert.link} className={`loop-alert loop-alert--${alert.severity}`}>
              <div className="loop-alert__qty">{alert.quantity}</div>
              <div>
                <div className="loop-alert__title">{alert.title}</div>
                <div className="loop-alert__desc">{alert.description}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LoopHealthBadge({ health }: { health: keyof typeof HEALTH_LABELS }) {
  return <span className={`loop-health loop-health--${health}`}>{HEALTH_LABELS[health]}</span>;
}

export function LoopProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="loop-progress" title={label ?? `${value}%`}>
      <div className="loop-progress__track">
        <div className="loop-progress__fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="loop-progress__value">{value}%</span>
    </div>
  );
}

export function LoopCycleDiagram() {
  const phases = [
    { label: "Planejamento", icon: "fa-compass" },
    { label: "Execução", icon: "fa-gears" },
    { label: "Revisão", icon: "fa-magnifying-glass" },
    { label: "Entrega", icon: "fa-box-open" },
    { label: "Aprendizados", icon: "fa-lightbulb" },
  ];

  return (
    <div className="loop-cycle" aria-label="Ciclo operacional contínuo">
      {phases.map((phase, idx) => (
        <div key={phase.label} className="loop-cycle__item">
          <div className="loop-cycle__node">
            <i className={`fa-solid ${phase.icon}`} aria-hidden="true" />
            <span>{phase.label}</span>
          </div>
          {idx < phases.length - 1 ? (
            <i className="fa-solid fa-arrow-right loop-cycle__arrow" aria-hidden="true" />
          ) : (
            <i className="fa-solid fa-rotate loop-cycle__return" aria-hidden="true" title="Retroalimenta o planejamento" />
          )}
        </div>
      ))}
    </div>
  );
}
