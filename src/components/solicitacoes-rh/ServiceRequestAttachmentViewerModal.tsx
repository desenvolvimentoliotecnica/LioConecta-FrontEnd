import { useEffect, useState } from "react";
import {
  downloadServiceRequestAttachment,
  fetchServiceRequestAttachmentBlob,
} from "../../api/hooks/useServiceRequests";
import type { ServiceRequestAttachmentMetaDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  requestId: string;
  attachment: ServiceRequestAttachmentMetaDto | null;
  onClose: () => void;
};

function isPdf(attachment: ServiceRequestAttachmentMetaDto): boolean {
  return (
    attachment.contentType.toLowerCase().includes("pdf") ||
    attachment.fileName.toLowerCase().endsWith(".pdf")
  );
}

function isImage(attachment: ServiceRequestAttachmentMetaDto): boolean {
  const ct = attachment.contentType.toLowerCase();
  const name = attachment.fileName.toLowerCase();
  return (
    ct.includes("png") ||
    ct.includes("jpeg") ||
    ct.includes("jpg") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  );
}

export function ServiceRequestAttachmentViewerModal({
  open,
  requestId,
  attachment,
  onClose,
}: Props) {
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
    void fetchServiceRequestAttachmentBlob(requestId, attachment.storageFileName)
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
  }, [open, requestId, attachment]);

  const handleDownload = async () => {
    if (!attachment) return;
    setDownloading(true);
    try {
      await downloadServiceRequestAttachment(
        requestId,
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
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={!attachment || downloading}
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
      {loading ? <p>Carregando anexo…</p> : null}
      {error ? (
        <p className="leave-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {objectUrl && attachment && isPdf(attachment) ? (
        <iframe title={attachment.fileName} src={objectUrl} className="leave-attachment-viewer__pdf" />
      ) : null}
      {objectUrl && attachment && isImage(attachment) ? (
        <img
          src={objectUrl}
          alt={attachment.fileName}
          className="leave-attachment-viewer__img"
        />
      ) : null}
      {objectUrl && attachment && !isPdf(attachment) && !isImage(attachment) ? (
        <p>Pré-visualização indisponível para este tipo. Use Baixar.</p>
      ) : null}
    </ContrachequeModal>
  );
}
