import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PulseBurndownPoint } from "../../config/pulse/types";

type PulseBurndownChartProps = {
  data: PulseBurndownPoint[];
  sprintName?: string;
};

export function PulseBurndownChart({ data, sprintName }: PulseBurndownChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(d.date)),
  }));

  return (
    <div className="analytics-chart analytics-chart--recharts pulse-burndown-chart">
      {sprintName ? <p className="pulse-burndown-chart__title">{sprintName}</p> : null}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(value, name) => [`${value} pts`, name === "ideal" ? "Ideal" : "Real"]}
          />
          <Legend />
          <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Ideal" />
          <Line type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Real" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
