import { useRef, useState } from "react";
import "./feed-composer.css";

const CURRENT_USER = {
  name: "Maria Silva",
  avatar: "/avatar-maria-silva.png",
};

type Attachment = {
  file: File;
  previewUrl: string;
};

export function FeedComposer() {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canPublish = text.trim().length > 0 || attachment !== null;

  function handleExpand() {
    setExpanded(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment({ file, previewUrl: URL.createObjectURL(file) });
    setExpanded(true);
    e.target.value = "";
  }

  function removeAttachment() {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  }

  function handlePublish() {
    if (!canPublish) return;
    setPublished(true);
    setText("");
    removeAttachment();
    setExpanded(false);
    window.setTimeout(() => setPublished(false), 4000);
  }

  function handleCancel() {
    setText("");
    removeAttachment();
    setExpanded(false);
  }

  return (
    <section className="feed-composer" aria-label="Criar publicação">
      {published && (
        <div className="feed-composer__toast" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Publicação enviada com sucesso!
        </div>
      )}

      <article className="card feed-composer__card">
        <div className="feed-composer__top">
          <img
            className="avatar avatar--sm"
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
          />

          {!expanded ? (
            <button
              type="button"
              className="feed-composer__prompt"
              onClick={handleExpand}
            >
              No que você está pensando hoje?
            </button>
          ) : (
            <textarea
              ref={textareaRef}
              className="feed-composer__textarea"
              placeholder="No que você está pensando hoje?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              aria-label="Texto da publicação"
            />
          )}
        </div>

        {attachment && (
          <div className="feed-composer__preview">
            <img src={attachment.previewUrl} alt="Pré-visualização" />
            <button
              type="button"
              className="feed-composer__preview-remove"
              aria-label="Remover imagem"
              onClick={removeAttachment}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="feed-composer__divider" />

        <div className="feed-composer__actions">
          <div className="feed-composer__tools">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="feed-composer__file-input"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--photo"
              aria-label="Adicionar foto ou vídeo"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fa-solid fa-image" aria-hidden="true" />
              <span>Foto/vídeo</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--doc"
              aria-label="Anexar documento"
              onClick={handleExpand}
            >
              <i className="fa-solid fa-file-lines" aria-hidden="true" />
              <span>Documento</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--poll"
              aria-label="Criar enquete"
              onClick={handleExpand}
            >
              <i className="fa-solid fa-chart-bar" aria-hidden="true" />
              <span>Enquete</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--celebrate"
              aria-label="Parabenizar colega"
              onClick={handleExpand}
            >
              <i className="fa-solid fa-champagne-glasses" aria-hidden="true" />
              <span>Parabenizar</span>
            </button>
          </div>

          <div className="feed-composer__submit">
            {expanded && (
              <button
                type="button"
                className="feed-composer__cancel"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              className="feed-composer__publish"
              disabled={!canPublish}
              onClick={handlePublish}
            >
              Publicar
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
