import { useEffect, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import {
  downloadLeaveManagementAttachment,
  fetchLeaveManagementAttachmentBlob,
} from "../../api/hooks/useLeave";
import type { LeaveAttachmentMetaDto } from "../../api/types";

type Props = {
  open: boolean;
  recordId: string;
  attachment: LeaveAttachmentMetaDto | null;
  onClose: () => void;
};

function isPdf(attachment: LeaveAttachmentMetaDto): boolean {
  return (
    attachment.contentType.toLowerCase().includes("pdf") ||
    attachment.fileName.toLowerCase().endsWith(".pdf")
  );
}

function isPng(attachment: LeaveAttachmentMetaDto): boolean {
  return (
    attachment.contentType.toLowerCase().includes("png") ||
    attachment.fileName.toLowerCase().endsWith(".png")
  );
}

export function LeaveAttachmentViewerModal({ open, recordId, attachment, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !attachment) {
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
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    void (async () => {
      try {
        const blob = await fetchLeaveManagementAttachmentBlob(recordId, attachment.storageFileName);
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o anexo.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open, recordId, attachment]);

  const handleDownload = async () => {
    if (!attachment) return;
    setDownloading(true);
    try {
      await downloadLeaveManagementAttachment(
        recordId,
        attachment.storageFileName,
        attachment.fileName,
      );
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
            disabled={!attachment || downloading}
            onClick={() => void handleDownload()}
          >
            Baixar
          </button>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <div className="leave-attachment-viewer" data-testid="leave-attachment-viewer">
        {loading ? <p className="leave-attachment-viewer__state">Carregando anexo…</p> : null}
        {error ? (
          <p className="leave-attachment-viewer__state leave-attachment-viewer__state--error" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && objectUrl && attachment && isPng(attachment) ? (
          <img
            className="leave-attachment-viewer__img"
            src={objectUrl}
            alt={attachment.fileName}
          />
        ) : null}
        {!loading && !error && objectUrl && attachment && isPdf(attachment) ? (
          <iframe
            className="leave-attachment-viewer__pdf"
            title={attachment.fileName}
            src={objectUrl}
          />
        ) : null}
        {!loading &&
        !error &&
        objectUrl &&
        attachment &&
        !isPdf(attachment) &&
        !isPng(attachment) ? (
          <p className="leave-attachment-viewer__state">
            Pré-visualização indisponível para este tipo. Use Baixar.
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
