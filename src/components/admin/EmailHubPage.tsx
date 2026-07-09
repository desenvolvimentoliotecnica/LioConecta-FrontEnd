import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/rbac/permissions";
import {
  useCancelEmailMessage,
  useEmailMessage,
  useEmailMessages,
  useEmailSummary,
  useRetryEmailMessage,
} from "../../api/hooks/useEmailQueue";
import type { EmailMessageDto } from "../../api/types";
import "../../styles/email-hub-page.css";

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "Pending", label: "Pendente" },
  { value: "Processing", label: "Processando" },
  { value: "Sent", label: "Enviado" },
  { value: "Failed", label: "Falhou" },
  { value: "Cancelled", label: "Cancelado" },
];

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function statusClass(status: string): string {
  switch (status) {
    case "Pending":
      return "email-hub__status--pending";
    case "Processing":
      return "email-hub__status--processing";
    case "Sent":
      return "email-hub__status--sent";
    case "Failed":
      return "email-hub__status--failed";
    case "Cancelled":
      return "email-hub__status--cancelled";
    default:
      return "";
  }
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function MessageDetail({
  message,
  onClose,
  onRetry,
  onCancel,
  busy,
}: {
  message: EmailMessageDto;
  onClose: () => void;
  onRetry: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const bodyPreview = message.bodyText || message.bodyHtml || "—";

  return (
    <section className="email-hub__detail" aria-label="Detalhe da mensagem">
      <div className="email-hub__detail-head">
        <div>
          <h2 className="email-hub__intro-title">{message.subject}</h2>
          <span className={`email-hub__status ${statusClass(message.status)}`}>{message.status}</span>
        </div>
        <button type="button" className="email-hub__btn" onClick={onClose}>
          Fechar
        </button>
      </div>

      {message.lastError ? (
        <p className="email-hub__detail-error">{message.lastError}</p>
      ) : null}

      <dl className="email-hub__detail-meta">
        <div>
          <dt>Para</dt>
          <dd>{message.to.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt>Tentativas</dt>
          <dd>
            {message.attemptCount} / {message.maxAttempts}
          </dd>
        </div>
        <div>
          <dt>Próximo retry</dt>
          <dd>{formatDateTime(message.nextRetryAt)}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatDateTime(message.createdAt)}</dd>
        </div>
        <div>
          <dt>Enviado em</dt>
          <dd>{formatDateTime(message.sentAt)}</dd>
        </div>
        <div>
          <dt>Correlation ID</dt>
          <dd>
            {message.correlationId ? (
              <Link to={`/admin/observabilidade?correlationId=${message.correlationId}`}>
                {message.correlationId}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <div className="email-hub__detail-body">{truncate(bodyPreview, 2000)}</div>

      <div className="email-hub__actions" style={{ marginTop: 12 }}>
        {message.status !== "Sent" && message.status !== "Cancelled" ? (
          <>
            <button
              type="button"
              className="email-hub__btn email-hub__btn--primary"
              onClick={onRetry}
              disabled={busy}
            >
              Reprocessar
            </button>
            <button type="button" className="email-hub__btn" onClick={onCancel} disabled={busy}>
              Cancelar
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function EmailHubPage() {
  const { hasPermission, isLoading: meLoading } = usePermissions();
  const summaryQuery = useEmailSummary();
  const retryMutation = useRetryEmailMessage();
  const cancelMutation = useCancelEmailMessage();

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const messagesQuery = useEmailMessages(statusFilter, search, page, 20);
  const detailQuery = useEmailMessage(selectedId);

  const summary = summaryQuery.data;
  const paged = messagesQuery.data;
  const items = paged?.items ?? [];

  const totalPages = useMemo(() => {
    if (!paged) return 1;
    return Math.max(1, Math.ceil(paged.totalCount / paged.pageSize));
  }, [paged]);

  const handleRetry = async (id: string) => {
    setFeedback(null);
    try {
      await retryMutation.mutateAsync(id);
      setFeedback("Mensagem reenfileirada.");
    } catch {
      setFeedback("Não foi possível reprocessar a mensagem.");
    }
  };

  const handleCancel = async (id: string) => {
    setFeedback(null);
    try {
      await cancelMutation.mutateAsync(id);
      setFeedback("Mensagem cancelada.");
      setSelectedId(null);
    } catch {
      setFeedback("Não foi possível cancelar a mensagem.");
    }
  };

  if (meLoading) {
    return (
      <main className="main">
        <p className="email-hub__empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasPermission(PERMISSIONS.admin.emailManage)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">E-mail</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Fila de e-mail</h1>
            <p className="page-header__desc">
              Observabilidade da fila transacional — status, retry e falhas SMTP.
            </p>
          </div>
        </div>
      </header>

      <section className="email-hub__intro" aria-label="Resumo">
        <div className="email-hub__intro-head">
          <div className="email-hub__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-envelope-circle-check" />
          </div>
          <div>
            <div className="email-hub__intro-title">Envio assíncrono</div>
            <p className="email-hub__intro-text">
              Mensagens enfileiradas no PostgreSQL e processadas pelo worker{" "}
              <code>email-dispatch</code>. Configuração SMTP em tabela dedicada.
            </p>
          </div>
        </div>
        <div className="email-hub__intro-toolbar">
          <Link className="email-hub__btn email-hub__btn--primary" to="/admin/email/config">
            Configurar SMTP
          </Link>
          <Link className="email-hub__btn" to="/admin/workers">
            Workers
          </Link>
          <Link className="email-hub__btn" to="/admin/observabilidade">
            Observabilidade
          </Link>
        </div>
      </section>

      <section className="email-hub__stats" aria-label="Indicadores">
        <article className="email-hub__stat">
          <div className="email-hub__stat-label">Pendentes</div>
          <div className="email-hub__stat-value">{summary?.pending ?? "—"}</div>
        </article>
        <article className="email-hub__stat">
          <div className="email-hub__stat-label">Enviados (24h)</div>
          <div className="email-hub__stat-value email-hub__stat-value--success">
            {summary?.sentLast24Hours ?? "—"}
          </div>
        </article>
        <article className="email-hub__stat">
          <div className="email-hub__stat-label">Falhas (24h)</div>
          <div className="email-hub__stat-value email-hub__stat-value--danger">
            {summary?.failedLast24Hours ?? "—"}
          </div>
        </article>
        <article className="email-hub__stat">
          <div className="email-hub__stat-label">Taxa sucesso (24h)</div>
          <div className="email-hub__stat-value">
            {summary ? `${summary.successRateLast24Hours}%` : "—"}
          </div>
        </article>
      </section>

      {feedback ? (
        <p className="email-hub__empty" role="status">
          {feedback}
        </p>
      ) : null}

      <div className="email-hub__filters">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filtrar por status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar assunto ou destinatário…"
          aria-label="Buscar mensagens"
        />
      </div>

      <section className="email-hub__panel" aria-label="Mensagens">
        {messagesQuery.isLoading ? (
          <p className="email-hub__empty">Carregando mensagens…</p>
        ) : messagesQuery.isError ? (
          <p className="email-hub__empty">Não foi possível carregar a fila.</p>
        ) : items.length === 0 ? (
          <p className="email-hub__empty">Nenhuma mensagem encontrada.</p>
        ) : (
          <>
            <table className="email-hub__table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Destinatário</th>
                  <th>Assunto</th>
                  <th>Tentativas</th>
                  <th>Criado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((message) => (
                  <tr
                    key={message.id}
                    className={selectedId === message.id ? "is-selected" : undefined}
                  >
                    <td>
                      <span className={`email-hub__status ${statusClass(message.status)}`}>
                        {message.status}
                      </span>
                    </td>
                    <td>{message.to[0] ?? "—"}</td>
                    <td>{truncate(message.subject, 60)}</td>
                    <td>
                      {message.attemptCount}/{message.maxAttempts}
                    </td>
                    <td>{formatDateTime(message.createdAt)}</td>
                    <td>
                      <div className="email-hub__actions">
                        <button
                          type="button"
                          className="email-hub__btn"
                          onClick={() => setSelectedId(message.id)}
                        >
                          Detalhe
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="email-hub__pagination">
              <span>
                Exibindo {items.length} de {paged?.totalCount ?? 0} · página {page} de {totalPages}
              </span>
              <div className="email-hub__actions">
                <button
                  type="button"
                  className="email-hub__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="email-hub__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedId && detailQuery.data ? (
        <MessageDetail
          message={detailQuery.data}
          onClose={() => setSelectedId(null)}
          onRetry={() => void handleRetry(selectedId)}
          onCancel={() => void handleCancel(selectedId)}
          busy={retryMutation.isPending || cancelMutation.isPending}
        />
      ) : null}
    </main>
  );
}
