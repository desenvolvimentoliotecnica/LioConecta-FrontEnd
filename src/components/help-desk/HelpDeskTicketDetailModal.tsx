import { useEffect, useState } from "react";
import {
  downloadHelpDeskTicketAttachment,
  fetchHelpDeskTicketAttachmentBlob,
  useHelpDeskTicketDetail,
} from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketAttachmentDto, HelpDeskTicketListItemDto } from "../../api/types";
import { ImageLightbox } from "../feed/ImageLightbox";
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

function formatSize(bytes?: number | null): string | null {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(attachment: HelpDeskTicketAttachmentDto): boolean {
  const ct = (attachment.contentType ?? "").toLowerCase();
  const name = attachment.fileName.toLowerCase();
  return (
    ct.includes("png") ||
    ct.includes("jpeg") ||
    ct.includes("jpg") ||
    ct.includes("gif") ||
    ct.includes("webp") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".gif") ||
    name.endsWith(".webp")
  );
}

function attachmentIconClass(attachment: HelpDeskTicketAttachmentDto): string {
  if (isImageAttachment(attachment)) return "fa-file-image";
  const name = attachment.fileName.toLowerCase();
  const ct = (attachment.contentType ?? "").toLowerCase();
  if (ct.includes("pdf") || name.endsWith(".pdf")) return "fa-file-pdf";
  return "fa-paperclip";
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
  const attachments = detail?.attachments ?? [];
  const isLoadingDetail = detailQuery.isLoading || (detailQuery.isFetching && !detail);

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLightbox((current) => {
        if (current?.src.startsWith("blob:")) URL.revokeObjectURL(current.src);
        return null;
      });
      setPreviewLoadingId(null);
      setDownloadLoadingId(null);
    }
  }, [open]);

  const title = ticketId ? `Chamado #${ticketId}` : "Detalhes do chamado";
  const externalUrl = summary?.externalUrl;

  const openLightbox = async (attachment: HelpDeskTicketAttachmentDto) => {
    if (!ticketId) return;
    setPreviewLoadingId(attachment.documentId);
    try {
      const blob = await fetchHelpDeskTicketAttachmentBlob(ticketId, attachment.documentId);
      const src = URL.createObjectURL(blob);
      setLightbox((current) => {
        if (current?.src.startsWith("blob:")) URL.revokeObjectURL(current.src);
        return { src, alt: attachment.fileName };
      });
    } catch {
      // toast handled by API layer where available; keep silent fallback
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const handleDownload = async (attachment: HelpDeskTicketAttachmentDto) => {
    if (!ticketId) return;
    setDownloadLoadingId(attachment.documentId);
    try {
      await downloadHelpDeskTicketAttachment(ticketId, attachment.documentId, attachment.fileName);
    } finally {
      setDownloadLoadingId(null);
    }
  };

  return (
    <>
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
        {isLoadingDetail ? (
          <div className="hd-ticket-detail__loading" role="status" aria-live="polite">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            <span>Carregando detalhes…</span>
          </div>
        ) : null}

        {detailQuery.isError ? (
          <p className="hd-modal__error" role="alert">
            Não foi possível carregar os detalhes do chamado.
          </p>
        ) : null}

        {!isLoadingDetail && summary ? (
          <div className="hd-ticket-detail">
            <dl className="hd-track__meta hd-ticket-detail__grid hd-ticket-detail__meta--inline">
              <div>
                <dt>Protocolo:</dt>
                <dd>#{summary.ticketId}</dd>
              </div>
              <div>
                <dt>Status:</dt>
                <dd>
                  <HelpDeskTicketStatusChip status={summary.status} label={summary.statusLabel} />
                </dd>
              </div>
              <div className="hd-ticket-detail__full">
                <dt>Assunto:</dt>
                <dd>{summary.subject}</dd>
              </div>
              {showRequester && summary.requesterLabel ? (
                <div>
                  <dt>Solicitante:</dt>
                  <dd>{summary.requesterLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt>Prioridade:</dt>
                <dd>{summary.priorityLabel}</dd>
              </div>
              <div>
                <dt>Abertura:</dt>
                <dd>{formatDate(summary.createdAt)}</dd>
              </div>
              {detail ? (
                <>
                  <div className="hd-ticket-detail__full">
                    <dt>Descrição:</dt>
                    <dd>
                      <HelpDeskTicketDescription value={detail.description} />
                    </dd>
                  </div>
                  <div>
                    <dt>Equipe:</dt>
                    <dd>{detail.assignee ?? "TI — Service Desk"}</dd>
                  </div>
                </>
              ) : null}
            </dl>

            {attachments.length > 0 ? (
              <section className="hd-ticket-attachments" aria-label="Anexos do chamado">
                <h3 className="hd-modal__section-title">
                  <i className="fa-solid fa-paperclip" aria-hidden="true" /> Anexos
                </h3>
                <ul className="hd-ticket-attachments__list">
                  {attachments.map((attachment) => {
                    const sizeLabel = formatSize(attachment.sizeBytes);
                    const canPreview = isImageAttachment(attachment);
                    return (
                      <li key={attachment.documentId} className="hd-ticket-attachments__item">
                        <div className="hd-ticket-attachments__meta">
                          <i
                            className={`fa-solid ${attachmentIconClass(attachment)}`}
                            aria-hidden="true"
                          />
                          <div>
                            <span className="hd-ticket-attachments__name">{attachment.fileName}</span>
                            {sizeLabel ? (
                              <span className="hd-ticket-attachments__size">{sizeLabel}</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="hd-ticket-attachments__actions">
                          {canPreview ? (
                            <button
                              type="button"
                              className="hd-track__view-btn"
                              title="Visualizar"
                              aria-label={`Visualizar ${attachment.fileName}`}
                              disabled={previewLoadingId === attachment.documentId}
                              onClick={() => void openLightbox(attachment)}
                            >
                              <i
                                className={`fa-solid ${
                                  previewLoadingId === attachment.documentId
                                    ? "fa-spinner fa-spin"
                                    : "fa-eye"
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="hd-track__view-btn"
                            title="Baixar"
                            aria-label={`Baixar ${attachment.fileName}`}
                            disabled={downloadLoadingId === attachment.documentId}
                            onClick={() => void handleDownload(attachment)}
                          >
                            <i
                              className={`fa-solid ${
                                downloadLoadingId === attachment.documentId
                                  ? "fa-spinner fa-spin"
                                  : "fa-download"
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

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

      {lightbox ? (
        <ImageLightbox
          open
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => {
            setLightbox((current) => {
              if (current?.src.startsWith("blob:")) URL.revokeObjectURL(current.src);
              return null;
            });
          }}
        />
      ) : null}
    </>
  );
}
