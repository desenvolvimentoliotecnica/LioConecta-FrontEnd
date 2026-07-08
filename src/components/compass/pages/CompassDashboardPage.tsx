import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCompassDashboard } from "../../../api/hooks/useCompassDashboard";
import { useMe } from "../../../api/hooks/useMe";
import { useCompassMeta } from "../../../api/hooks/useCompassMeta";
import { formatCompassDate, resolveCompassPersona } from "../../../utils/compassView";
import { useCompassFilters } from "../CompassAccessGate";
import { CompassDemandSupplyChart, CompassVarianceChart } from "../CompassCharts";
import { CompassFallbackBanner } from "../CompassHyperionShared";
import { CompassKpiGrid } from "../CompassKpiGrid";
import { CompassAlertsPanel, CompassCycleDiagram, CompassSeverityBadge } from "../CompassShared";
import { CompassPanel } from "../help/CompassPanel";
import { getActiveCycle } from "../../../config/compass/governanceMock";
import "../../../styles/analytics-page.css";
import "../../../styles/compass-dashboard.css";
import "../../../styles/compass-help.css";

export function CompassDashboardPage() {
  const { filters } = useCompassFilters();
  const { data: me } = useMe();
  const { data: meta } = useCompassMeta();
  const { data: view, isLoading, isFallback } = useCompassDashboard(filters);
  const persona = useMemo(() => resolveCompassPersona(me, meta), [me, meta]);
  const cycle = getActiveCycle();

  if (isLoading) {
    return <main className="compass-page"><p className="compass-page__loading">Carregando dashboard…</p></main>;
  }

  return (
    <main className="compass-page">
      <div className="compass-page__head">
        <h1 className="compass-page__title">Visão Geral</h1>
        <p className="compass-page__desc">
          Painel executivo Hyperion YTD — fase IBP: <strong>{view.currentPhaseLabel}</strong> ({view.cycleProgress}%
          concluído). Snapshot: {view.snapshot.name} · {persona.label}.
        </p>
      </div>

      <CompassFallbackBanner show={isFallback} />
      <CompassCycleDiagram currentPhaseId={cycle.currentPhase} />
      <CompassKpiGrid kpis={view.kpis} />

      <div className="compass-dashboard__grid">
        <CompassAlertsPanel alerts={view.alerts} />
        <CompassPanel
          title="Família — IBP Atual vs Anterior"
          infoId="panel-demanda-supply"
          desc="Comparativo YTD por família (Oracle Hyperion EPBCS)."
        >
          <CompassDemandSupplyChart
            data={view.demandSupplyChart.map((d) => ({
              label: d.label,
              demand: d.demand ?? 0,
              supply: d.supply ?? 0,
            }))}
          />
        </CompassPanel>
      </div>

      <div className="compass-dashboard__grid compass-dashboard__grid--3">
        <CompassPanel title="Bridge de variância" infoId="panel-variance-bridge" desc="IBP Anterior → IBP Atual (receita).">
          <CompassVarianceChart
            data={view.varianceBridge.map((d) => ({
              label: d.label,
              value: d.value ?? 0,
              color: d.color ?? "#2563eb",
            }))}
          />
        </CompassPanel>
        <CompassPanel title="Principais desvios" infoId="panel-top-gaps" desc="Maiores variações Diretoria × Tipo.">
          <ul className="compass-gap-list">
            {view.topGaps.map((gap) => (
              <li key={gap.id} className="compass-gap-list__item">
                <div className="compass-gap-list__head">
                  <strong>{gap.title}</strong>
                  <CompassSeverityBadge severity={gap.severity} />
                </div>
                <div className="compass-gap-list__meta">
                  {gap.diretoria} · {gap.tipo} · {gap.value} · {gap.variacaoPct > 0 ? "+" : ""}
                  {gap.variacaoPct}%
                </div>
              </li>
            ))}
          </ul>
          <Link to="/compass/reconciliacao" className="compass-panel__link">
            Ver reconciliação completa
          </Link>
        </CompassPanel>
        <CompassPanel title="Próximas reuniões" infoId="panel-reunioes">
          <ul className="compass-meeting-list">
            {view.upcomingMeetings.map((m) => (
              <li key={m.id} className="compass-meeting-list__item">
                <div className="compass-meeting-list__date">
                  {formatCompassDate(m.date)} · {m.time}
                </div>
                <div className="compass-meeting-list__title">{m.title}</div>
                <div className="compass-meeting-list__phase">{m.phaseLabel}</div>
              </li>
            ))}
          </ul>
          <Link to="/compass/reunioes" className="compass-panel__link">
            Ver agenda completa
          </Link>
        </CompassPanel>
      </div>

      <CompassPanel title="Decisões recentes" infoId="panel-decisoes-recentes">
        <div className="compass-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Decisão</th>
                <th>Reunião</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Impacto</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {view.recentDecisions.map((d) => (
                <tr key={d.id}>
                  <td>{d.title}</td>
                  <td>{d.meetingTitle}</td>
                  <td>{d.ownerName}</td>
                  <td>{formatCompassDate(d.dueDate)}</td>
                  <td>{d.impact}</td>
                  <td>
                    <span
                      className={`workers-status workers-status--${d.status === "pendente" ? "warning" : d.status === "aprovada" ? "success" : "neutral"}`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CompassPanel>

      <footer className="compass-page__footer">
        {isFallback ? "Dados locais (fallback)" : "Oracle Hyperion EPBCS"} — {view.snapshot.periodLabel}
      </footer>
    </main>
  );
}
