type DemandSupplyPoint = {
  label: string;
  demand: number;
  supply: number;
};

export function CompassDemandSupplyChart({ data }: { data: DemandSupplyPoint[] }) {
  const max = Math.max(...data.flatMap((d) => [d.demand, d.supply]), 1);

  return (
    <div className="compass-chart compass-chart--demand-supply" aria-label="Demanda versus supply">
      <ul className="compass-bar-chart">
        {data.map((point) => (
          <li key={point.label} className="compass-bar-chart__group">
            <span className="compass-bar-chart__label">{point.label}</span>
            <div className="compass-bar-chart__bars">
              <div className="compass-bar-chart__row">
                <span className="compass-bar-chart__legend compass-bar-chart__legend--demand">Demanda</span>
                <div className="compass-bar-chart__track">
                  <div
                    className="compass-bar-chart__bar compass-bar-chart__bar--demand"
                    style={{ width: `${(point.demand / max) * 100}%` }}
                  />
                </div>
                <span className="compass-bar-chart__value">{point.demand.toLocaleString("pt-BR")}</span>
              </div>
              <div className="compass-bar-chart__row">
                <span className="compass-bar-chart__legend compass-bar-chart__legend--supply">Supply</span>
                <div className="compass-bar-chart__track">
                  <div
                    className="compass-bar-chart__bar compass-bar-chart__bar--supply"
                    style={{ width: `${(point.supply / max) * 100}%` }}
                  />
                </div>
                <span className="compass-bar-chart__value">{point.supply.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type VariancePoint = {
  label: string;
  value: number;
  color: string;
};

export function CompassVarianceChart({ data }: { data: VariancePoint[] }) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="compass-chart compass-chart--variance" aria-label="Bridge de variância financeira">
      <ul className="compass-variance-chart">
        {data.map((point) => {
          const isNegative = point.value < 0;
          const widthPct = (Math.abs(point.value) / maxAbs) * 100;
          return (
            <li key={point.label} className="compass-variance-chart__item">
              <span className="compass-variance-chart__label">{point.label}</span>
              <div className="compass-variance-chart__bar-wrap">
                <div
                  className={`compass-variance-chart__bar${isNegative ? " compass-variance-chart__bar--neg" : ""}`}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: point.color,
                    marginLeft: isNegative ? `${100 - widthPct}%` : undefined,
                  }}
                />
              </div>
              <span className="compass-variance-chart__value">
                {point.value > 0 ? "+" : ""}
                {point.value}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
