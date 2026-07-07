import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "../../config/analytics";

type PerformanceChartProps = {
  data: TrendPoint[];
  currentValue: number;
};

export function LoopPerformanceChart({ data, currentValue }: PerformanceChartProps) {
  return (
    <div className="analytics-chart analytics-chart--recharts">
      <div className="loop-chart__current">
        <span className="loop-chart__current-value">{currentValue}%</span>
        <span className="loop-chart__current-label">Índice de desempenho</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="loopPerfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(value) => [`${value}%`, "Desempenho"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#loopPerfGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type DonutChartProps = {
  data: { label: string; value: number; color: string }[];
  total: number;
};

export function LoopRiskDonutChart({ data, total }: DonutChartProps) {
  return (
    <div className="loop-donut">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data.filter((d) => d.value > 0)}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="loop-donut__center">
        <span className="loop-donut__total">{total}</span>
        <span className="loop-donut__label">riscos</span>
      </div>
      <ul className="loop-donut__legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="loop-donut__swatch" style={{ background: d.color }} />
            {d.label}: {d.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

type CategoryBarChartProps = {
  data: { label: string; value: number; color: string }[];
};

function consolidateCategories(
  data: { label: string; value: number; color: string }[],
  limit = 6,
) {
  if (data.length <= limit) return data;

  const top = data.slice(0, limit - 1);
  const rest = data.slice(limit - 1);
  const otrosValue = rest.reduce((sum, item) => sum + item.value, 0);

  return [...top, { label: "Outros", value: otrosValue, color: "#94a3b8" }];
}

export function LoopRiskCategoryChart({ data }: CategoryBarChartProps) {
  const items = consolidateCategories(data);
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="loop-risk-category-list" aria-label="Riscos por categoria">
      {items.map((item) => (
        <li key={item.label} className="loop-risk-category-list__item">
          <div className="loop-risk-category-list__head">
            <span className="loop-risk-category-list__label">{item.label}</span>
            <span className="loop-risk-category-list__value">{item.value}</span>
          </div>
          <div className="loop-risk-category-list__track" aria-hidden="true">
            <div
              className="loop-risk-category-list__bar"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
