import { Link } from "react-router-dom";
import type { LoopKpi } from "../../config/loop/types";
import "../../styles/loop-dashboard.css";

function LoopKpiCard({ kpi }: { kpi: LoopKpi }) {
  return (
    <article className={`loop-kpi loop-kpi--${kpi.mod}`}>
      <div className="loop-kpi__accent" aria-hidden="true">
        <i className={`fa-solid ${kpi.icon}`} />
      </div>
      <div className="loop-kpi__body">
        <div className="loop-kpi__head">
          <span className={`loop-kpi__delta loop-kpi__delta--${kpi.trend}`}>{kpi.delta}</span>
        </div>
        <div className="loop-kpi__value">{kpi.value}</div>
        <div className="loop-kpi__label">{kpi.label}</div>
      </div>
    </article>
  );
}

export function LoopKpiGrid({ kpis }: { kpis: LoopKpi[] }) {
  return (
    <section className="analytics-kpi-grid loop-kpi-grid" aria-label="Indicadores do Loop">
      {kpis.map((kpi) =>
        kpi.href ? (
          <Link key={kpi.id} to={kpi.href} className="loop-kpi-link">
            <LoopKpiCard kpi={kpi} />
          </Link>
        ) : (
          <LoopKpiCard key={kpi.id} kpi={kpi} />
        ),
      )}
    </section>
  );
}
