import { Children, type ReactNode } from "react";
import { useFeed } from "../../api/hooks/useFeed";
import { config } from "../../api/client";
import { FeedPostCard } from "./FeedPostCard";
import { distributeRoundRobin, useFeedColumnCount } from "./feed-masonry";

type FeedPostsProps = {
  /** Card(s) no início do masonry (ex.: MoodCheck), na mesma ordem L→R. */
  leading?: ReactNode;
};

export function FeedPosts({ leading }: FeedPostsProps = {}) {
  const { data, isLoading, isError } = useFeed();
  const columnCount = useFeedColumnCount();

  if (config.useMock) return null;

  const posts = data?.items ?? [];
  const leadingItems = Children.toArray(leading).filter(Boolean);

  if (isLoading && leadingItems.length === 0) {
    return (
      <div className="feed-api-posts" aria-busy="true" aria-label="Carregando publicações">
        <p className="feed-api-posts__status">Carregando publicações…</p>
      </div>
    );
  }

  if (isError && posts.length === 0 && leadingItems.length === 0) {
    return (
      <div className="feed-api-posts" role="alert">
        <p className="feed-api-posts__status feed-api-posts__status--error">
          Não foi possível carregar as publicações do feed.
        </p>
      </div>
    );
  }

  const postNodes = posts.map((post) => <FeedPostCard key={post.id} post={post} />);
  const items = [...leadingItems, ...postNodes];

  if (items.length === 0) {
    if (isLoading) {
      return (
        <div className="feed-api-posts" aria-busy="true" aria-label="Carregando publicações">
          <p className="feed-api-posts__status">Carregando publicações…</p>
        </div>
      );
    }
    return null;
  }

  const columns = distributeRoundRobin(items, columnCount);

  return (
    <div className="feed-api-posts" aria-label="Publicações do feed">
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
