import { useRef, useState } from "react";
import { useCreatePost, useUploadPostMedia } from "../../api/hooks/useFeed";
import { useMe } from "../../api/hooks/useMe";
import { config } from "../../api/client";
import { UserAvatar } from "../ui/UserAvatar";
import { PollCreateModal } from "./PollCreateModal";
import "./feed-composer.css";

const FALLBACK_NAME = "Leonardo Sabino Mendes";
const MAX_IMAGE_ATTACHMENTS = 10;

type Attachment = {
  id: string;
  file: File;
  previewUrl: string;
};

function createAttachmentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FeedComposer() {
  const { data: me } = useMe();
  const createPost = useCreatePost();
  const uploadPostMedia = useUploadPostMedia();
  const user = me ?? { name: FALLBACK_NAME };

  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canPublish = text.trim().length > 0 || attachments.length > 0;
  const isPublishing = createPost.isPending || uploadPostMedia.isPending;

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }

  function handleExpand() {
    setExpanded(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function revokeAttachmentPreview(attachment: Attachment) {
    URL.revokeObjectURL(attachment.previewUrl);
  }

  function clearAttachments() {
    setAttachments((current) => {
      current.forEach(revokeAttachmentPreview);
      return [];
    });
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const videoFile = files.find((file) => file.type.startsWith("video/"));
    if (videoFile) {
      clearAttachments();
      setAttachments([
        {
          id: createAttachmentId(),
          file: videoFile,
          previewUrl: URL.createObjectURL(videoFile),
        },
      ]);
      setExpanded(true);
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setAttachments((current) => {
      const hasVideo = current.some((item) => item.file.type.startsWith("video/"));
      const base = hasVideo ? [] : current.filter((item) => item.file.type.startsWith("image/"));
      if (hasVideo) {
        current.forEach(revokeAttachmentPreview);
      }

      const remainingSlots = MAX_IMAGE_ATTACHMENTS - base.length;
      if (remainingSlots <= 0) {
        showToast("error", `Você pode anexar até ${MAX_IMAGE_ATTACHMENTS} fotos por publicação.`);
        return base;
      }

      const nextFiles = imageFiles.slice(0, remainingSlots);
      if (nextFiles.length < imageFiles.length) {
        showToast("error", `Você pode anexar até ${MAX_IMAGE_ATTACHMENTS} fotos por publicação.`);
      }

      return [
        ...base,
        ...nextFiles.map((file) => ({
          id: createAttachmentId(),
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });
    setExpanded(true);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target) revokeAttachmentPreview(target);
      return current.filter((item) => item.id !== id);
    });
  }

  async function handlePublish() {
    if (!canPublish || isPublishing) return;

    if (config.useMock) {
      showToast("success", "Publicação enviada (modo mock).");
      setText("");
      clearAttachments();
      setExpanded(false);
      return;
    }

    try {
      const mediaItems =
        attachments.length > 0
          ? await Promise.all(
              attachments.map(async (attachment) => {
                const uploaded = await uploadPostMedia.mutateAsync(attachment.file);
                return {
                  url: uploaded.url,
                  mediaType: uploaded.mediaType,
                };
              }),
            )
          : [];

      await createPost.mutateAsync({
        content: text.trim(),
        mediaItems,
      });
      setText("");
      clearAttachments();
      setExpanded(false);
      showToast("success", "Publicação enviada com sucesso!");
    } catch {
      showToast("error", "Não foi possível publicar. Tente novamente.");
    }
  }

  function handleCancel() {
    setText("");
    clearAttachments();
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

        {attachments.length > 0 ? (
          <div
            className={`feed-composer__preview-grid feed-composer__preview-grid--count-${Math.min(attachments.length, 4)}`}
          >
            {attachments.map((attachment) => (
              <div key={attachment.id} className="feed-composer__preview">
                {attachment.file.type.startsWith("video/") ? (
                  <video
                    src={attachment.previewUrl}
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="Pré-visualização de vídeo"
                  />
                ) : (
                  <img src={attachment.previewUrl} alt="Pré-visualização" />
                )}
                <button
                  type="button"
                  className="feed-composer__preview-remove"
                  aria-label="Remover mídia"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={isPublishing}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="feed-composer__divider" />

        <div className="feed-composer__actions">
          <div className="feed-composer__tools">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
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
              className="feed-composer__tool feed-composer__tool--poll"
              aria-label="Criar enquete"
              onClick={() => setPollModalOpen(true)}
              disabled={isPublishing}
            >
              <i className="fa-solid fa-chart-bar" aria-hidden="true" />
              <span>Enquete</span>
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
