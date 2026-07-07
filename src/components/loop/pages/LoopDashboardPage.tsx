import { useMemo } from "react";
import { buildLoopDashboardView, formatLoopDate } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import { LoopRiskDonutChart, LoopPerformanceChart } from "../LoopCharts";
import { LoopKpiGrid } from "../LoopKpiGrid";
import { LoopCapacityBars, LoopProjectList } from "../LoopProjectList";
import { LoopAlertsPanel, LoopCycleDiagram } from "../LoopShared";
import "../../../styles/analytics-page.css";
import "../../../styles/loop-dashboard.css";

export function LoopDashboardPage() {
  const { filters } = useLoopFilters();
  const view = useMemo(() => buildLoopDashboardView(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Visão Geral</h1>
        <p className="loop-page__desc">
          Painel executivo de projetos, atividades, equipes e indicadores de desempenho.
        </p>
      </div>

      <LoopCycleDiagram />
      <LoopKpiGrid kpis={view.kpis} />

      <div className="loop-dashboard__grid">
        <LoopAlertsPanel alerts={view.alerts} />
        <article className="loop-panel">
          <h2 className="loop-panel__title">Índice de desempenho</h2>
          <p className="loop-panel__desc">
            {view.performanceDelta >= 0 ? "+" : ""}
            {view.performanceDelta} p.p. versus período anterior
          </p>
          <LoopPerformanceChart data={view.performanceHistory} currentValue={view.performanceIndex} />
        </article>
      </div>

      <div className="loop-dashboard__grid loop-dashboard__grid--3">
        <LoopProjectList projects={view.projects} />
        <LoopCapacityBars teams={view.teams} />
        <article className="loop-panel">
          <h2 className="loop-panel__title">Riscos abertos</h2>
          <LoopRiskDonutChart data={view.risks.bySeverity} total={view.risks.total} />
        </article>
      </div>

      <article className="loop-panel">
        <h2 className="loop-panel__title">Atividades recentes</h2>
        <div className="loop-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Projeto</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {view.recentActivities.map((a) => (
                <tr key={a.id} className={a.isOverdue ? "loop-row--overdue" : undefined}>
                  <td>{a.title}</td>
                  <td>{a.projectName}</td>
                  <td>{a.assigneeName}</td>
                  <td>{formatLoopDate(a.dueDate)}</td>
                  <td>
                    <span className={`workers-status workers-status--${a.isOverdue ? "warning" : "neutral"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
