import { Link } from "react-router-dom";
import type { CompassKpiDto } from "../../api/types";
import "../../styles/compass-dashboard.css";

function CompassKpiCard({ kpi }: { kpi: CompassKpiDto }) {
  return (
    <article className={`compass-kpi compass-kpi--${kpi.mod}`}>
      <div className="compass-kpi__accent" aria-hidden="true">
        <i className={`fa-solid ${kpi.icon}`} />
      </div>
      <div className="compass-kpi__body">
        <div className="compass-kpi__head">
          <span className={`compass-kpi__delta compass-kpi__delta--${kpi.trend}`}>{kpi.delta}</span>
        </div>
        <div className="compass-kpi__value">{kpi.value}</div>
        <div className="compass-kpi__label">{kpi.label}</div>
      </div>
    </article>
  );
}

export function CompassKpiGrid({ kpis }: { kpis: CompassKpiDto[] }) {
  return (
    <section className="analytics-kpi-grid compass-kpi-grid" aria-label="Indicadores do Compass IBP">
      {kpis.map((kpi) =>
        kpi.href != null && kpi.href !== "" ? (
          <Link key={kpi.id} to={kpi.href} className="compass-kpi-link">
            <CompassKpiCard kpi={kpi} />
          </Link>
        ) : (
          <CompassKpiCard key={kpi.id} kpi={kpi} />
        ),
      )}
    </section>
  );
}
