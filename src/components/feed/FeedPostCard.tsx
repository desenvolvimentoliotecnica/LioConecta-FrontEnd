import type { FeedPostDto } from "../../api/types";
import { formatFeedTime, postTypeBadge, postTypeBadgeClass } from "./feed-utils";

type Props = {
  post: FeedPostDto;
};

export function FeedPostCard({ post }: Props) {
  const avatar = post.author.photoUrl?.startsWith("/")
    ? post.author.photoUrl
    : post.author.photoUrl ?? "/avatar-maria-silva.png";

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
        <span className="action">
          <i className="fa-regular fa-thumbs-up" aria-hidden="true" /> {post.reactionCount}
        </span>
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
