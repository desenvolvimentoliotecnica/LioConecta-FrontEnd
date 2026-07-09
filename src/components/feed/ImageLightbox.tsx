import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAddPostMediaComment, usePostMediaComments } from "../../api/hooks/useFeed";
import { useMe } from "../../api/hooks/useMe";
import type { CommentDto } from "../../api/types";
import { UserAvatar } from "../ui/UserAvatar";
import { formatFeedTime } from "./feed-utils";
import "./image-lightbox.css";

type Props = {
  open: boolean;
  src: string;
  alt?: string;
  postId?: string;
  mediaUrl?: string;
  onClose: () => void;
};

function PhotoCommentItem({ comment }: { comment: CommentDto }) {
  return (
    <div className="image-lightbox__comment">
      <UserAvatar className="avatar avatar--xs" photoUrl={comment.author.photoUrl} alt={comment.author.name} />
      <div className="image-lightbox__comment-body">
        <div className="image-lightbox__comment-meta">
          <strong>{comment.author.name}</strong>
          <span>{formatFeedTime(comment.createdAt)}</span>
        </div>
        <p>{comment.text}</p>
      </div>
    </div>
  );
}

export function ImageLightbox({ open, src, alt = "", postId, mediaUrl, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const formId = useId();
  const { data: me } = useMe();
  const [commentText, setCommentText] = useState("");
  const canComment = Boolean(postId && mediaUrl);
  const commentsQuery = usePostMediaComments(canComment ? postId! : null, canComment ? mediaUrl! : null);
  const addComment = useAddPostMediaComment();
  const trimmedComment = commentText.trim();
  const isCommentPending = addComment.isPending;
  const canSubmitComment = trimmedComment.length > 0 && !isCommentPending && canComment;

  useEffect(() => {
    if (!open) {
      setCommentText("");
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitComment || !postId || !mediaUrl) return;

    addComment.mutate(
      { postId, mediaUrl, text: trimmedComment },
      {
        onSuccess: () => setCommentText(""),
      },
    );
  }

  const comments = commentsQuery.data ?? [];

  return createPortal(
    <div className="image-lightbox__backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={`image-lightbox${canComment ? " image-lightbox--with-comments" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Visualizar imagem"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="image-lightbox__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="image-lightbox__layout">
          <div className="image-lightbox__media">
            <img className="image-lightbox__img" src={src} alt={alt} />
          </div>

          {canComment ? (
            <aside className="image-lightbox__sidebar" aria-label="Comentários da foto">
              <div className="image-lightbox__sidebar-header">
                <h3>Comentários da foto</h3>
                <span>{comments.length}</span>
              </div>

              <div className="image-lightbox__comments">
                {commentsQuery.isLoading ? (
                  <p className="image-lightbox__comments-state">Carregando comentários…</p>
                ) : commentsQuery.isError ? (
                  <p className="image-lightbox__comments-state image-lightbox__comments-state--error">
                    Não foi possível carregar os comentários.
                  </p>
                ) : comments.length === 0 ? (
                  <p className="image-lightbox__comments-state">
                    Nenhum comentário nesta foto ainda. Seja o primeiro!
                  </p>
                ) : (
                  comments.map((comment) => <PhotoCommentItem key={comment.id} comment={comment} />)
                )}
              </div>

              <form className="image-lightbox__composer" onSubmit={handleSubmitComment}>
                <UserAvatar className="avatar avatar--xs" photoUrl={me?.photoUrl} alt={me?.name ?? "Você"} />
                <label className="sr-only" htmlFor={`${formId}-photo-comment`}>
                  Comentar foto
                </label>
                <input
                  id={`${formId}-photo-comment`}
                  className="image-lightbox__composer-input"
                  type="text"
                  placeholder="Comente esta foto…"
                  value={commentText}
                  maxLength={1000}
                  disabled={isCommentPending}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <button
                  type="submit"
                  className="image-lightbox__composer-submit"
                  disabled={!canSubmitComment}
                >
                  {isCommentPending ? "…" : "Enviar"}
                </button>
              </form>
            </aside>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
