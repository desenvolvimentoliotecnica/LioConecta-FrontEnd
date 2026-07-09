import { useId, useState } from "react";
import { normalizeBackendMediaUrl, resolveBackendAssetUrl } from "../../api/assetUrl";
import { useMe } from "../../api/hooks/useMe";
import {
  FEED_LIKE_REACTION,
  useAddPostComment,
  useDeletePost,
  useTogglePostLike,
} from "../../api/hooks/useFeed";
import type { CommentDto, FeedPostDto } from "../../api/types";
import { POST_TYPE_CELEBRATION, POST_TYPE_COMUNICADO, POST_TYPE_POLL, POST_TYPE_SOCIAL } from "../../api/types";
import { UserAvatar } from "../ui/UserAvatar";
import { FeedPostActionsMenu } from "./FeedPostActionsMenu";
import { FeedPollBody, getPollHeroImage } from "./FeedPollCard";
import { ImageLightbox } from "./ImageLightbox";
import { formatFeedTime, getPostMediaItems, postTypeBadge, postTypeBadgeClass } from "./feed-utils";

type Props = {
  post: FeedPostDto;
};

function celebrationMention(post: FeedPostDto): { name: string; slug?: string } | null {
  const name = post.metadata?.celebratedPersonName;
  const slug = post.metadata?.celebratedPersonSlug;
  if (typeof name !== "string" || !name.trim()) return null;
  return {
    name: name.trim(),
    slug: typeof slug === "string" && slug.trim() ? slug.trim() : undefined,
  };
}

function uniLioCourseCompleted(post: FeedPostDto): { courseTitle?: string; courseId?: string } | null {
  if (post.metadata?.kind !== "unilio_course_completed") return null;
  const courseTitle =
    typeof post.metadata.courseTitle === "string" ? post.metadata.courseTitle.trim() : undefined;
  const courseId = typeof post.metadata.courseId === "string" ? post.metadata.courseId : undefined;
  return { courseTitle, courseId };
}

function CommentItem({ comment }: { comment: CommentDto }) {
  return (
    <div className="comment">
      <UserAvatar className="avatar avatar--xs" photoUrl={comment.author.photoUrl} />
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
  const deletePost = useDeletePost();
  const formId = useId();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; mediaUrl: string } | null>(null);

  const isLiked = post.viewerReaction?.toLowerCase() === FEED_LIKE_REACTION;
  const isLikePending = toggleLike.isPending && toggleLike.variables === post.id;
  const isCommentPending =
    addComment.isPending && addComment.variables?.postId === post.id;
  const trimmedComment = commentText.trim();
  const canSubmitComment = trimmedComment.length > 0 && !isCommentPending;

  const isComunicado = post.type === POST_TYPE_COMUNICADO;
  const isPoll = post.type === POST_TYPE_POLL;
  const isCelebration = post.type === POST_TYPE_CELEBRATION;
  const celebrated = isCelebration ? celebrationMention(post) : null;
  const courseCompleted = uniLioCourseCompleted(post);
  const heroImage =
    isComunicado && typeof post.metadata.heroImageUrl === "string"
      ? resolveBackendAssetUrl(post.metadata.heroImageUrl)
      : undefined;
  const postMediaItems = !isComunicado && !isPoll ? getPostMediaItems(post) : [];
  const isOwner = Boolean(me?.id && post.author.id === me.id);
  const canDelete =
    isOwner && (post.type === POST_TYPE_SOCIAL || post.type === POST_TYPE_POLL);
  const isDeletePending = deletePost.isPending && deletePost.variables === post.id;

  function handleDeletePost() {
    if (isDeletePending) return;
    deletePost.mutate(post.id);
  }

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
      className={`card${isComunicado ? " card--comunicado" : ""}${isCelebration ? " card--celebration" : ""}`}
      data-feed-post-id={post.id}
    >
      {heroImage ? (
        <div className="post-media post-media--banner post-media--clickable">
          <button
            type="button"
            className="post-media__trigger"
            aria-label="Ampliar imagem"
            onClick={() =>
              setLightbox({
                src: heroImage,
                mediaUrl: normalizeBackendMediaUrl(
                  typeof post.metadata.heroImageUrl === "string" ? post.metadata.heroImageUrl : "",
                ),
              })
            }
          >
            <img src={heroImage} alt="" />
          </button>
        </div>
      ) : null}
      <div className="card__header">
        <UserAvatar className="avatar avatar--sm" photoUrl={post.author.photoUrl} alt={post.author.name} />
        <div className="card__meta">
          <div className="card__author">{post.author.name}</div>
          <div className="card__time">{formatFeedTime(post.createdAt)}</div>
        </div>
        <span className={`badge ${postTypeBadgeClass(post.type)}`}>
          {isCelebration ? (
            <>
              <i className="fa-solid fa-gift" aria-hidden="true" /> {postTypeBadge(post.type)}
            </>
          ) : (
            postTypeBadge(post.type)
          )}
        </span>
        {canDelete ? (
          <FeedPostActionsMenu onDelete={handleDeletePost} disabled={isDeletePending} />
        ) : null}
      </div>
      {isCelebration && celebrated ? (
        <div className="card__celebration-mention">
          <i className="fa-solid fa-cake-candles" aria-hidden="true" />
          <span>
            Parabenizou{" "}
            {celebrated.slug ? (
              <a href={`/pessoas/perfil?id=${encodeURIComponent(celebrated.slug)}`}>
                @{celebrated.name}
              </a>
            ) : (
              <strong>@{celebrated.name}</strong>
            )}
          </span>
        </div>
      ) : null}
      {courseCompleted ? (
        <div className="card__celebration-mention">
          <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
          <span>
            Concluiu o curso{" "}
            {courseCompleted.courseId ? (
              <a href={`/unilio/curso/${encodeURIComponent(courseCompleted.courseId)}`}>
                {courseCompleted.courseTitle ?? "no UniLio"}
              </a>
            ) : (
              <strong>{courseCompleted.courseTitle ?? "no UniLio"}</strong>
            )}
          </span>
        </div>
      ) : null}
      {isComunicado ? (
        <div className="card__body" dangerouslySetInnerHTML={{ __html: post.content }} />
      ) : isPoll && post.poll ? (
        <FeedPollBody poll={post.poll} heroImageUrl={getPollHeroImage(post)} />
      ) : isPoll ? (
        <div className="card__body">{post.content}</div>
      ) : post.content.trim() ? (
        <div className="card__body">{post.content}</div>
      ) : null}
      {postMediaItems.length > 0 ? (
        postMediaItems.length === 1 && postMediaItems[0].type === "video" ? (
          <div className="post-media post-media--video">
            <video src={postMediaItems[0].url} controls playsInline preload="metadata" />
          </div>
        ) : postMediaItems.length === 1 ? (
          <div className="post-media post-media--clickable">
            <button
              type="button"
              className="post-media__trigger"
              aria-label="Ampliar imagem"
              onClick={() =>
                setLightbox({ src: postMediaItems[0].url, mediaUrl: postMediaItems[0].rawUrl })
              }
            >
              <img src={postMediaItems[0].url} alt="" loading="lazy" />
            </button>
          </div>
        ) : (
          <div
            className={`post-media-gallery post-media-gallery--count-${Math.min(postMediaItems.length, 4)}`}
          >
            {postMediaItems.slice(0, 4).map((item, index) => {
              const remainingCount = postMediaItems.length - 4;
              const showMoreOverlay = remainingCount > 0 && index === 3;

              return (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  className="post-media-gallery__item"
                  aria-label={showMoreOverlay ? `Ver mais ${remainingCount} imagens` : "Ampliar imagem"}
                  onClick={() => setLightbox({ src: item.url, mediaUrl: item.rawUrl })}
                >
                  <img src={item.url} alt="" loading="lazy" />
                  {showMoreOverlay ? (
                    <span className="post-media-gallery__more">+{remainingCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )
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
            <UserAvatar className="avatar avatar--xs" photoUrl={me?.photoUrl} />
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

      {lightbox ? (
        <ImageLightbox
          open
          src={lightbox.src}
          postId={post.id}
          mediaUrl={lightbox.mediaUrl || undefined}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </article>
  );
}
