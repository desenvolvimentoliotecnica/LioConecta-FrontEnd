import { Link } from "react-router-dom";
import type { LoopKpi } from "../../config/loop/types";

export function LoopKpiGrid({ kpis }: { kpis: LoopKpi[] }) {
  return (
    <section className="analytics-kpi-grid" aria-label="Indicadores do Loop">
      {kpis.map((kpi) => {
        const inner = (
          <>
            <div className="analytics-kpi__head">
              <span className={`analytics-kpi__icon analytics-kpi__icon--${kpi.mod}`}>
                <i className={`fa-solid ${kpi.icon}`} aria-hidden="true" />
              </span>
              <span className={`analytics-kpi__delta analytics-kpi__delta--${kpi.trend}`}>
                {kpi.delta}
              </span>
            </div>
            <div className="analytics-kpi__value">{kpi.value}</div>
            <div className="analytics-kpi__label">{kpi.label}</div>
          </>
        );

        return kpi.href ? (
          <Link key={kpi.id} to={kpi.href} className="loop-kpi-link">
            <article className={`analytics-kpi analytics-kpi--${kpi.mod}`}>{inner}</article>
          </Link>
        ) : (
          <article key={kpi.id} className={`analytics-kpi analytics-kpi--${kpi.mod}`}>
            {inner}
          </article>
        );
      })}
    </section>
  );
}
