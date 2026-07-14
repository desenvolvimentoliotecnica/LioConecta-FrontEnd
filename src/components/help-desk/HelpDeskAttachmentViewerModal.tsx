import { useEffect, useState } from "react";
import {
  downloadHelpDeskTicketAttachment,
  fetchHelpDeskTicketAttachmentBlob,
} from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketAttachmentDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  ticketId: string | null;
  attachment: HelpDeskTicketAttachmentDto | null;
  onClose: () => void;
};

function isPdf(attachment: HelpDeskTicketAttachmentDto): boolean {
  const ct = (attachment.contentType ?? "").toLowerCase();
  const name = attachment.fileName.toLowerCase();
  return ct.includes("pdf") || name.endsWith(".pdf");
}

function isImage(attachment: HelpDeskTicketAttachmentDto): boolean {
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

export function HelpDeskAttachmentViewerModal({ open, ticketId, attachment, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !attachment || !ticketId) {
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    setLoading(true);
    setError(null);
    void fetchHelpDeskTicketAttachmentBlob(ticketId, attachment.documentId)
      .then((blob) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar o anexo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open, ticketId, attachment]);

  const handleDownload = async () => {
    if (!attachment || !ticketId) return;
    setDownloading(true);
    try {
      await downloadHelpDeskTicketAttachment(ticketId, attachment.documentId, attachment.fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ContrachequeModal
      open={open && attachment !== null}
      title={attachment?.fileName ?? "Anexo"}
      wide
      stacked
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={!attachment || downloading || loading}
            onClick={() => void handleDownload()}
          >
            {downloading ? "Baixando…" : "Baixar"}
          </button>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <div className="hd-attachment-viewer">
        {loading ? (
          <div className="hd-ticket-detail__loading" role="status" aria-live="polite">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            <span>Carregando anexo…</span>
          </div>
        ) : null}
        {error ? (
          <p className="hd-modal__error" role="alert">
            {error}
          </p>
        ) : null}
        {objectUrl && attachment && isPdf(attachment) ? (
          <iframe title={attachment.fileName} src={objectUrl} className="hd-attachment-viewer__pdf" />
        ) : null}
        {objectUrl && attachment && isImage(attachment) ? (
          <img src={objectUrl} alt={attachment.fileName} className="hd-attachment-viewer__img" />
        ) : null}
        {objectUrl && attachment && !isPdf(attachment) && !isImage(attachment) ? (
          <p className="hd-attachment-viewer__fallback">
            Pré-visualização indisponível para este tipo. Use Baixar.
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
