import { useHelpDeskTicketDetail } from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketListItemDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { HelpDeskTicketDescription } from "./HelpDeskTicketDescription";
import { HelpDeskTicketStatusChip } from "./HelpDeskTicketStatusChip";

type Props = {
  open: boolean;
  ticketId: string | null;
  preview?: HelpDeskTicketListItemDto | null;
  showRequester?: boolean;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

export function HelpDeskTicketDetailModal({
  open,
  ticketId,
  preview,
  showRequester = false,
  onClose,
}: Props) {
  const detailQuery = useHelpDeskTicketDetail(ticketId, open && ticketId !== null);
  const detail = detailQuery.data;
  const summary = detail?.summary ?? preview;

  const title = ticketId ? `Chamado #${ticketId}` : "Detalhes do chamado";

  const externalUrl = summary?.externalUrl;

  return (
    <ContrachequeModal
      open={open}
      title={title}
      wide
      stacked
      onClose={onClose}
      footer={
        <>
          {externalUrl ? (
            <a
              className="pay-modal__btn pay-modal__btn--ghost"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Ver no GLPI
            </a>
          ) : null}
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      {detailQuery.isLoading && !summary ? <p>Carregando detalhes…</p> : null}
      {detailQuery.isError ? (
        <p className="hd-modal__error" role="alert">
          Não foi possível carregar os detalhes do chamado.
        </p>
      ) : null}

      {summary ? (
        <div className="hd-ticket-detail">
          <dl className="hd-track__meta hd-ticket-detail__grid">
            <div>
              <dt>Protocolo</dt>
              <dd>#{summary.ticketId}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <HelpDeskTicketStatusChip status={summary.status} label={summary.statusLabel} />
              </dd>
            </div>
            <div className="hd-ticket-detail__full">
              <dt>Assunto</dt>
              <dd>{summary.subject}</dd>
            </div>
            {showRequester && summary.requesterLabel ? (
              <div>
                <dt>Solicitante</dt>
                <dd>{summary.requesterLabel}</dd>
              </div>
            ) : null}
            <div>
              <dt>Prioridade</dt>
              <dd>{summary.priorityLabel}</dd>
            </div>
            <div>
              <dt>Abertura</dt>
              <dd>{formatDate(summary.createdAt)}</dd>
            </div>
            {detail ? (
              <>
                <div className="hd-ticket-detail__full">
                  <dt>Descrição</dt>
                  <dd>
                    <HelpDeskTicketDescription value={detail.description} />
                  </dd>
                </div>
                <div>
                  <dt>Equipe</dt>
                  <dd>{detail.assignee ?? "TI — Service Desk"}</dd>
                </div>
              </>
            ) : null}
          </dl>

          {detail && detail.events.length > 0 ? (
            <>
              <h3 className="hd-modal__section-title">
                <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" /> Histórico
              </h3>
              <ul className="hd-track__events">
                {detail.events.map((event, index) => (
                  <li key={`${event.createdAt}-${index}`}>
                    <strong>{event.eventType}</strong>
                    {event.author ? <span> — {event.author}</span> : null}
                    <span>{formatDate(event.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </ContrachequeModal>
  );
}
