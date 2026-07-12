import { useMemo, useState } from "react";
import { useMoodMetrics } from "../../api/hooks/useF3";
import type { MoodMetricsDto } from "../../api/types";
import { MOOD_OPTIONS, type MoodLevel } from "../../config/mood-feedback";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { PermissionGate } from "../auth/PermissionGate";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/clima-page.css";

const MOOD_API_KEYS: Record<MoodLevel, string[]> = {
  great: ["Great", "great"],
  good: ["Good", "good"],
  neutral: ["Neutral", "neutral"],
  need_support: ["NeedSupport", "need_support", "needSupport"],
};

const MOOD_KPI_MOD: Record<MoodLevel | "total", string> = {
  total: "total",
  great: "great",
  good: "good",
  neutral: "neutral",
  need_support: "need_support",
};

type DeptSortKey = "department" | "total";
type SortDir = "asc" | "desc";

function moodCount(byMood: Record<string, number> | undefined, level: MoodLevel): number {
  if (!byMood) return 0;
  for (const key of MOOD_API_KEYS[level]) {
    if (key in byMood) return byMood[key] ?? 0;
  }
  return 0;
}

function formatPeriodDate(value?: string | null): string {
  if (!value) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatChartDay(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function DailyChart({ daily }: { daily: MoodMetricsDto["daily"] }) {
  const max = Math.max(1, ...daily.map((day) => day.total));

  if (daily.length === 0) {
    return (
      <div className="clima-page__chart-empty">
        <i className="fa-solid fa-chart-column" aria-hidden="true" />
        <span>Sem respostas diárias no período.</span>
      </div>
    );
  }

  return (
    <div className="clima-page__chart" role="img" aria-label="Gráfico de respostas por dia">
      {daily.map((day) => {
        const height = Math.max(6, Math.round((day.total / max) * 140));
        return (
          <div className="clima-page__chart-bar-wrap" key={day.date}>
            <span className="clima-page__chart-value">{day.total}</span>
            <span
              className="clima-page__chart-bar"
              style={{ height }}
              title={`${formatChartDay(day.date)}: ${day.total}`}
            />
            <span className="clima-page__chart-label">{formatChartDay(day.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DepartmentTable({ rows }: { rows: MoodMetricsDto["byDepartment"] }) {
  const [sortKey, setSortKey] = useState<DeptSortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const next = [...rows];
    next.sort((a, b) => {
      const cmp =
        sortKey === "department"
          ? a.departmentName.localeCompare(b.departmentName, "pt-BR")
          : a.total - b.total;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [rows, sortDir, sortKey]);

  function toggleSort(key: DeptSortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "department" ? "asc" : "desc");
  }

  function sortIcon(key: DeptSortKey) {
    if (sortKey !== key) return "fa-sort";
    return sortDir === "asc" ? "fa-sort-up" : "fa-sort-down";
  }

  return (
    <div className="clima-page__table-wrap">
      <table className="clima-page__table">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className={`clima-page__sort${sortKey === "department" ? " is-active" : ""}`}
                onClick={() => toggleSort("department")}
              >
                Departamento
                <i className={`fa-solid ${sortIcon("department")}`} aria-hidden="true" />
              </button>
            </th>
            <th>
              <button
                type="button"
                className={`clima-page__sort${sortKey === "total" ? " is-active" : ""}`}
                onClick={() => toggleSort("total")}
              >
                Respostas
                <i className={`fa-solid ${sortIcon("total")}`} aria-hidden="true" />
              </button>
            </th>
            <th>Distribuição</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr className="clima-page__empty-row">
              <td colSpan={3}>Nenhum departamento com respostas no período.</td>
            </tr>
          ) : (
            sorted.map((department) => (
              <tr key={department.departmentName}>
                <td className="clima-page__dept-name">{department.departmentName}</td>
                <td className="clima-page__total-cell">{department.total}</td>
                <td>
                  <div className="clima-page__distribution">
                    {MOOD_OPTIONS.map((option) => {
                      const count = moodCount(department.byMood, option.level);
                      if (count <= 0) return null;
                      return (
                        <span
                          key={option.level}
                          className={`clima-page__chip clima-page__chip--${option.level}`}
                        >
                          <i className={`fa-solid ${option.icon}`} aria-hidden="true" />
                          {option.label}: {count}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MoodAnalyticsContent() {
  const metrics = useMoodMetrics();
  const data = metrics.data;

  const kpis = useMemo(() => {
    const byMood = data?.byMood;
    return [
      {
        id: "total" as const,
        label: "Respostas no período",
        value: data?.total ?? 0,
        icon: "fa-chart-simple",
        mod: MOOD_KPI_MOD.total,
      },
      ...MOOD_OPTIONS.map((option) => ({
        id: option.level,
        label: option.label,
        value: moodCount(byMood, option.level),
        icon: option.icon,
        mod: MOOD_KPI_MOD[option.level],
      })),
    ];
  }, [data]);

  return (
    <main className={`${sectionMainClass("rh")} clima-page`}>
      <SectionPageHead
        section="rh"
        title="Clima organizacional"
        current="Clima organizacional"
        description="Acompanhamento consolidado das respostas de humor (sem identificação individual)."
      />

      {metrics.isLoading ? <p className="page-empty-note">Carregando métricas...</p> : null}

      {!metrics.isLoading && !data ? (
        <p className="page-empty-note">Não foi possível carregar as métricas.</p>
      ) : null}

      {data ? (
        <>
          <p className="clima-page__period">
            Período: {formatPeriodDate(data.from)} — {formatPeriodDate(data.to)}
          </p>

          <section className="clima-page__kpi-grid" aria-label="Indicadores de clima">
            {kpis.map((kpi) => (
              <article key={kpi.id} className={`clima-page__kpi clima-page__kpi--${kpi.mod}`}>
                <div className="clima-page__kpi-head">
                  <span className="clima-page__kpi-icon" aria-hidden="true">
                    <i className={`fa-solid ${kpi.icon}`} />
                  </span>
                </div>
                <div className="clima-page__kpi-value">{kpi.value}</div>
                <div className="clima-page__kpi-label">{kpi.label}</div>
              </article>
            ))}
          </section>

          <section className="clima-page__panels">
            <article className="clima-page__panel">
              <h2 className="clima-page__panel-title">Respostas por dia</h2>
              <p className="clima-page__panel-desc">
                Volume diário de respostas no período selecionado.
              </p>
              <DailyChart daily={data.daily} />
            </article>

            <article className="clima-page__panel">
              <h2 className="clima-page__panel-title">Por departamento</h2>
              <p className="clima-page__panel-desc">
                Distribuição agregada por área. Clique no cabeçalho para ordenar.
              </p>
              <DepartmentTable rows={data.byDepartment} />
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}

export function MoodAnalyticsPage() {
  return (
    <PermissionGate
      permission={PERMISSIONS.mood.analytics}
      fallback={
        <main className={sectionMainClass("rh")}>
          <p className="page-empty-note">Você não tem permissão para visualizar o clima.</p>
        </main>
      }
    >
      <MoodAnalyticsContent />
    </PermissionGate>
  );
}
