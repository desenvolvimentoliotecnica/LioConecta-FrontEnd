import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/rbac/permissions";
import {
  useAuditActions,
  useAuditEvents,
  useAuditSummary,
  useAuditTargetTypes,
} from "../../api/hooks/useAuditEvents";
import type { AuditEventDto, AuditHttpStatusFilter, AuditSource } from "../../api/types";
import {
  AUDIT_PERIOD_LABELS,
  AUDIT_PERIODS,
  resolveAuditDateRange,
  type AuditPeriod,
} from "../../utils/auditTrailFilters";
import { AuditEventDetailModal } from "./AuditEventDetailModal";
import "../../styles/analytics-page.css";
import "../../styles/audit-trail-page.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function sourceLabel(source: AuditEventDto["source"]): string {
  if (source === "HttpRequest" || source === 0) return "HTTP";
  return "Entidade";
}

function sourceClass(source: AuditEventDto["source"]): string {
  if (source === "HttpRequest" || source === 0) return "audit-trail-page__badge--http";
  return "audit-trail-page__badge--entity";
}

function formatCount(value?: number): string {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

function resetPage(setPage: (value: number) => void) {
  setPage(1);
}

export function AuditTrailPage() {
  const [searchParams] = useSearchParams();
  const { hasPermission, isLoading: meLoading, isError: meError, me } = usePermissions();
  const canAccess = hasPermission(PERMISSIONS.analytics.view);

  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<AuditPeriod>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const [source, setSource] = useState<"" | AuditSource>("");
  const [httpStatus, setHttpStatus] = useState<AuditHttpStatusFilter>("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEventDto | null>(null);

  useEffect(() => {
    const correlationFromUrl = searchParams.get("correlationId");
    if (correlationFromUrl) {
      setCorrelationId(correlationFromUrl);
      setPage(1);
    }
  }, [searchParams]);

  const dateRange = useMemo(
    () => resolveAuditDateRange(period, customFrom, customTo),
    [customFrom, customTo, period],
  );

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 25,
      action: action || undefined,
      targetType: targetType || undefined,
      correlationId: correlationId.trim() || undefined,
      source: source || undefined,
      httpStatus: httpStatus || undefined,
      from: dateRange.from,
      to: dateRange.to,
    }),
    [action, correlationId, dateRange.from, dateRange.to, httpStatus, page, source, targetType],
  );

  const { data, isLoading, isError } = useAuditEvents(queryParams);
  const { data: summary, isLoading: summaryLoading } = useAuditSummary(dateRange.from, dateRange.to);
  const { data: actions = [] } = useAuditActions(dateRange.from, dateRange.to);
  const { data: targetTypes = [] } = useAuditTargetTypes(dateRange.from, dateRange.to);

  const kpis = useMemo(
    () => [
      {
        id: "total",
        mod: "all",
        icon: "fa-clipboard-list",
        delta: AUDIT_PERIOD_LABELS[period],
        trend: "neutral" as const,
        value: formatCount(summary?.totalCount),
        label: "Eventos no período",
      },
      {
        id: "http",
        mod: "feed",
        icon: "fa-globe",
        delta: summary?.totalCount
          ? `${Math.round(((summary.httpCount ?? 0) / summary.totalCount) * 100)}%`
          : "—",
        trend: "neutral" as const,
        value: formatCount(summary?.httpCount),
        label: "Requisições HTTP",
      },
      {
        id: "entity",
        mod: "grupos",
        icon: "fa-database",
        delta: summary?.totalCount
          ? `${Math.round(((summary.entityCount ?? 0) / summary.totalCount) * 100)}%`
          : "—",
        trend: "neutral" as const,
        value: formatCount(summary?.entityCount),
        label: "Alterações de entidade",
      },
      {
        id: "errors",
        mod: "engajamento",
        icon: "fa-triangle-exclamation",
        delta: "HTTP 4xx/5xx",
        trend: (summary?.errorCount ?? 0) > 0 ? ("down" as const) : ("neutral" as const),
        value: formatCount(summary?.errorCount),
        label: "Erros HTTP",
      },
      {
        id: "actors",
        mod: "pessoas",
        icon: "fa-users",
        delta: "distintos",
        trend: "neutral" as const,
        value: formatCount(summary?.uniqueActors),
        label: "Atores envolvidos",
      },
      {
        id: "actions",
        mod: "documentos",
        icon: "fa-bolt",
        delta: "distintas",
        trend: "neutral" as const,
        value: formatCount(summary?.uniqueActions),
        label: "Tipos de ação",
      },
    ],
    [period, summary],
  );

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
          <h1 className="page-header__title">Trilha de auditoria</h1>
          <p className="page-header__desc">
            Não foi possível carregar seu perfil. Confira se o backend está rodando em{" "}
            <code>http://localhost:5148</code> e se <code>VITE_USE_MOCK=false</code> no{" "}
            <code>.env</code>.
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
            A trilha de auditoria exige a permissão <code>{PERMISSIONS.analytics.view}</code>. Solicite acesso em{" "}
            <Link to="/admin/controle-acesso">Controle de acesso</Link>.
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
          <span className="breadcrumb__current">Trilha de auditoria</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Trilha de auditoria</h1>
            <p className="page-header__desc">
              Eventos de mutações HTTP e alterações de entidades persistidos em PostgreSQL. Acesso
              restrito a administradores.
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
              Filtre por período, origem e tipo de ação. Os indicadores refletem o intervalo
              selecionado.
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
              <label htmlFor="audit-filter-from">De</label>
              <input
                id="audit-filter-from"
                type="date"
                value={customFrom}
                onChange={(event) => {
                  resetPage(setPage);
                  setCustomFrom(event.target.value);
                }}
              />
            </div>
            <div className="audit-trail-page__field">
              <label htmlFor="audit-filter-to">Até</label>
              <input
                id="audit-filter-to"
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
        <section className="analytics-kpi-grid audit-trail-page__kpi-grid" aria-label="Indicadores">
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
      )}

      <section className="audit-trail-page__filters" aria-label="Filtros da tabela">
        <div className="audit-trail-page__field">
          <label htmlFor="audit-filter-action">Ação</label>
          <select
            id="audit-filter-action"
            value={action}
            onChange={(event) => {
              resetPage(setPage);
              setAction(event.target.value);
            }}
          >
            <option value="">Todas as ações</option>
            {actions.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <div className="audit-trail-page__field">
          <label htmlFor="audit-filter-target">Tipo de alvo</label>
          <select
            id="audit-filter-target"
            value={targetType}
            onChange={(event) => {
              resetPage(setPage);
              setTargetType(event.target.value);
            }}
          >
            <option value="">Todos os alvos</option>
            {targetTypes.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <div className="audit-trail-page__field">
          <label htmlFor="audit-filter-source">Origem</label>
          <select
            id="audit-filter-source"
            value={source}
            onChange={(event) => {
              resetPage(setPage);
              setSource(event.target.value as "" | AuditSource);
            }}
          >
            <option value="">Todas</option>
            <option value="HttpRequest">HTTP</option>
            <option value="EntityChange">Entidade</option>
          </select>
        </div>
        <div className="audit-trail-page__field">
          <label htmlFor="audit-filter-status">Status HTTP</label>
          <select
            id="audit-filter-status"
            value={httpStatus}
            onChange={(event) => {
              resetPage(setPage);
              setHttpStatus(event.target.value as AuditHttpStatusFilter);
            }}
          >
            <option value="">Todos</option>
            <option value="success">Sucesso (&lt; 400)</option>
            <option value="error">Erro (≥ 400)</option>
          </select>
        </div>
        <div className="audit-trail-page__field audit-trail-page__field--wide">
          <label htmlFor="audit-filter-correlation">Correlation ID</label>
          <input
            id="audit-filter-correlation"
            value={correlationId}
            onChange={(event) => {
              resetPage(setPage);
              setCorrelationId(event.target.value);
            }}
            placeholder="UUID"
          />
        </div>
      </section>

      <div className="audit-trail-page__table-wrap">
        {isLoading ? (
          <p className="audit-trail-page__empty">Carregando eventos…</p>
        ) : isError ? (
          <p className="audit-trail-page__empty">Não foi possível carregar a trilha de auditoria.</p>
        ) : !data || data.items.length === 0 ? (
          <p className="audit-trail-page__empty">Nenhum evento encontrado para os filtros atuais.</p>
        ) : (
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Ator</th>
                <th>Origem</th>
                <th>Ação</th>
                <th>Alvo</th>
                <th>Status</th>
                <th>Duração</th>
                <th>Correlation</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((event) => (
                <tr key={event.id}>
                  <td>{formatDate(event.createdAt)}</td>
                  <td>{event.actorName ?? "Sistema"}</td>
                  <td>
                    <span className={`audit-trail-page__badge ${sourceClass(event.source)}`}>
                      {sourceLabel(event.source)}
                    </span>
                  </td>
                  <td>{event.action}</td>
                  <td>
                    {event.targetType}
                    <br />
                    <small>{event.targetId}</small>
                  </td>
                  <td>{event.statusCode ?? "—"}</td>
                  <td>{event.durationMs != null ? `${event.durationMs} ms` : "—"}</td>
                  <td>
                    <small>{event.correlationId}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data ? (
        <div className="audit-trail-page__pagination">
          <span className="audit-trail-page__pagination-meta">
            Exibindo {data.items.length} de {data.totalCount} eventos · Página {data.page} de{" "}
            {Math.max(data.totalPages, 1)}
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
              disabled={data.totalPages === 0 || page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}

      <AuditEventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}
