import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ANALYTICS_MODULES,
  ANALYTICS_PERIODS,
  filterByModule,
  getActivityTrend,
  getDepartmentEngagement,
  getKpis,
  getModuleInsights,
  getServiceBreakdown,
  getTopContent,
  type AnalyticsModule,
  type AnalyticsPeriod,
} from "../../config/analytics";
import "../../styles/analytics-page.css";

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
  "90d": "últimos 90 dias",
  "12m": "últimos 12 meses",
};

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [module, setModule] = useState<AnalyticsModule>("all");

  const kpis = useMemo(() => filterByModule(getKpis(period), module), [period, module]);
  const trend = useMemo(() => getActivityTrend(period), [period]);
  const maxTrend = useMemo(() => Math.max(...trend.map((p) => p.value), 1), [trend]);
  const modules = useMemo(() => {
    const all = getModuleInsights(period);
    if (module === "all") return all;
    return all.filter((m) => m.id === module);
  }, [period, module]);
  const topContent = useMemo(() => filterByModule(getTopContent(period), module), [period, module]);
  const serviceBreakdown = useMemo(() => getServiceBreakdown(period), [period]);
  const maxService = useMemo(() => Math.max(...serviceBreakdown.map((s) => s.value), 1), [serviceBreakdown]);
  const departments = useMemo(() => getDepartmentEngagement(), []);

  const showActivityTrend =
    module === "all" ||
    module === "feed" ||
    module === "engajamento" ||
    module === "comunicados" ||
    module === "pessoas" ||
    module === "grupos" ||
    module === "documentos";
  const showServiceBreakdown = module === "all" || module === "servicos";
  const showChartsSection = showActivityTrend || showServiceBreakdown;
  const showDepartmentEngagement =
    module === "all" || module === "pessoas" || module === "engajamento";

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Analytics</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Analytics</h1>
            <p className="page-header__desc">
              Painel unificado de métricas do ecossistema LioConecta — feed, comunicados, pessoas, grupos,
              documentos, serviços digitais e engajamento.
            </p>
          </div>
        </div>
      </header>

      <section className="analytics-page__controls" aria-label="Período e módulos">
        <div className="analytics-page__summary">
          <div className="analytics-page__summary-icon" aria-hidden="true">
            <i className="fa-solid fa-chart-pie" />
          </div>
          <div>
            <div className="analytics-page__summary-title">
              Visão consolidada · {PERIOD_LABELS[period]}
            </div>
            <p className="analytics-page__summary-text">
              Acompanhe indicadores de uso e engajamento em todas as áreas do portal corporativo.
              Selecione um módulo para filtrar os dados ou exporte o relatório completo.
            </p>
          </div>
        </div>

        <div className="analytics-page__toolbar">
          <div className="page-filters" role="group" aria-label="Filtrar por período">
            {ANALYTICS_PERIODS.map((entry) => (
              <button
                key={entry.id}
                className={`filter-chip${period === entry.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setPeriod(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <button className="analytics-page__export" type="button">
            <i className="fa-solid fa-file-export" aria-hidden="true" />
            Exportar relatório
          </button>
        </div>

        <div className="page-filters" role="group" aria-label="Filtrar por módulo" style={{ paddingTop: 12 }}>
          {ANALYTICS_MODULES.map((entry) => (
            <button
              key={entry.id}
              className={`filter-chip${module === entry.id ? " is-active" : ""}`}
              type="button"
              onClick={() => setModule(entry.id)}
            >
              <i className={`fa-solid ${entry.icon}`} aria-hidden="true" style={{ marginRight: 6 }} />
              {entry.label}
            </button>
          ))}
        </div>
      </section>

      {kpis.length > 0 ? (
        <section className="analytics-kpi-grid" aria-label="Indicadores principais">
          {kpis.map((kpi) => (
            <article key={kpi.id} className={`analytics-kpi analytics-kpi--${kpi.mod}`}>
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
            </article>
          ))}
        </section>
      ) : null}

      {showChartsSection ? (
        <section className="analytics-grid-2" aria-label="Tendência e serviços">
          {showActivityTrend ? (
            <article className="analytics-panel">
              <h2 className="analytics-panel__title">Atividade no portal</h2>
              <p className="analytics-panel__desc">
                Sessões e interações agregadas (acessos, cliques, publicações e solicitações).
              </p>
              <div className="analytics-chart" role="img" aria-label="Gráfico de atividade por período">
                {trend.map((point) => (
                  <div key={point.label} className="analytics-chart__bar-wrap">
                    <span className="analytics-chart__value">{point.value}</span>
                    <div
                      className="analytics-chart__bar"
                      style={{ height: `${(point.value / maxTrend) * 100}%` }}
                    />
                    <span className="analytics-chart__label">{point.label}</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {showServiceBreakdown ? (
            <article className="analytics-panel">
              <h2 className="analytics-panel__title">Solicitações por área</h2>
              <p className="analytics-panel__desc">
                Distribuição de chamados nos serviços digitais do portal.
              </p>
              <div className="analytics-service-list">
                {serviceBreakdown.map((item) => (
                  <div key={item.label} className="analytics-service-row">
                    <div>
                      <div className="analytics-service-row__label">{item.label}</div>
                      <div className="analytics-service-row__bar-wrap">
                        <div
                          className="analytics-service-row__bar"
                          style={{
                            width: `${(item.value / maxService) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="analytics-service-row__value">{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}

      {modules.length > 0 ? (
        <section aria-label="Métricas por módulo">
          <h2 className="analytics-page__section-title">Ecossistema do portal</h2>
          <div className="analytics-modules">
            {modules.map((mod) => (
              <article key={mod.id} className="analytics-module-card">
                <div className="analytics-module-card__head">
                  <div>
                    <h3 className="analytics-module-card__title">{mod.title}</h3>
                    <p className="analytics-module-card__desc">{mod.description}</p>
                  </div>
                  <Link className="analytics-module-card__link" to={mod.href}>
                    Acessar
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                  </Link>
                </div>
                <div className="analytics-module-card__stats">
                  {mod.stats.map((stat) => (
                    <div key={stat.label} className="analytics-module-card__stat">
                      <div className="analytics-module-card__stat-value">{stat.value}</div>
                      <div className="analytics-module-card__stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {mod.highlight ? (
                  <p className="analytics-module-card__highlight">
                    <i className="fa-solid fa-lightbulb" aria-hidden="true" />
                    {mod.highlight}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="analytics-grid-2" aria-label="Rankings e departamentos">
        {topContent.length > 0 ? (
          <article className="analytics-panel">
            <h2 className="analytics-panel__title">Conteúdo em destaque</h2>
            <p className="analytics-panel__desc">
              Itens com maior engajamento no período selecionado.
            </p>
            <ol className="analytics-ranking">
              {topContent.map((item) => (
                <li key={item.rank}>
                  <Link className="analytics-ranking__item" to={item.href}>
                    <span className="analytics-ranking__rank">{item.rank}</span>
                    <div>
                      <div className="analytics-ranking__title">{item.title}</div>
                      <div className="analytics-ranking__meta">{item.meta}</div>
                    </div>
                    <span className="analytics-ranking__value">{item.value}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        ) : (
          <div className="analytics-page__empty">
            <i className="fa-solid fa-chart-simple" aria-hidden="true" />
            <p>Nenhum conteúdo em destaque para o módulo selecionado.</p>
          </div>
        )}

        {showDepartmentEngagement ? (
          <article className="analytics-panel">
            <h2 className="analytics-panel__title">Engajamento por departamento</h2>
            <p className="analytics-panel__desc">
              Taxa de participação ativa dos colaboradores por área.
            </p>
            <div className="analytics-dept-list">
              {departments.map((dept) => (
                <div key={dept.name} className="analytics-dept-row">
                  <span className="analytics-dept-row__name">{dept.name}</span>
                  <div className="analytics-dept-row__bar-wrap">
                    <div
                      className="analytics-dept-row__bar"
                      style={{ width: `${dept.engagement}%` }}
                    />
                  </div>
                  <span className="analytics-dept-row__pct">{dept.engagement}%</span>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>

      <p className="page-empty-note">
        Dados simulados para demonstração · Período: {PERIOD_LABELS[period]}
        {module !== "all" ? ` · Módulo: ${ANALYTICS_MODULES.find((m) => m.id === module)?.label}` : ""}
      </p>
    </main>
  );
}
