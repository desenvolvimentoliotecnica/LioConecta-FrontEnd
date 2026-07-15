import { useEffect, useMemo, useState } from "react";
import {
  useHelpDeskAllTickets,
  useHelpDeskAssignedTickets,
  useHelpDeskTickets,
} from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketListItemDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { HelpDeskTicketDetailModal } from "./HelpDeskTicketDetailModal";
import { HelpDeskTicketStatusChip } from "./HelpDeskTicketStatusChip";

type TicketView = "mine" | "assigned" | "all";

type Props = {
  open: boolean;
  canViewAllTickets?: boolean;
  isTechnician?: boolean;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function modalTitle(view: TicketView): string {
  switch (view) {
    case "assigned":
      return "Atribuídos a mim";
    case "all":
      return "Fila completa GLPI";
    default:
      return "Acompanhar ticket";
  }
}

export function HelpDeskTrackTicketModal({
  open,
  canViewAllTickets = false,
  isTechnician = false,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<TicketView>("mine");
  const [detailTicket, setDetailTicket] = useState<HelpDeskTicketListItemDto | null>(null);
  const scope = "all";
  const technician = isTechnician || canViewAllTickets;

  useEffect(() => {
    if (!technician && view !== "mine") {
      setView("mine");
      setDetailTicket(null);
    }
  }, [technician, view]);

  const mineQuery = useHelpDeskTickets(open && view === "mine", scope);
  const assignedQuery = useHelpDeskAssignedTickets(open && view === "assigned" && technician, scope);
  const allQuery = useHelpDeskAllTickets(open && view === "all" && technician, scope);
  const ticketsQuery =
    view === "assigned" ? assignedQuery : view === "all" ? allQuery : mineQuery;

  const filtered = useMemo(() => {
    const items = ticketsQuery.data ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((ticket) => {
      const subject = ticket.subject.toLowerCase();
      const ref = ticket.ticketId.toLowerCase();
      const requester = (ticket.requesterLabel ?? "").toLowerCase();
      return subject.includes(normalized) || ref.includes(normalized) || requester.includes(normalized);
    });
  }, [ticketsQuery.data, query]);

  const handleClose = () => {
    setQuery("");
    setDetailTicket(null);
    setView("mine");
    onClose();
  };

  const showRequester = view !== "mine";

  return (
    <>
      <ContrachequeModal
        open={open}
        title={modalTitle(view)}
        wide
        closeOnEscape={detailTicket === null}
        onClose={handleClose}
        footer={
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
            Fechar
          </button>
        }
      >
        <div className="hd-track">
          {technician ? (
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
                aria-selected={view === "assigned"}
                className={`filter-chip${view === "assigned" ? " is-active" : ""}`}
                onClick={() => {
                  setView("assigned");
                  setDetailTicket(null);
                }}
              >
                Atribuídos a mim
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

          <label className="hd-modal-form__field hd-modal-form__field--search">
            <span className="hd-modal-form__label">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar chamado
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={showRequester ? "Protocolo, assunto ou solicitante" : "Protocolo ou assunto"}
            />
          </label>

          {ticketsQuery.isLoading ? <p>Carregando chamados…</p> : null}
          {ticketsQuery.isError ? (
            <p className="hd-modal__error" role="alert">
              Não foi possível carregar os chamados.
            </p>
          ) : null}

          {!ticketsQuery.isLoading && filtered.length === 0 ? (
            <p className="hd-modal__empty">
              {view === "all"
                ? "Nenhum chamado encontrado na fila."
                : view === "assigned"
                  ? "Nenhum chamado atribuído a você."
                  : "Nenhum chamado encontrado."}
            </p>
          ) : null}

          {filtered.length > 0 ? (
            <table className="pay-table hd-track__table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Assunto</th>
                  {showRequester ? <th>Solicitante</th> : null}
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Atribuído a</th>
                  <th>Abertura</th>
                  <th className="hd-track__actions-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket: HelpDeskTicketListItemDto) => {
                  const showAssignee =
                    ticket.status === "2" ||
                    ticket.status === "3" ||
                    ticket.status === "5" ||
                    ticket.status === "6";
                  const assignee =
                    showAssignee && ticket.assigneeLabel?.trim() ? ticket.assigneeLabel.trim() : "—";
                  return (
                  <tr key={ticket.ticketId}>
                    <td>#{ticket.ticketId}</td>
                    <td>{ticket.subject}</td>
                    {showRequester ? <td>{ticket.requesterLabel ?? "—"}</td> : null}
                    <td>{ticket.priorityLabel}</td>
                    <td>
                      <HelpDeskTicketStatusChip status={ticket.status} label={ticket.statusLabel} />
                    </td>
                    <td>{assignee}</td>
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
                  );
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      </ContrachequeModal>

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
