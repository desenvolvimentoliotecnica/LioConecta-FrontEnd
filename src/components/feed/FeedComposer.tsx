import { useRef, useState } from "react";
import { useCreatePost, useUploadPostMedia } from "../../api/hooks/useFeed";
import { useMe } from "../../api/hooks/useMe";
import { config } from "../../api/client";
import { UserAvatar } from "../ui/UserAvatar";
import { PollCreateModal } from "./PollCreateModal";
import "./feed-composer.css";

const FALLBACK_NAME = "Leonardo Sabino Mendes";

type Attachment = {
  file: File;
  previewUrl: string;
};

export function FeedComposer() {
  const { data: me } = useMe();
  const createPost = useCreatePost();
  const uploadPostMedia = useUploadPostMedia();
  const user = me ?? { name: FALLBACK_NAME };

  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canPublish = text.trim().length > 0 || attachment !== null;
  const isPublishing = createPost.isPending || uploadPostMedia.isPending;

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }

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

  async function handlePublish() {
    if (!canPublish || isPublishing) return;

    if (config.useMock) {
      showToast("success", "Publicação enviada (modo mock).");
      setText("");
      removeAttachment();
      setExpanded(false);
      return;
    }

    try {
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;

      if (attachment) {
        const uploaded = await uploadPostMedia.mutateAsync(attachment.file);
        mediaUrl = uploaded.url;
        mediaType = uploaded.mediaType;
      }

      await createPost.mutateAsync({
        content: text.trim(),
        mediaUrl,
        mediaType,
      });
      setText("");
      removeAttachment();
      setExpanded(false);
      showToast("success", "Publicação enviada com sucesso!");
    } catch {
      showToast("error", "Não foi possível publicar. Tente novamente.");
    }
  }

  function handleCancel() {
    setText("");
    removeAttachment();
    setExpanded(false);
  }

  return (
    <section className="feed-composer" aria-label="Criar publicação">
      {toast && (
        <div
          className={`feed-composer__toast feed-composer__toast--${toast.type}`}
          role="status"
        >
          <i
            className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}
            aria-hidden="true"
          />
          {toast.message}
        </div>
      )}

      <article className="card feed-composer__card">
        <div className="feed-composer__top">
          <UserAvatar className="avatar avatar--sm" photoUrl={me?.photoUrl} alt={user.name} />

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
              disabled={isPublishing}
            />
          )}
        </div>

        {attachment ? (
          <div className="feed-composer__preview">
            {attachment.file.type.startsWith("video/") ? (
              <video src={attachment.previewUrl} controls muted playsInline />
            ) : (
              <img src={attachment.previewUrl} alt="Pré-visualização" />
            )}
            <button
              type="button"
              className="feed-composer__preview-remove"
              aria-label="Remover imagem"
              onClick={removeAttachment}
              disabled={isPublishing}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        ) : null}

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
              disabled={isPublishing}
            >
              <i className="fa-solid fa-image" aria-hidden="true" />
              <span>Foto/vídeo</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--doc"
              aria-label="Anexar documento"
              onClick={handleExpand}
              disabled={isPublishing}
            >
              <i className="fa-solid fa-file-lines" aria-hidden="true" />
              <span>Documento</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--poll"
              aria-label="Criar enquete"
              onClick={() => setPollModalOpen(true)}
              disabled={isPublishing}
            >
              <i className="fa-solid fa-chart-bar" aria-hidden="true" />
              <span>Enquete</span>
            </button>
            <button
              type="button"
              className="feed-composer__tool feed-composer__tool--celebrate"
              aria-label="Parabenizar colega"
              onClick={handleExpand}
              disabled={isPublishing}
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
                disabled={isPublishing}
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              className="feed-composer__publish"
              disabled={!canPublish || isPublishing}
              onClick={() => void handlePublish()}
            >
              {isPublishing ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </article>

      <PollCreateModal
        open={pollModalOpen}
        onClose={() => setPollModalOpen(false)}
        onPublished={() => showToast("success", "Enquete publicada com sucesso!")}
        onError={(message) => showToast("error", message)}
      />
    </section>
  );
}
