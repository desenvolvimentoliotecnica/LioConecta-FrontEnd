import { Children, type ReactNode, useState } from "react";
import { useFeed } from "../../api/hooks/useFeed";
import { config } from "../../api/client";
import { FeedPostCard } from "./FeedPostCard";
import { distributeRoundRobin, useFeedColumnCount } from "./feed-masonry";
import { useFeedPostDeepLink } from "./useFeedPostDeepLink";
import { POST_TYPE_COMUNICADO, POST_TYPE_NEWS, POST_TYPE_POLL, POST_TYPE_SOCIAL } from "../../api/types";
import "./feed-deep-link.css";

type FeedPostsProps = {
  /** Card(s) no início do masonry (ex.: MoodCheck), na mesma ordem L→R. */
  leading?: ReactNode;
};

export function FeedPosts({ leading }: FeedPostsProps = {}) {
  const { data, isLoading, isError } = useFeed();
  const [type, setType] = useState<number | null>(null);
  const columnCount = useFeedColumnCount();
  const posts = (data?.items ?? []).filter((post) => type === null || post.type === type);

  useFeedPostDeepLink(posts, isLoading);

  if (config.useMock) return null;
  const leadingItems = Children.toArray(leading).filter(Boolean);

  // Only mount `.feed-grid` when there are API posts. Otherwise the page CSS
  // `:has(.feed-api-posts .feed-grid)` hides the legacy HTML feed and leaves a blank area
  // when /feed fails or is still loading.
  if (posts.length === 0) {
    if (!isLoading && !isError && leadingItems.length === 0) {
      return null;
    }

    return (
      <div
        className="feed-api-posts"
        aria-busy={isLoading || undefined}
        aria-label={isLoading ? "Carregando publicações" : undefined}
        role={isError ? "alert" : undefined}
      >
        {isError ? (
          <p className="feed-api-posts__status feed-api-posts__status--error">
            Não foi possível carregar as publicações do feed.
          </p>
        ) : null}
        {isLoading ? (
          <p className="feed-api-posts__status">Carregando publicações…</p>
        ) : null}
        {leadingItems.length > 0 ? (
          <div className="feed-api-posts__leading">{leadingItems}</div>
        ) : null}
      </div>
    );
  }

  const postNodes = posts.map((post) => <FeedPostCard key={post.id} post={post} />);
  const items = [...leadingItems, ...postNodes];
  const columns = distributeRoundRobin(items, columnCount);

  return (
    <div className="feed-api-posts" aria-label="Publicações do feed">
      <div className="page-filters" role="group" aria-label="Tipo de publicação">
        {[[null, "Todos"], [POST_TYPE_SOCIAL, "Social"], [POST_TYPE_NEWS, "Notícia"], [POST_TYPE_COMUNICADO, "Comunicado"], [POST_TYPE_POLL, "Enquete"]].map(([value, label]) => (
          <button key={String(value)} type="button" className={`filter-chip${type === value ? " is-active" : ""}`} onClick={() => setType(value as number | null)}>{label}</button>
        ))}
      </div>
      {isError ? (
        <p className="feed-api-posts__status feed-api-posts__status--error" role="alert">
          Não foi possível carregar todas as publicações do feed.
        </p>
      ) : null}
      {isLoading ? (
        <p className="feed-api-posts__status" aria-busy="true">
          Carregando publicações…
        </p>
      ) : null}
      <div
        className="feed-grid"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {columns.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="feed-column">
            {columnItems}
          </div>
        ))}
      </div>
    </div>
  );
}
