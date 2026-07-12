import { useEffect, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  pending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onPublish: (payload: { title: string; content: string; scheduledAt?: string | null }) => void;
};

function toLocalDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NovaNoticiaModal({ open, pending, errorMessage, onClose, onPublish }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    setScheduledAt("");
    setLocalError(null);
  }, [open]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !pending;

  const submit = (mode: "now" | "schedule") => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent || pending) return;

    if (mode === "schedule") {
      if (!scheduledAt) {
        setLocalError("Informe data e hora para agendar a publicação.");
        return;
      }
      const when = new Date(scheduledAt);
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        setLocalError("A data de agendamento deve ser no futuro.");
        return;
      }
      setLocalError(null);
      onPublish({
        title: trimmedTitle,
        content: trimmedContent,
        scheduledAt: when.toISOString(),
      });
      return;
    }

    setLocalError(null);
    onPublish({
      title: trimmedTitle,
      content: trimmedContent,
      scheduledAt: null,
    });
  };

  const displayError = localError || errorMessage || null;

  return (
    <ContrachequeModal
      open={open}
      title="Nova notícia"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose} disabled={pending}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn pay-modal__btn--ghost"
            onClick={() => submit("schedule")}
            disabled={!canSubmit}
          >
            {pending ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                Agendando...
              </>
            ) : (
              <>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                Agendar
              </>
            )}
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            onClick={() => submit("now")}
            disabled={!canSubmit}
          >
            {pending ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                Publicando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                Publicar agora
              </>
            )}
          </button>
        </>
      }
    >
      <div className="noticias-hub__modal">
        <p className="noticias-hub__modal-hint">
          A notícia aparece no hub e no feed. Você pode publicar agora ou agendar para uma data futura.
        </p>

        <div className="noticias-hub__field">
          <label htmlFor="nova-noticia-title">Título</label>
          <input
            id="nova-noticia-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Abertura do ciclo de inovação"
            maxLength={160}
            autoFocus
          />
        </div>

        <div className="noticias-hub__field">
          <label htmlFor="nova-noticia-content">Conteúdo</label>
          <textarea
            id="nova-noticia-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva o texto da notícia..."
            maxLength={4000}
          />
        </div>

        <div className="noticias-hub__field">
          <label htmlFor="nova-noticia-schedule">Agendar publicação</label>
          <input
            id="nova-noticia-schedule"
            type="datetime-local"
            value={scheduledAt}
            min={toLocalDateTimeValue(new Date())}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <p className="noticias-hub__field-hint">
            Opcional para “Publicar agora”. Obrigatório para “Agendar”.
          </p>
        </div>

        {displayError ? (
          <p className="noticias-hub__modal-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
