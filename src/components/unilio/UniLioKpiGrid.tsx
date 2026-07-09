import { Link } from "react-router-dom";
import type { UniLioKpi } from "../../config/unilio/types";
import "../../styles/unilio-dashboard.css";

function UniLioKpiCard({ kpi }: { kpi: UniLioKpi }) {
  return (
    <article className={`unilio-kpi unilio-kpi--${kpi.mod ?? "emerald"}`}>
      <div className="unilio-kpi__accent" aria-hidden="true">
        <i className={`fa-solid ${kpi.icon}`} />
      </div>
      <div className="unilio-kpi__body">
        <div className="unilio-kpi__head">
          <span className={`unilio-kpi__delta unilio-kpi__delta--${kpi.trend}`}>{kpi.delta}</span>
        </div>
        <div className="unilio-kpi__value">{kpi.value}</div>
        <div className="unilio-kpi__label">{kpi.label}</div>
      </div>
    </article>
  );
}

export function UniLioKpiGrid({ kpis }: { kpis: UniLioKpi[] }) {
  return (
    <section className="analytics-kpi-grid unilio-kpi-grid" aria-label="Indicadores do UniLio">
      {kpis.map((kpi) =>
        kpi.href ? (
          <Link key={kpi.id} to={kpi.href} className="unilio-kpi-link">
            <UniLioKpiCard kpi={kpi} />
          </Link>
        ) : (
          <UniLioKpiCard key={kpi.id} kpi={kpi} />
        ),
      )}
    </section>
  );
}
