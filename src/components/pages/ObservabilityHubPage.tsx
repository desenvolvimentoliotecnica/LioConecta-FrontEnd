import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { canAccessAdminArea } from "../../api/auth";
import {
  useObservabilityAccessEvents,
  useObservabilityErrors,
  useObservabilityInvestigate,
  useObservabilityPageViews,
  useObservabilitySummary,
} from "../../api/hooks/useObservability";
import { useMe } from "../../api/hooks/useMe";
import {
  AUDIT_PERIOD_LABELS,
  AUDIT_PERIODS,
  resolveAuditDateRange,
  type AuditPeriod,
} from "../../utils/auditTrailFilters";
import { ObservabilityTimeline } from "../observability/ObservabilityTimeline";
import "../../styles/analytics-page.css";
import "../../styles/audit-trail-page.css";
import "../../styles/observability-hub.css";

type HubTab = "errors" | "access" | "pageviews" | "investigate" | "links";

const TABS: { id: HubTab; label: string }[] = [
  { id: "errors", label: "Erros" },
  { id: "access", label: "Acessos" },
  { id: "pageviews", label: "Page views" },
  { id: "investigate", label: "Investigar" },
  { id: "links", label: "Links" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatCount(value?: number | null): string {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function formatPercent(value?: number | null): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatLatency(value?: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value)} ms`;
}

function resetPage(setPage: (value: number) => void) {
  setPage(1);
}

function PaginationBar({
  page,
  setPage,
  itemsLength,
  totalCount,
  totalPages,
  label,
}: {
  page: number;
  setPage: (value: number | ((current: number) => number)) => void;
  itemsLength: number;
  totalCount: number;
  totalPages: number;
  label: string;
}) {
  return (
    <div className="audit-trail-page__pagination">
      <span className="audit-trail-page__pagination-meta">
        Exibindo {itemsLength} de {totalCount} {label} · Página {page} de {Math.max(totalPages, 1)}
      </span>
      <div className="audit-trail-page__pagination-actions">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={totalPages === 0 || page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export function ObservabilityHubPage() {
  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const canAccess = canAccessAdminArea(me);

  const [tab, setTab] = useState<HubTab>("errors");
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<AuditPeriod>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [errorEventName, setErrorEventName] = useState("");
  const [accessResult, setAccessResult] = useState("");
  const [accessEventName, setAccessEventName] = useState("");
  const [pageViewModule, setPageViewModule] = useState("");

  const [investigateInput, setInvestigateInput] = useState("");
  const [investigateCorrelationId, setInvestigateCorrelationId] = useState("");

  const dateRange = useMemo(
    () => resolveAuditDateRange(period, customFrom, customTo),
    [customFrom, customTo, period],
  );

  const listParams = useMemo(
    () => ({
      from: dateRange.from,
      to: dateRange.to,
      page,
      pageSize: 25,
    }),
    [dateRange.from, dateRange.to, page],
  );

  const { data: summary, isLoading: summaryLoading } = useObservabilitySummary(
    dateRange.from,
    dateRange.to,
  );
  const { data: errors, isLoading: errorsLoading, isError: errorsError } = useObservabilityErrors({
    ...listParams,
    eventName: errorEventName.trim() || undefined,
  });
  const { data: accessEvents, isLoading: accessLoading, isError: accessError } =
    useObservabilityAccessEvents({
      ...listParams,
      result: accessResult || undefined,
      eventName: accessEventName.trim() || undefined,
    });
  const { data: pageViews, isLoading: pageViewsLoading, isError: pageViewsError } =
    useObservabilityPageViews({
      ...listParams,
      module: pageViewModule.trim() || undefined,
    });
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } =
    useObservabilityInvestigate(investigateCorrelationId.trim() || undefined);

  const kpis = useMemo(
    () => [
      {
        id: "errors24h",
        mod: "engajamento",
        icon: "fa-triangle-exclamation",
        delta: "24h",
        value: formatCount(summary?.errorsLast24h),
        label: "Erros últimas 24h",
      },
      {
        id: "httpErrorRate",
        mod: "feed",
        icon: "fa-chart-line",
        delta: "HTTP",
        value: formatPercent(summary?.httpErrorRate),
        label: "Taxa erro HTTP",
      },
      {
        id: "p95",
        mod: "analytics",
        icon: "fa-gauge-high",
        delta: "P95",
        value: formatLatency(summary?.p95LatencyMs),
        label: "Latência P95",
      },
      {
        id: "rpm",
        mod: "documentos",
        icon: "fa-bolt",
        delta: "req/min",
        value: formatCount(summary?.requestsPerMinute),
        label: "Requests/min",
      },
      {
        id: "dau",
        mod: "pessoas",
        icon: "fa-users",
        delta: "DAU",
        value: formatCount(summary?.dailyActiveUsers),
        label: "Usuários ativos",
      },
      {
        id: "pageViews",
        mod: "grupos",
        icon: "fa-eye",
        delta: AUDIT_PERIOD_LABELS[period],
        value: formatCount(summary?.pageViews),
        label: "Page views",
      },
      {
        id: "topModule",
        mod: "all",
        icon: "fa-cubes",
        delta: "top",
        value: summary?.topModule ?? "—",
        label: "Top módulo",
      },
      {
        id: "topPage",
        mod: "feed",
        icon: "fa-file-lines",
        delta: "top",
        value: summary?.topPage ?? "—",
        label: "Top página",
      },
      {
        id: "accessDenied",
        mod: "engajamento",
        icon: "fa-ban",
        delta: "negados",
        value: formatCount(summary?.accessDenied),
        label: "Acessos negados",
      },
      {
        id: "authFailures",
        mod: "engajamento",
        icon: "fa-key",
        delta: "login",
        value: formatCount(summary?.authFailures),
        label: "Falhas autenticação",
      },
      {
        id: "obsEvents",
        mod: "documentos",
        icon: "fa-bug",
        delta: "eventos",
        value: formatCount(summary?.observabilityEvents),
        label: "Eventos observabilidade",
      },
      {
        id: "accessEvents",
        mod: "pessoas",
        icon: "fa-shield-halved",
        delta: "acessos",
        value: formatCount(summary?.accessEvents),
        label: "Eventos de acesso",
      },
    ],
    [period, summary],
  );

  function handleTabChange(next: HubTab) {
    setTab(next);
    resetPage(setPage);
  }

  function handleInvestigateSubmit(event: React.FormEvent) {
    event.preventDefault();
    setInvestigateCorrelationId(investigateInput.trim());
  }

  if (meLoading) {
    return (
      <main className="main">
        <p className="audit-trail-page__empty">Verificando permissões…</p>
      </main>
    );
  }

  if (meError || !me) {
    return (
      <main className="main">
        <header className="page-header">
          <h1 className="page-header__title">Observabilidade</h1>
          <p className="page-header__desc">
            Não foi possível carregar seu perfil. Confira se o backend está rodando em{" "}
            <code>http://localhost:5148</code>.
          </p>
        </header>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="main">
        <header className="page-header">
          <h1 className="page-header__title">Acesso restrito</h1>
          <p className="page-header__desc">
            O hub de observabilidade exige perfil Admin. Seu usuário atual não possui essa role.
          </p>
        </header>
        <p>
          <Link to="/">Voltar ao início</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Observabilidade</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Observabilidade</h1>
            <p className="page-header__desc">
              Logs, métricas, acessos e correlação com a Trilha de Auditoria. Acesso restrito a
              administradores.
            </p>
          </div>
        </div>
      </header>

      <section className="audit-trail-page__controls" aria-label="Período">
        <div className="audit-trail-page__controls-head">
          <div className="audit-trail-page__controls-icon" aria-hidden="true">
            <i className="fa-solid fa-filter" />
          </div>
          <div>
            <div className="audit-trail-page__controls-title">
              Visão consolidada · {AUDIT_PERIOD_LABELS[period]}
            </div>
            <p className="audit-trail-page__controls-text">
              Indicadores e tabelas refletem o intervalo selecionado. Use a aba Investigar para
              correlacionar eventos por UUID.
            </p>
          </div>
        </div>
        <div className="page-filters" role="group" aria-label="Filtrar por período">
          {AUDIT_PERIODS.map((entry) => (
            <button
              key={entry.id}
              className={`filter-chip${period === entry.id ? " is-active" : ""}`}
              type="button"
              onClick={() => {
                setPeriod(entry.id);
                resetPage(setPage);
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        {period === "custom" ? (
          <div className="audit-trail-page__custom-range">
            <div className="audit-trail-page__field">
              <label htmlFor="obs-filter-from">De</label>
              <input
                id="obs-filter-from"
                type="date"
                value={customFrom}
                onChange={(event) => {
                  resetPage(setPage);
                  setCustomFrom(event.target.value);
                }}
              />
            </div>
            <div className="audit-trail-page__field">
              <label htmlFor="obs-filter-to">Até</label>
              <input
                id="obs-filter-to"
                type="date"
                value={customTo}
                onChange={(event) => {
                  resetPage(setPage);
                  setCustomTo(event.target.value);
                }}
              />
            </div>
          </div>
        ) : null}
      </section>

      {summaryLoading ? (
        <p className="audit-trail-page__empty">Carregando indicadores…</p>
      ) : (
        <section
          className="analytics-kpi-grid observability-hub__kpi-grid"
          aria-label="Indicadores de observabilidade"
        >
          {kpis.map((kpi) => (
            <article key={kpi.id} className={`analytics-kpi analytics-kpi--${kpi.mod}`}>
              <div className="analytics-kpi__head">
                <span className={`analytics-kpi__icon analytics-kpi__icon--${kpi.mod}`}>
                  <i className={`fa-solid ${kpi.icon}`} aria-hidden="true" />
                </span>
                <span className="analytics-kpi__delta analytics-kpi__delta--neutral">{kpi.delta}</span>
              </div>
              <div className="analytics-kpi__value">{kpi.value}</div>
              <div className="analytics-kpi__label">{kpi.label}</div>
            </article>
          ))}
        </section>
      )}

      <div className="observability-hub__tabs" role="tablist" aria-label="Seções do hub">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`observability-hub__tab${tab === entry.id ? " is-active" : ""}`}
            onClick={() => handleTabChange(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "errors" ? (
        <>
          <section className="audit-trail-page__filters" aria-label="Filtros de erros">
            <div className="audit-trail-page__field audit-trail-page__field--wide">
              <label htmlFor="obs-filter-error-name">Event name</label>
              <input
                id="obs-filter-error-name"
                value={errorEventName}
                onChange={(event) => {
                  resetPage(setPage);
                  setErrorEventName(event.target.value);
                }}
                placeholder="Ex.: api.error"
              />
            </div>
          </section>
          <div className="audit-trail-page__table-wrap">
            {errorsLoading ? (
              <p className="audit-trail-page__empty">Carregando erros…</p>
            ) : errorsError ? (
              <p className="audit-trail-page__empty">Não foi possível carregar os erros.</p>
            ) : !errors || errors.items.length === 0 ? (
              <p className="audit-trail-page__empty">Nenhum erro encontrado para os filtros atuais.</p>
            ) : (
              <table className="audit-trail-page__table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Severidade</th>
                    <th>Evento</th>
                    <th>Rota</th>
                    <th>Usuário</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.occurredAt)}</td>
                      <td>{item.severity}</td>
                      <td>
                        {item.eventName}
                        <br />
                        <small>{item.eventType}</small>
                      </td>
                      <td>{item.routeTemplate ?? "—"}</td>
                      <td>{item.userName ?? item.userId ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setInvestigateInput(item.correlationId);
                            setInvestigateCorrelationId(item.correlationId);
                            setTab("investigate");
                          }}
                        >
                          <small>{item.correlationId}</small>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {errors ? (
            <PaginationBar
              page={page}
              setPage={setPage}
              itemsLength={errors.items.length}
              totalCount={errors.totalCount}
              totalPages={errors.totalPages}
              label="erros"
            />
          ) : null}
        </>
      ) : null}

      {tab === "access" ? (
        <>
          <section className="audit-trail-page__filters" aria-label="Filtros de acessos">
            <div className="audit-trail-page__field">
              <label htmlFor="obs-filter-access-result">Resultado</label>
              <select
                id="obs-filter-access-result"
                value={accessResult}
                onChange={(event) => {
                  resetPage(setPage);
                  setAccessResult(event.target.value);
                }}
              >
                <option value="">Todos</option>
                <option value="Success">Success</option>
                <option value="Denied">Denied</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="audit-trail-page__field audit-trail-page__field--wide">
              <label htmlFor="obs-filter-access-name">Event name</label>
              <input
                id="obs-filter-access-name"
                value={accessEventName}
                onChange={(event) => {
                  resetPage(setPage);
                  setAccessEventName(event.target.value);
                }}
                placeholder="Ex.: Access.Denied"
              />
            </div>
          </section>
          <div className="audit-trail-page__table-wrap">
            {accessLoading ? (
              <p className="audit-trail-page__empty">Carregando eventos de acesso…</p>
            ) : accessError ? (
              <p className="audit-trail-page__empty">Não foi possível carregar os acessos.</p>
            ) : !accessEvents || accessEvents.items.length === 0 ? (
              <p className="audit-trail-page__empty">Nenhum evento de acesso encontrado.</p>
            ) : (
              <table className="audit-trail-page__table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Evento</th>
                    <th>Usuário</th>
                    <th>Recurso</th>
                    <th>Resultado</th>
                    <th>Motivo</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {accessEvents.items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.occurredAt)}</td>
                      <td>
                        {item.eventName}
                        <br />
                        <small>{item.eventType}</small>
                      </td>
                      <td>{item.userName ?? item.usernameSnapshot ?? item.userId ?? "—"}</td>
                      <td>
                        {item.resource ?? "—"}
                        {item.action ? (
                          <>
                            <br />
                            <small>{item.action}</small>
                          </>
                        ) : null}
                      </td>
                      <td>{item.result}</td>
                      <td>{item.reasonCode ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setInvestigateInput(item.correlationId);
                            setInvestigateCorrelationId(item.correlationId);
                            setTab("investigate");
                          }}
                        >
                          <small>{item.correlationId}</small>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {accessEvents ? (
            <PaginationBar
              page={page}
              setPage={setPage}
              itemsLength={accessEvents.items.length}
              totalCount={accessEvents.totalCount}
              totalPages={accessEvents.totalPages}
              label="acessos"
            />
          ) : null}
        </>
      ) : null}

      {tab === "pageviews" ? (
        <>
          <section className="audit-trail-page__filters" aria-label="Filtros de page views">
            <div className="audit-trail-page__field audit-trail-page__field--wide">
              <label htmlFor="obs-filter-module">Módulo</label>
              <input
                id="obs-filter-module"
                value={pageViewModule}
                onChange={(event) => {
                  resetPage(setPage);
                  setPageViewModule(event.target.value);
                }}
                placeholder="Ex.: admin, feed, rh"
              />
            </div>
          </section>
          <div className="audit-trail-page__table-wrap">
            {pageViewsLoading ? (
              <p className="audit-trail-page__empty">Carregando page views…</p>
            ) : pageViewsError ? (
              <p className="audit-trail-page__empty">Não foi possível carregar page views.</p>
            ) : !pageViews || pageViews.items.length === 0 ? (
              <p className="audit-trail-page__empty">Nenhum page view encontrado.</p>
            ) : (
              <table className="audit-trail-page__table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Página</th>
                    <th>Rota</th>
                    <th>Módulo</th>
                    <th>Duração</th>
                    <th>Usuário</th>
                    <th>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {pageViews.items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.occurredAt)}</td>
                      <td>{item.pageName}</td>
                      <td>{item.routeTemplate}</td>
                      <td>{item.module}</td>
                      <td>{item.durationMs != null ? `${item.durationMs} ms` : "—"}</td>
                      <td>{item.userName ?? item.userId ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setInvestigateInput(item.correlationId);
                            setInvestigateCorrelationId(item.correlationId);
                            setTab("investigate");
                          }}
                        >
                          <small>{item.correlationId}</small>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {pageViews ? (
            <PaginationBar
              page={page}
              setPage={setPage}
              itemsLength={pageViews.items.length}
              totalCount={pageViews.totalCount}
              totalPages={pageViews.totalPages}
              label="page views"
            />
          ) : null}
        </>
      ) : null}

      {tab === "investigate" ? (
        <section aria-label="Investigar por correlation ID">
          <form className="observability-hub__investigate-form" onSubmit={handleInvestigateSubmit}>
            <div className="audit-trail-page__field audit-trail-page__field--wide">
              <label htmlFor="obs-investigate-correlation">Correlation ID</label>
              <input
                id="obs-investigate-correlation"
                value={investigateInput}
                onChange={(event) => setInvestigateInput(event.target.value)}
                placeholder="UUID"
              />
            </div>
            <button type="submit" className="btn btn--primary">
              Investigar
            </button>
          </form>
          {timelineLoading ? (
            <p className="audit-trail-page__empty">Montando timeline…</p>
          ) : timelineError ? (
            <p className="audit-trail-page__empty">Não foi possível carregar a timeline.</p>
          ) : investigateCorrelationId && timeline ? (
            <ObservabilityTimeline
              correlationId={timeline.correlationId}
              items={timeline.items}
            />
          ) : (
            <p className="observability-hub__empty">
              Informe um correlation ID para ver a timeline unificada.
            </p>
          )}
        </section>
      ) : null}

      {tab === "links" ? (
        <section className="observability-hub__links" aria-label="Links relacionados">
          <Link className="observability-hub__link-card" to="/admin/trilha-auditoria">
            <span className="observability-hub__link-card-icon">
              <i className="fa-solid fa-clipboard-list" aria-hidden="true" />
            </span>
            <span className="observability-hub__link-card-title">Trilha de Auditoria</span>
            <span className="observability-hub__link-card-text">
              Eventos HTTP e alterações de entidade persistidos com correlation ID.
            </span>
          </Link>
          <Link className="observability-hub__link-card" to="/analytics">
            <span className="observability-hub__link-card-icon">
              <i className="fa-solid fa-chart-pie" aria-hidden="true" />
            </span>
            <span className="observability-hub__link-card-title">Analytics</span>
            <span className="observability-hub__link-card-text">
              Métricas de produto e engajamento da plataforma.
            </span>
          </Link>
          <Link
            className="observability-hub__link-card"
            to="/admin/configuracoes-backend?category=observability"
          >
            <span className="observability-hub__link-card-icon">
              <i className="fa-solid fa-server" aria-hidden="true" />
            </span>
            <span className="observability-hub__link-card-title">Configurações observabilidade</span>
            <span className="observability-hub__link-card-text">
              Retenção, OTel, page views e access audit — via app settings.
            </span>
          </Link>
        </section>
      ) : null}
    </main>
  );
}
