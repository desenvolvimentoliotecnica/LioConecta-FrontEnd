import { formatUniLioDateTime } from "../../utils/unilioView";
import type { UniLioCommunityPost } from "../../config/unilio/types";
import "../../styles/unilio-community.css";

type Props = {
  posts: UniLioCommunityPost[];
};

export function UniLioCommunityFeed({ posts }: Props) {
  if (posts.length === 0) {
    return <p className="unilio-panel__empty">Nenhuma publicação na comunidade.</p>;
  }

  return (
    <ul className="unilio-community-feed">
      {posts.map((post) => (
        <li key={post.id} className="unilio-community-post">
          <div className="unilio-community-post__avatar" aria-hidden="true">
            {post.authorAvatarUrl ? (
              <img src={post.authorAvatarUrl} alt="" />
            ) : (
              <i className="fa-solid fa-user" />
            )}
          </div>
          <div className="unilio-community-post__body">
            <header className="unilio-community-post__head">
              <strong>{post.authorName}</strong>
              <time dateTime={post.createdAt}>{formatUniLioDateTime(post.createdAt)}</time>
            </header>
            {post.courseTitle ? (
              <span className="unilio-community-post__course">
                <i className="fa-solid fa-book" aria-hidden="true" /> {post.courseTitle}
              </span>
            ) : null}
            <p>{post.body}</p>
            <footer className="unilio-community-post__footer">
              <button type="button" className="unilio-community-post__like">
                <i className="fa-regular fa-heart" aria-hidden="true" /> {post.likesCount}
              </button>
            </footer>
          </div>
        </li>
      ))}
    </ul>
  );
}
