import { useMemo } from "react";
import { buildGovernanceScenariosView } from "../../../config/compass/governanceMock";
import { formatCompassCurrency } from "../../../utils/compassView";
import { CompassInfoButton } from "../help/CompassInfoButton";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassScenariosPage() {
  const view = useMemo(() => buildGovernanceScenariosView(), []);

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">
          Cenários
          <CompassInfoButton infoId="nav-cenarios" />
        </h1>
        <p className="compass-page__desc">
          {view.activeCount} cenário(s) ativo(s) — simulações what-if antes de publicar IBP Anterior/Atual no EPBCS.
          Impacto agregado {formatCompassCurrency(view.totalRevenueImpact)}.
        </p>
      </div>

      <div className="compass-scenarios-grid">
        {view.scenarios.map((s) => (
          <article
            key={s.id}
            className={`compass-scenario-card${s.status === "ativo" ? " compass-scenario-card--selected" : ""}`}
          >
            {s.status === "ativo" ? <span className="compass-scenario-card__badge">Ativo</span> : null}
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <dl className="compass-scenario-card__stats">
              <div>
                <dt>Receita Δ</dt>
                <dd>{formatCompassCurrency(s.revenueDelta)}</dd>
              </div>
              <div>
                <dt>Volume Δ</dt>
                <dd>
                  {s.volumeDelta > 0 ? "+" : ""}
                  {s.volumeDelta.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div>
                <dt>Margem Δ</dt>
                <dd>
                  {s.marginDelta > 0 ? "+" : ""}
                  {s.marginDelta}%
                </dd>
              </div>
            </dl>
            <footer className="compass-scenario-card__author">{s.authorName}</footer>
          </article>
        ))}
      </div>

      <footer className="compass-page__footer">Cenários IBP · Oracle Hyperion EPBCS</footer>
    </main>
  );
}
