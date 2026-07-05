import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAnalyticsSnapshot } from "../../api/hooks/useAnalytics";
import {
  ActivityTrendChart,
  DepartmentEngagementChart,
  PollVotesTrendChart,
  ServiceBreakdownChart,
} from "../analytics/AnalyticsCharts";
import {
  ANALYTICS_MODULES,
  ANALYTICS_PERIODS,
  type AnalyticsModule,
  type AnalyticsPeriod,
} from "../../config/analytics";
import { buildAnalyticsView, buildMockAnalyticsView } from "../../utils/analyticsView";
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
  const { data: snapshot, isLoading, isError } = useAnalyticsSnapshot(period);

  const view = useMemo(() => {
    try {
      return buildAnalyticsView(snapshot, period, module);
    } catch {
      return buildMockAnalyticsView(period, module);
    }
  }, [snapshot, period, module]);

  const showActivityTrend =
    module !== "enquetes" &&
    (module === "all" ||
      module === "feed" ||
      module === "engajamento" ||
      module === "comunicados" ||
      module === "pessoas" ||
      module === "grupos" ||
      module === "documentos");
  const showServiceBreakdown = module === "all" || module === "servicos";
  const showChartsSection = showActivityTrend || showServiceBreakdown;
  const showDepartmentEngagement =
    module !== "enquetes" &&
    (module === "all" || module === "pessoas" || module === "engajamento");
  const showPollSection = view.pollSection != null;
  const showPollKpisInSection = module === "all";

  const footerNote = isLoading
    ? "Carregando dados do analytics..."
    : isError
      ? "Não foi possível carregar a API — exibindo dados simulados."
      : view.mockSections.length > 0
        ? `Dados reais do banco · simulado: ${view.mockSections.join(", ")} · ${PERIOD_LABELS[period]}`
        : `Dados reais do banco · ${PERIOD_LABELS[period]}`;

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
              Painel unificado de métricas do ecossistema LioConecta — feed, enquetes, comunicados, pessoas, grupos,
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

      {isLoading ? (
        <p className="page-empty-note">Carregando indicadores...</p>
      ) : null}

      {view.kpis.length > 0 ? (
        <section className="analytics-kpi-grid" aria-label="Indicadores principais">
          {view.kpis.map((kpi) => (
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

      {showPollSection && view.pollSection ? (
        <section className="analytics-polls-section" aria-label="Enquetes">
          <div className="analytics-polls-section__head">
            <div>
              <h2 className="analytics-page__section-title analytics-polls-section__title">
                <i className="fa-solid fa-square-poll-vertical" aria-hidden="true" />
                Enquetes
              </h2>
              <p className="analytics-polls-section__desc">
                Criação, participação, votos e encerramento das enquetes publicadas no feed corporativo.
                {view.pollSection.activityTrendIsMock || view.pollSection.topPollsIsMock
                  ? " · parcialmente simulado"
                  : " · dados reais"}
              </p>
            </div>
            <Link className="analytics-polls-section__link" to="/">
              Ir ao feed
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
            </Link>
          </div>

          {showPollKpisInSection ? (
            <div className="analytics-kpi-grid analytics-kpi-grid--polls">
              {view.pollSection.kpis.map((kpi) => (
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
            </div>
          ) : null}

          <div className="analytics-grid-2 analytics-polls-section__charts">
            <article className="analytics-panel">
              <h3 className="analytics-panel__title">Votos no período</h3>
              <p className="analytics-panel__desc">
                Evolução de votos registrados nas enquetes do feed.
                {view.pollSection.activityTrendIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <PollVotesTrendChart data={view.pollSection.activityTrend} />
            </article>

            <article className="analytics-panel">
              <h3 className="analytics-panel__title">Enquetes em destaque</h3>
              <p className="analytics-panel__desc">
                Enquetes com maior volume de votos no período selecionado.
                {view.pollSection.topPollsIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <ol className="analytics-ranking">
                {view.pollSection.topPolls.map((item) => (
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
          </div>
        </section>
      ) : null}

      {showChartsSection ? (
        <section className="analytics-grid-2" aria-label="Tendência e serviços">
          {showActivityTrend ? (
            <article className="analytics-panel">
              <h2 className="analytics-panel__title">Atividade no portal</h2>
              <p className="analytics-panel__desc">
                Sessões e interações agregadas (eventos, publicações, notificações e solicitações).
                {view.activityTrendIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <ActivityTrendChart data={view.activityTrend} />
            </article>
          ) : null}

          {showServiceBreakdown ? (
            <article className="analytics-panel">
              <h2 className="analytics-panel__title">Solicitações por área</h2>
              <p className="analytics-panel__desc">
                Distribuição de chamados nos serviços digitais do portal.
                {view.serviceBreakdownIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <ServiceBreakdownChart data={view.serviceBreakdown} />
            </article>
          ) : null}
        </section>
      ) : null}

      {view.modules.length > 0 && module !== "enquetes" ? (
        <section aria-label="Métricas por módulo">
          <h2 className="analytics-page__section-title">Ecossistema do portal</h2>
          <div className="analytics-modules">
            {view.modules.map((mod) => (
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

      {module !== "enquetes" ? (
        <section className="analytics-grid-2" aria-label="Rankings e departamentos">
          {view.topContent.length > 0 ? (
            <article className="analytics-panel">
              <h2 className="analytics-panel__title">Conteúdo em destaque</h2>
              <p className="analytics-panel__desc">
                Itens com maior engajamento no período selecionado.
                {view.topContentIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <ol className="analytics-ranking">
                {view.topContent.map((item) => (
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
                {view.departmentsIsMock ? " · dados simulados" : " · dados reais"}
              </p>
              <DepartmentEngagementChart data={view.departments} />
            </article>
          ) : null}
        </section>
      ) : null}

      <p className="page-empty-note">
        {footerNote}
        {module !== "all" ? ` · Módulo: ${ANALYTICS_MODULES.find((m) => m.id === module)?.label}` : ""}
      </p>
    </main>
  );
}
