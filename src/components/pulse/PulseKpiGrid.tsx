import { Link } from "react-router-dom";
import type { PulseKpi } from "../../config/pulse/types";
import "../../styles/pulse-dashboard.css";

function PulseKpiCard({ kpi }: { kpi: PulseKpi }) {
  return (
    <article className={`pulse-kpi pulse-kpi--${kpi.mod}`}>
      <div className="pulse-kpi__accent" aria-hidden="true">
        <i className={`fa-solid ${kpi.icon}`} />
      </div>
      <div className="pulse-kpi__body">
        <div className="pulse-kpi__head">
          <span className={`pulse-kpi__delta pulse-kpi__delta--${kpi.trend}`}>{kpi.delta}</span>
        </div>
        <div className="pulse-kpi__value">{kpi.value}</div>
        <div className="pulse-kpi__label">{kpi.label}</div>
      </div>
    </article>
  );
}

export function PulseKpiGrid({ kpis }: { kpis: PulseKpi[] }) {
  return (
    <section className="analytics-kpi-grid pulse-kpi-grid" aria-label="Indicadores do Pulse">
      {kpis.map((kpi) =>
        kpi.href ? (
          <Link key={kpi.id} to={kpi.href} className="pulse-kpi-link">
            <PulseKpiCard kpi={kpi} />
          </Link>
        ) : (
          <PulseKpiCard key={kpi.id} kpi={kpi} />
        ),
      )}
    </section>
  );
}
