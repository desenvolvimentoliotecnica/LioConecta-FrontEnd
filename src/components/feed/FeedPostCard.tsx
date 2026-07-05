import { useId, useState } from "react";
import { useMe } from "../../api/hooks/useMe";
import { FEED_LIKE_REACTION, useAddPostComment, useTogglePostLike } from "../../api/hooks/useFeed";
import type { CommentDto, FeedPostDto } from "../../api/types";
import { POST_TYPE_COMUNICADO, POST_TYPE_POLL } from "../../api/types";
import { FeedPollBody, getPollHeroImage } from "./FeedPollCard";
import { ImageLightbox } from "./ImageLightbox";
import { formatFeedTime, getPostMedia, postTypeBadge, postTypeBadgeClass } from "./feed-utils";

type Props = {
  post: FeedPostDto;
};

function authorAvatar(photoUrl?: string | null): string {
  if (photoUrl?.startsWith("/")) return photoUrl;
  return photoUrl ?? "/avatar-maria-silva.png";
}

function CommentItem({ comment }: { comment: CommentDto }) {
  return (
    <div className="comment">
      <img
        className="avatar avatar--xs"
        src={authorAvatar(comment.author.photoUrl)}
        alt=""
      />
      <div className="comment__body">
        <div className="comment__meta">
          {comment.author.name}{" "}
          <span className="comment__time">· {formatFeedTime(comment.createdAt)}</span>
        </div>
        <p className="comment__text">{comment.text}</p>
      </div>
    </div>
  );
}

export function FeedPostCard({ post }: Props) {
  const { data: me } = useMe();
  const toggleLike = useTogglePostLike();
  const addComment = useAddPostComment();
  const formId = useId();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const avatar = authorAvatar(post.author.photoUrl);
  const viewerAvatar = authorAvatar(me?.photoUrl);

  const isLiked = post.viewerReaction?.toLowerCase() === FEED_LIKE_REACTION;
  const isLikePending = toggleLike.isPending && toggleLike.variables === post.id;
  const isCommentPending =
    addComment.isPending && addComment.variables?.postId === post.id;
  const trimmedComment = commentText.trim();
  const canSubmitComment = trimmedComment.length > 0 && !isCommentPending;

  const isComunicado = post.type === POST_TYPE_COMUNICADO;
  const isPoll = post.type === POST_TYPE_POLL;
  const heroImage =
    isComunicado && typeof post.metadata.heroImageUrl === "string"
      ? post.metadata.heroImageUrl
      : undefined;
  const postMedia = !isComunicado && !isPoll ? getPostMedia(post) : null;

  function handleToggleLike() {
    if (isLikePending) return;
    toggleLike.mutate(post.id);
  }

  function handleToggleComments() {
    setShowComments((open) => !open);
  }

  function handleSubmitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitComment) return;

    addComment.mutate(
      { postId: post.id, text: trimmedComment },
      {
        onSuccess: () => {
          setCommentText("");
          setShowComments(true);
        },
      },
    );
  }

  return (
    <article
      className={`card${isComunicado ? " card--comunicado" : ""}`}
      data-feed-post-id={post.id}
    >
      {heroImage ? (
        <div className="post-media post-media--banner post-media--clickable">
          <button
            type="button"
            className="post-media__trigger"
            aria-label="Ampliar imagem"
            onClick={() => setLightboxSrc(heroImage)}
          >
            <img src={heroImage} alt="" />
          </button>
        </div>
      ) : null}
      <div className="card__header">
        <img className="avatar avatar--sm" src={avatar} alt={post.author.name} />
        <div className="card__meta">
          <div className="card__author">{post.author.name}</div>
          <div className="card__time">{formatFeedTime(post.createdAt)}</div>
        </div>
        <span className={`badge ${postTypeBadgeClass(post.type)}`}>
          {postTypeBadge(post.type)}
        </span>
      </div>
      {isComunicado ? (
        <div className="card__body" dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : isPoll && post.poll ? (
        <FeedPollBody poll={post.poll} heroImageUrl={getPollHeroImage(post)} />
      ) : isPoll ? (
        <div className="card__body">{post.content}</div>
      ) : post.content.trim() ? (
        <div className="card__body">{post.content}</div>
      ) : null}
      {postMedia ? (
        <div
          className={`post-media${postMedia.type === "video" ? " post-media--video" : " post-media--clickable"}`}
        >
          {postMedia.type === "video" ? (
            <video src={postMedia.url} controls playsInline preload="metadata" />
          ) : (
            <button
              type="button"
              className="post-media__trigger"
              aria-label="Ampliar imagem"
              onClick={() => setLightboxSrc(postMedia.url)}
            >
              <img src={postMedia.url} alt="" loading="lazy" />
            </button>
          )}
        </div>
      ) : null}
      <div className="card__footer">
        <button
          type="button"
          className={`action action--button${isLiked ? " action--liked" : ""}`}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Descurtir publicação" : "Curtir publicação"}
          disabled={isLikePending}
          onClick={handleToggleLike}
        >
          <i
            className={`${isLiked ? "fa-solid" : "fa-regular"} fa-thumbs-up`}
            aria-hidden="true"
          />
          {post.reactionCount}
        </button>
        <button
          type="button"
          className={`action action--button${showComments ? " action--active" : ""}`}
          aria-expanded={showComments}
          aria-controls={`${formId}-comments`}
          aria-label={`Comentários (${post.commentCount})`}
          onClick={handleToggleComments}
        >
          <i className="fa-regular fa-comment" aria-hidden="true" /> {post.commentCount}
        </button>
        <span className="action">
          <i className="fa-regular fa-share-from-square" aria-hidden="true" /> Compartilhar
        </span>
      </div>

      {showComments ? (
        <section className="comments" id={`${formId}-comments`} aria-label="Comentários">
          {post.comments.length > 0 ? (
            <>
              <div className="comments__title">Comentários ({post.commentCount})</div>
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </>
          ) : (
            <p className="comments__empty">Nenhum comentário ainda. Seja o primeiro!</p>
          )}

          <form className="comments__form" onSubmit={handleSubmitComment}>
            <img className="avatar avatar--xs" src={viewerAvatar} alt="" />
            <label className="visually-hidden" htmlFor={`${formId}-input`}>
              Escreva um comentário
            </label>
            <input
              id={`${formId}-input`}
              className="comments__field"
              type="text"
              placeholder="Escreva um comentário..."
              value={commentText}
              maxLength={2000}
              disabled={isCommentPending}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button
              type="submit"
              className="comments__submit"
              disabled={!canSubmitComment}
            >
              {isCommentPending ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </section>
      ) : null}

      {lightboxSrc ? (
        <ImageLightbox
          open
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      ) : null}
    </article>
  );
}
