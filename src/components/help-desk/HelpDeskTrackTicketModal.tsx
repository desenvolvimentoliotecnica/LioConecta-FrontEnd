import { useMemo, useState } from "react";
import { useHelpDeskTicketDetail, useHelpDeskTickets } from "../../api/hooks/useHelpDesk";
import type { ServiceRequestDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

const STATUS_LABELS: Record<string, string> = {
  Draft: "Rascunho",
  Submitted: "Enviado",
  InReview: "Em análise",
  Approved: "Aprovado",
  Rejected: "Rejeitado",
  Completed: "Concluído",
  Cancelled: "Cancelado",
};

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function payloadText(ticket: ServiceRequestDto, key: string): string {
  const value = ticket.payload[key];
  return value != null ? String(value) : "—";
}

export function HelpDeskTrackTicketModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ticketsQuery = useHelpDeskTickets(open);
  const detailQuery = useHelpDeskTicketDetail(selectedId, open && selectedId !== null);

  const filtered = useMemo(() => {
    const items = ticketsQuery.data ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((ticket) => {
      const subject = payloadText(ticket, "subject").toLowerCase();
      const ref = (ticket.externalRef ?? "").toLowerCase();
      return subject.includes(normalized) || ref.includes(normalized) || ticket.id.includes(normalized);
    });
  }, [ticketsQuery.data, query]);

  const handleClose = () => {
    setQuery("");
    setSelectedId(null);
    onClose();
  };

  return (
    <ContrachequeModal
      open={open}
      title="Acompanhar ticket"
      wide
      onClose={handleClose}
      footer={
        <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
          Fechar
        </button>
      }
    >
      <div className="hd-track">
        <label className="hd-modal-form__field hd-modal-form__field--search">
          <span className="hd-modal-form__label">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar chamado
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Protocolo, assunto ou ID"
          />
        </label>

        {ticketsQuery.isLoading ? <p>Carregando chamados…</p> : null}
        {ticketsQuery.isError ? (
          <p className="hd-modal__error" role="alert">
            Não foi possível carregar seus chamados.
          </p>
        ) : null}

        {!ticketsQuery.isLoading && filtered.length === 0 ? (
          <p className="hd-modal__empty">Nenhum chamado encontrado nos últimos 90 dias.</p>
        ) : null}

        {filtered.length > 0 ? (
          <table className="pay-table hd-track__table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Assunto</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Abertura</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={selectedId === ticket.id ? "is-selected" : undefined}
                  onClick={() => setSelectedId(ticket.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{ticket.externalRef ? `#${ticket.externalRef}` : ticket.id.slice(0, 8)}</td>
                  <td>{payloadText(ticket, "subject")}</td>
                  <td>{payloadText(ticket, "priority")}</td>
                  <td>{STATUS_LABELS[ticket.status] ?? ticket.status}</td>
                  <td>{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {selectedId && detailQuery.data ? (
          <div className="hd-track__detail">
            <h3 className="hd-modal__section-title">
              <i className="fa-solid fa-circle-info" aria-hidden="true" /> Detalhes
            </h3>
            <dl className="hd-track__meta">
              <div>
                <dt>Assunto</dt>
                <dd>{payloadText(detailQuery.data, "subject")}</dd>
              </div>
              <div>
                <dt>Descrição</dt>
                <dd>{payloadText(detailQuery.data, "description")}</dd>
              </div>
              <div>
                <dt>Equipe</dt>
                <dd>{detailQuery.data.assigneeTeam ?? "TI — Service Desk"}</dd>
              </div>
            </dl>
            {detailQuery.data.events.length > 0 ? (
              <>
                <h3 className="hd-modal__section-title">
                  <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> Histórico
                </h3>
                <ul className="hd-track__events">
                  {detailQuery.data.events.map((event) => (
                    <li key={event.id}>
                      <strong>{event.eventType}</strong>
                      <span>{formatDate(event.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
