import { useEffect, useMemo, useRef, useState } from "react";
import { useHelpDeskAllTickets, useHelpDeskTickets } from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketListItemDto } from "../../api/types";
import { HelpDeskTicketDetailModal } from "./HelpDeskTicketDetailModal";
import { HelpDeskTicketStatusChip } from "./HelpDeskTicketStatusChip";

const PAGE_SIZE = 15;
const SCOPE = "90d";

type TicketView = "mine" | "all";
type SortKey = "createdAtDesc" | "createdAtAsc" | "priority" | "status" | "subject";

type Props = {
  canViewAllTickets?: boolean;
};

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "createdAtDesc", label: "Mais recentes" },
  { id: "createdAtAsc", label: "Mais antigos" },
  { id: "priority", label: "Prioridade" },
  { id: "status", label: "Status" },
  { id: "subject", label: "Assunto (A–Z)" },
];

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function priorityRank(label: string): number {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("muito alta") || normalized.includes("crítica") || normalized.includes("critica")) return 0;
  if (normalized.includes("alta") || normalized.includes("high") || normalized.includes("urgent")) return 1;
  if (normalized.includes("média") || normalized.includes("media") || normalized.includes("medium")) return 2;
  if (normalized.includes("baixa") || normalized.includes("low")) return 3;
  if (normalized.includes("muito baixa")) return 4;
  return 5;
}

function sortTickets(items: HelpDeskTicketListItemDto[], sort: SortKey): HelpDeskTicketListItemDto[] {
  const next = [...items];
  next.sort((a, b) => {
    switch (sort) {
      case "createdAtAsc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "priority": {
        const byPriority = priorityRank(a.priorityLabel) - priorityRank(b.priorityLabel);
        if (byPriority !== 0) return byPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      case "status": {
        const byStatus = a.statusLabel.localeCompare(b.statusLabel, "pt-BR");
        if (byStatus !== 0) return byStatus;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      case "subject":
        return a.subject.localeCompare(b.subject, "pt-BR");
      case "createdAtDesc":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return next;
}

export function HelpDeskTicketListPanel({ canViewAllTickets = false }: Props) {
  const [view, setView] = useState<TicketView>("mine");
  const [sort, setSort] = useState<SortKey>("createdAtDesc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [detailTicket, setDetailTicket] = useState<HelpDeskTicketListItemDto | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const mineQuery = useHelpDeskTickets(view === "mine", SCOPE);
  const allQuery = useHelpDeskAllTickets(view === "all" && canViewAllTickets, SCOPE);
  const ticketsQuery = view === "all" ? allQuery : mineQuery;

  const sorted = useMemo(
    () => sortTickets(ticketsQuery.data ?? [], sort),
    [ticketsQuery.data, sort],
  );

  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);
  const hasMore = sorted.length > visibleCount;
  const showRequester = view === "all";

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [view, sort, ticketsQuery.data]);

  useEffect(() => {
    const node = loadMoreRef.current;
    const root = node?.closest(".hd-ticket-list__table-wrap") ?? null;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { root, rootMargin: "120px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, visible.length]);

  return (
    <>
      <section className="hd-ticket-list" aria-label="Lista de chamados">
        <div className="hd-ticket-list__head">
          <div>
            <h2 className="hd-ticket-list__title">Chamados</h2>
            <p className="hd-ticket-list__subtitle">
              {ticketsQuery.isLoading
                ? "Carregando chamados…"
                : `${sorted.length} chamado${sorted.length === 1 ? "" : "s"} (últimos 90 dias)`}
            </p>
          </div>

          <div className="hd-ticket-list__controls">
            {canViewAllTickets ? (
              <div className="hd-track__view-toggle" role="tablist" aria-label="Visão dos chamados">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "mine"}
                  className={`filter-chip${view === "mine" ? " is-active" : ""}`}
                  onClick={() => {
                    setView("mine");
                    setDetailTicket(null);
                  }}
                >
                  Meus chamados
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "all"}
                  className={`filter-chip${view === "all" ? " is-active" : ""}`}
                  onClick={() => {
                    setView("all");
                    setDetailTicket(null);
                  }}
                >
                  Fila completa
                </button>
              </div>
            ) : null}

            <label className="hd-ticket-list__sort">
              <span className="hd-ticket-list__sort-label">Ordenar</span>
              <select
                value={sort}
                aria-label="Ordenar chamados"
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {ticketsQuery.isError ? (
          <p className="page-empty-note" role="alert">
            Não foi possível carregar os chamados.
          </p>
        ) : null}

        {!ticketsQuery.isLoading && !ticketsQuery.isError && sorted.length === 0 ? (
          <p className="page-empty-note">
            {view === "all"
              ? "Nenhum chamado encontrado na fila (últimos 90 dias)."
              : "Nenhum chamado encontrado nos últimos 90 dias."}
          </p>
        ) : null}

        {visible.length > 0 ? (
          <div className="hd-ticket-list__table-wrap" data-testid="hd-ticket-list-scroll">
            <table className="pay-table hd-track__table hd-ticket-list__table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Assunto</th>
                  {showRequester ? <th>Solicitante</th> : null}
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Abertura</th>
                  <th className="hd-track__actions-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((ticket) => (
                  <tr key={ticket.ticketId} data-ticket-id={ticket.ticketId}>
                    <td>#{ticket.ticketId}</td>
                    <td>{ticket.subject}</td>
                    {showRequester ? <td>{ticket.requesterLabel ?? "—"}</td> : null}
                    <td>{ticket.priorityLabel}</td>
                    <td>
                      <HelpDeskTicketStatusChip status={ticket.status} label={ticket.statusLabel} />
                    </td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td className="hd-track__actions-col">
                      <button
                        type="button"
                        className="hd-track__view-btn"
                        aria-label={`Visualizar chamado #${ticket.ticketId}`}
                        title="Visualizar detalhes"
                        onClick={() => setDetailTicket(ticket)}
                      >
                        <i className="fa-solid fa-eye" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore ? (
              <div ref={loadMoreRef} className="hd-ticket-list__sentinel" aria-hidden="true">
                <span className="hd-ticket-list__sentinel-text">Carregando mais…</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {ticketsQuery.isLoading ? (
          <p className="page-empty-note" aria-live="polite">
            Carregando chamados…
          </p>
        ) : null}

        {!hasMore && sorted.length > 0 ? (
          <p className="page-empty-note">
            Exibindo {visible.length} de {sorted.length} chamado{sorted.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </section>

      <HelpDeskTicketDetailModal
        open={detailTicket !== null}
        ticketId={detailTicket?.ticketId ?? null}
        preview={detailTicket}
        showRequester={showRequester}
        onClose={() => setDetailTicket(null)}
      />
    </>
  );
}
