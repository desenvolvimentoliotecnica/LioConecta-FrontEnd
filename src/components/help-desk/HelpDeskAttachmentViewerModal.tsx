import { useEffect, useMemo, useRef, useState } from "react";
import {
  downloadHelpDeskTicketAttachment,
  fetchHelpDeskTicketAttachmentBlob,
} from "../../api/hooks/useHelpDesk";
import type { HelpDeskTicketAttachmentDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  ticketId: string | null;
  attachments: HelpDeskTicketAttachmentDto[];
  initialDocumentId: string | null;
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

function resolveInitialIndex(
  attachments: HelpDeskTicketAttachmentDto[],
  initialDocumentId: string | null,
): number {
  if (!initialDocumentId) return 0;
  const index = attachments.findIndex((item) => item.documentId === initialDocumentId);
  return index >= 0 ? index : 0;
}

export function HelpDeskAttachmentViewerModal({
  open,
  ticketId,
  attachments,
  initialDocumentId,
  onClose,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [urlById, setUrlById] = useState<Record<string, string>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const urlByIdRef = useRef(urlById);
  urlByIdRef.current = urlById;

  const items = attachments;
  const canNavigate = items.length > 1;
  const current = items[currentIndex] ?? null;
  const objectUrl = current ? urlById[current.documentId] ?? null : null;
  const error = current ? errorById[current.documentId] ?? null : null;
  const loading = current != null && loadingId === current.documentId && !objectUrl && !error;

  const title = useMemo(() => {
    if (!current) return "Anexo";
    if (!canNavigate) return current.fileName;
    return `${current.fileName} (${currentIndex + 1}/${items.length})`;
  }, [canNavigate, current, currentIndex, items.length]);

  const attachmentKey = useMemo(
    () => items.map((item) => item.documentId).join("|"),
    [items],
  );

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(resolveInitialIndex(items, initialDocumentId));
  }, [open, initialDocumentId, attachmentKey, items]);

  useEffect(() => {
    if (!open) {
      setUrlById((prev) => {
        for (const url of Object.values(prev)) {
          URL.revokeObjectURL(url);
        }
        return {};
      });
      setErrorById({});
      setLoadingId(null);
      setDownloading(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(urlByIdRef.current)) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    if (!open || !ticketId || !current) return;
    const documentId = current.documentId;
    if (urlById[documentId] || errorById[documentId]) return;

    let cancelled = false;
    setLoadingId(documentId);
    void fetchHelpDeskTicketAttachmentBlob(ticketId, documentId)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setUrlById((prev) => ({ ...prev, [documentId]: url }));
      })
      .catch(() => {
        if (!cancelled) {
          setErrorById((prev) => ({ ...prev, [documentId]: "Não foi possível carregar o anexo." }));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingId((prev) => (prev === documentId ? null : prev));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, ticketId, current, urlById, errorById]);

  // Prefetch image thumbnails for siblings in the gallery.
  useEffect(() => {
    if (!open || !ticketId || items.length <= 1) return;

    let cancelled = false;
    const requested = new Set<string>();

    for (const item of items) {
      if (!isImage(item) || urlByIdRef.current[item.documentId] || requested.has(item.documentId)) {
        continue;
      }
      requested.add(item.documentId);
      void fetchHelpDeskTicketAttachmentBlob(ticketId, item.documentId)
        .then((blob) => {
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setUrlById((prev) => {
            if (prev[item.documentId]) {
              URL.revokeObjectURL(url);
              return prev;
            }
            return { ...prev, [item.documentId]: url };
          });
        })
        .catch(() => {
          if (cancelled) return;
          setErrorById((prev) =>
            prev[item.documentId]
              ? prev
              : { ...prev, [item.documentId]: "Não foi possível carregar o anexo." },
          );
        });
    }

    return () => {
      cancelled = true;
    };
  }, [open, ticketId, attachmentKey, items]);

  useEffect(() => {
    if (!open || !canNavigate) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        setCurrentIndex((index) => (index - 1 + items.length) % items.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        setCurrentIndex((index) => (index + 1) % items.length);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, canNavigate, items.length]);

  const goPrev = () => {
    if (!canNavigate) return;
    setCurrentIndex((index) => (index - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setCurrentIndex((index) => (index + 1) % items.length);
  };

  const handleDownload = async () => {
    if (!current || !ticketId) return;
    setDownloading(true);
    try {
      await downloadHelpDeskTicketAttachment(ticketId, current.documentId, current.fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ContrachequeModal
      open={open && current !== null}
      title={title}
      wide
      stacked
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={!current || downloading || loading}
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
        <div className="hd-attachment-viewer__stage">
          {canNavigate ? (
            <button
              type="button"
              className="hd-attachment-viewer__nav hd-attachment-viewer__nav--prev"
              aria-label="Anexo anterior"
              title="Anterior (←)"
              onClick={goPrev}
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          ) : null}

          <div className="hd-attachment-viewer__canvas">
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
            {objectUrl && current && isPdf(current) ? (
              <iframe title={current.fileName} src={objectUrl} className="hd-attachment-viewer__pdf" />
            ) : null}
            {objectUrl && current && isImage(current) ? (
              <img src={objectUrl} alt={current.fileName} className="hd-attachment-viewer__img" />
            ) : null}
            {objectUrl && current && !isPdf(current) && !isImage(current) ? (
              <p className="hd-attachment-viewer__fallback">
                Pré-visualização indisponível para este tipo. Use Baixar.
              </p>
            ) : null}
          </div>

          {canNavigate ? (
            <button
              type="button"
              className="hd-attachment-viewer__nav hd-attachment-viewer__nav--next"
              aria-label="Próximo anexo"
              title="Próximo (→)"
              onClick={goNext}
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {canNavigate ? (
          <div className="hd-attachment-viewer__thumbs" role="list" aria-label="Anexos do chamado">
            {items.map((item, index) => {
              const thumbUrl = urlById[item.documentId];
              const active = index === currentIndex;
              return (
                <button
                  key={item.documentId}
                  type="button"
                  role="listitem"
                  className={`hd-attachment-viewer__thumb${active ? " is-active" : ""}`}
                  aria-label={`Ver ${item.fileName}`}
                  aria-current={active ? "true" : undefined}
                  title={item.fileName}
                  onClick={() => setCurrentIndex(index)}
                >
                  {thumbUrl && isImage(item) ? (
                    <img src={thumbUrl} alt="" />
                  ) : (
                    <span className="hd-attachment-viewer__thumb-icon" aria-hidden="true">
                      <i className={`fa-solid ${isPdf(item) ? "fa-file-pdf" : "fa-paperclip"}`} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
