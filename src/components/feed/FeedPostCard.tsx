import { FEED_LIKE_REACTION, useTogglePostLike } from "../../api/hooks/useFeed";
import type { FeedPostDto } from "../../api/types";
import { formatFeedTime, postTypeBadge, postTypeBadgeClass } from "./feed-utils";

type Props = {
  post: FeedPostDto;
};

export function FeedPostCard({ post }: Props) {
  const toggleLike = useTogglePostLike();
  const avatar = post.author.photoUrl?.startsWith("/")
    ? post.author.photoUrl
    : post.author.photoUrl ?? "/avatar-maria-silva.png";

  const isLiked = post.viewerReaction?.toLowerCase() === FEED_LIKE_REACTION;
  const isPending = toggleLike.isPending && toggleLike.variables === post.id;

  function handleToggleLike() {
    if (isPending) return;
    toggleLike.mutate(post.id);
  }

  return (
    <article className="card" data-feed-post-id={post.id}>
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
      <div className="card__body">{post.content}</div>
      <div className="card__footer">
        <button
          type="button"
          className={`action action--button${isLiked ? " action--liked" : ""}`}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Descurtir publicação" : "Curtir publicação"}
          disabled={isPending}
          onClick={handleToggleLike}
        >
          <i
            className={`${isLiked ? "fa-solid" : "fa-regular"} fa-thumbs-up`}
            aria-hidden="true"
          />
          {post.reactionCount}
        </button>
        <span className="action">
          <i className="fa-regular fa-comment" aria-hidden="true" /> {post.commentCount}
        </span>
        <span className="action">
          <i className="fa-regular fa-share-from-square" aria-hidden="true" /> Compartilhar
        </span>
      </div>
    </article>
  );
}
