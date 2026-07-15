import { useEffect, useMemo, useRef, useState } from "react";
import {
  useHelpDeskAllTickets,
  useHelpDeskAssignedTickets,
  useHelpDeskSummary,
  useHelpDeskTickets,
} from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketListItemDto } from "../../api/types";
import { HelpDeskTicketDetailModal } from "./HelpDeskTicketDetailModal";
import { HelpDeskTicketStatusChip } from "./HelpDeskTicketStatusChip";
import { helpDeskPriorityModifier } from "./helpDeskPriority";

const PAGE_SIZE = 15;
const SCOPE = "all";
const SUBJECT_MAX = 22;

type TicketView = "mine" | "assigned" | "all";
type SortColumn = "ticketId" | "subject" | "requester" | "priority" | "status" | "assignee" | "createdAt";
type SortDir = "asc" | "desc";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s([{/'-])(\S)/g, (_, prefix: string, char: string) => prefix + char.toLocaleUpperCase("pt-BR"));
}

function showsAssignee(status: string): boolean {
  return status === "2" || status === "3" || status === "5" || status === "6";
}

function formatAssignee(ticket: HelpDeskTicketListItemDto): string {
  if (!showsAssignee(ticket.status)) return "—";
  const label = ticket.assigneeLabel?.trim();
  return label ? toTitleCase(label) : "—";
}

function truncateSubject(value: string): { text: string; full: string } {
  const full = value.trim();
  if (full.length <= SUBJECT_MAX) return { text: full, full };
  return { text: `${full.slice(0, SUBJECT_MAX).trimEnd()}…`, full };
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

function defaultStatusRank(status: string): number {
  switch (status) {
    case "4":
      return 0;
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "10":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    default:
      return 7;
  }
}

function compareCreatedAtAsc(a: HelpDeskTicketListItemDto, b: HelpDeskTicketListItemDto): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function sortTickets(
  items: HelpDeskTicketListItemDto[],
  column: SortColumn | null,
  direction: SortDir,
): HelpDeskTicketListItemDto[] {
  const next = [...items];
  const dir = direction === "asc" ? 1 : -1;

  next.sort((a, b) => {
    if (!column) {
      const byStatus = defaultStatusRank(a.status) - defaultStatusRank(b.status);
      if (byStatus !== 0) return byStatus;
      return compareCreatedAtAsc(a, b);
    }

    let result = 0;
    switch (column) {
      case "ticketId":
        result = Number(a.ticketId) - Number(b.ticketId);
        if (Number.isNaN(result)) result = a.ticketId.localeCompare(b.ticketId, "pt-BR");
        break;
      case "subject":
        result = a.subject.localeCompare(b.subject, "pt-BR");
        break;
      case "requester":
        result = (a.requesterLabel ?? "").localeCompare(b.requesterLabel ?? "", "pt-BR");
        break;
      case "priority":
        result = priorityRank(a.priorityLabel) - priorityRank(b.priorityLabel);
        break;
      case "status":
        result = defaultStatusRank(a.status) - defaultStatusRank(b.status);
        break;
      case "assignee":
        result = formatAssignee(a).localeCompare(formatAssignee(b), "pt-BR");
        break;
      case "createdAt":
        result = compareCreatedAtAsc(a, b);
        break;
      default:
        result = 0;
    }

    if (result === 0 && column !== "createdAt") {
      result = compareCreatedAtAsc(a, b);
    }
    return result * dir;
  });

  return next;
}

function matchesTicketSearch(ticket: HelpDeskTicketListItemDto, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    ticket.ticketId,
    `#${ticket.ticketId}`,
    ticket.subject,
    ticket.requesterLabel ?? "",
    ticket.assigneeLabel ?? "",
    ticket.status,
    ticket.statusLabel,
    ticket.priorityLabel,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function SortHeader({
  label,
  column,
  activeColumn,
  direction,
  align = "center",
  onSort,
}: {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn | null;
  direction: SortDir;
  align?: "left" | "center";
  onSort: (column: SortColumn) => void;
}) {
  const active = activeColumn === column;
  return (
    <th
      className={`hd-ticket-list__th hd-ticket-list__th--${align} hd-ticket-list__col--${column}${active ? " is-sorted" : ""}`}
    >
      <button
        type="button"
        className="hd-ticket-list__sort-btn"
        aria-label={`Ordenar por ${label}`}
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <i
          className={`fa-solid ${
            active ? (direction === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"
          }`}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

export function HelpDeskTicketListPanel() {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [detailTicket, setDetailTicket] = useState<HelpDeskTicketListItemDto | null>(null);
  const [view, setView] = useState<TicketView>("mine");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const summaryQuery = useHelpDeskSummary();
  const isTechnician =
    summaryQuery.data?.isTechnician === true || summaryQuery.data?.canViewAllTickets === true;

  useEffect(() => {
    if (!isTechnician && view !== "mine") {
      setView("mine");
      setDetailTicket(null);
    }
  }, [isTechnician, view]);

  const mineQuery = useHelpDeskTickets(view === "mine", SCOPE);
  const assignedQuery = useHelpDeskAssignedTickets(view === "assigned" && isTechnician, SCOPE);
  const allQuery = useHelpDeskAllTickets(view === "all" && isTechnician, SCOPE);
  const ticketsQuery =
    view === "assigned" ? assignedQuery : view === "all" ? allQuery : mineQuery;

  const showRequester = view !== "mine";

  const filtered = useMemo(() => {
    const items = ticketsQuery.data ?? [];
    if (!search.trim()) return items;
    return items.filter((ticket) => matchesTicketSearch(ticket, search));
  }, [ticketsQuery.data, search]);

  const sorted = useMemo(() => sortTickets(filtered, sortColumn, sortDir), [filtered, sortColumn, sortDir]);

  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);
  const hasMore = sorted.length > visibleCount;
  const totalLoaded = ticketsQuery.data?.length ?? 0;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortColumn, sortDir, search, ticketsQuery.data, view]);

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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(column);
    setSortDir(column === "createdAt" || column === "priority" ? "desc" : "asc");
  };

  const selectView = (next: TicketView) => {
    setView(next);
    setDetailTicket(null);
    setSearch("");
  };

  return (
    <>
      <section className="hd-ticket-list" aria-label="Lista de chamados">
        <div className="hd-ticket-list__head">
          <div>
            <h2 className="hd-ticket-list__title">Chamados</h2>
            <p className="hd-ticket-list__subtitle">
              {ticketsQuery.isLoading
                ? "Carregando chamados…"
                : search.trim()
                  ? `${sorted.length} de ${totalLoaded} chamado${totalLoaded === 1 ? "" : "s"}`
                  : `${sorted.length} chamado${sorted.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="hd-ticket-list__controls">
            <label className="hd-ticket-list__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={search}
                placeholder="Buscar chamado…"
                aria-label="Buscar chamados por número, assunto, solicitante ou status"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="hd-track__view-toggle" role="tablist" aria-label="Visão dos chamados">
              <button
                type="button"
                role="tab"
                aria-selected={view === "mine"}
                className={`filter-chip${view === "mine" ? " is-active" : ""}`}
                onClick={() => selectView("mine")}
              >
                Meus chamados
              </button>
              {isTechnician ? (
                <>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === "assigned"}
                    className={`filter-chip${view === "assigned" ? " is-active" : ""}`}
                    onClick={() => selectView("assigned")}
                  >
                    Atribuídos a mim
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === "all"}
                    className={`filter-chip${view === "all" ? " is-active" : ""}`}
                    onClick={() => selectView("all")}
                  >
                    Fila completa
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {ticketsQuery.isError ? (
          <p className="page-empty-note" role="alert">
            Não foi possível carregar os chamados.
          </p>
        ) : null}

        {!ticketsQuery.isLoading && !ticketsQuery.isError && sorted.length === 0 ? (
          <p className="page-empty-note">
            {search.trim()
              ? "Nenhum chamado corresponde à busca."
              : "Nenhum chamado encontrado."}
          </p>
        ) : null}

        {visible.length > 0 ? (
          <div className="hd-ticket-list__table-wrap" data-testid="hd-ticket-list-scroll">
            <table className="pay-table hd-track__table hd-ticket-list__table">
              <thead>
                <tr>
                  <SortHeader
                    label="Protocolo"
                    column="ticketId"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Assunto"
                    column="subject"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    align="left"
                    onSort={handleSort}
                  />
                  {showRequester ? (
                    <SortHeader
                      label="Solicitante"
                      column="requester"
                      activeColumn={sortColumn}
                      direction={sortDir}
                      align="left"
                      onSort={handleSort}
                    />
                  ) : null}
                  <SortHeader
                    label="Prioridade"
                    column="priority"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Status"
                    column="status"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Atribuído a"
                    column="assignee"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    align="left"
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Abertura"
                    column="createdAt"
                    activeColumn={sortColumn}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <th className="hd-track__actions-col hd-ticket-list__th hd-ticket-list__th--center hd-ticket-list__col--actions">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((ticket) => {
                  const subject = truncateSubject(ticket.subject);
                  const assignee = formatAssignee(ticket);
                  return (
                    <tr key={ticket.ticketId} data-ticket-id={ticket.ticketId}>
                      <td className="hd-ticket-list__td hd-ticket-list__td--center hd-ticket-list__col--ticketId">
                        <span className="hd-ticket-list__cell">#{ticket.ticketId}</span>
                      </td>
                      <td className="hd-ticket-list__td hd-ticket-list__td--subject hd-ticket-list__col--subject" title={subject.full}>
                        <span className="hd-ticket-list__subject">{subject.text}</span>
                      </td>
                      {showRequester ? (
                        <td className="hd-ticket-list__td hd-ticket-list__col--requester">
                          {ticket.requesterLabel?.trim() ? toTitleCase(ticket.requesterLabel) : "—"}
                        </td>
                      ) : null}
                      <td className="hd-ticket-list__td hd-ticket-list__td--center hd-ticket-list__col--priority">
                        <span className="hd-ticket-list__cell">
                          <span
                            className={`hd-ticket-priority hd-ticket-priority--${helpDeskPriorityModifier(ticket.priorityLabel)}`}
                          >
                            {ticket.priorityLabel}
                          </span>
                        </span>
                      </td>
                      <td className="hd-ticket-list__td hd-ticket-list__td--center hd-ticket-list__col--status">
                        <span className="hd-ticket-list__cell">
                          <HelpDeskTicketStatusChip status={ticket.status} label={ticket.statusLabel} />
                        </span>
                      </td>
                      <td
                        className="hd-ticket-list__td hd-ticket-list__td--assignee hd-ticket-list__col--assignee"
                        title={assignee !== "—" ? assignee : undefined}
                      >
                        {assignee}
                      </td>
                      <td className="hd-ticket-list__td hd-ticket-list__td--center hd-ticket-list__td--date hd-ticket-list__col--createdAt">
                        <span className="hd-ticket-list__cell">{formatDate(ticket.createdAt)}</span>
                      </td>
                      <td className="hd-track__actions-col hd-ticket-list__td hd-ticket-list__td--center hd-ticket-list__col--actions">
                        <span className="hd-ticket-list__cell">
                          <button
                            type="button"
                            className="hd-track__view-btn"
                            aria-label={`Visualizar chamado #${ticket.ticketId}`}
                            title="Visualizar detalhes"
                            onClick={() => setDetailTicket(ticket)}
                          >
                            <i className="fa-solid fa-eye" aria-hidden="true" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
