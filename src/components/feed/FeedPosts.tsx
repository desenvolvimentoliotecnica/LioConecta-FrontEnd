import { Children, type ReactNode, useEffect, useRef } from "react";
import { useFeed } from "../../api/hooks/useFeed";
import { config } from "../../api/client";
import { FeedPostCard } from "./FeedPostCard";
import { distributeRoundRobin, useFeedColumnCount } from "./feed-masonry";
import { useFeedPostDeepLink } from "./useFeedPostDeepLink";
import "./feed-deep-link.css";

type FeedPostsProps = {
  /** Card(s) no início do masonry (ex.: MoodCheck), na mesma ordem L→R. */
  leading?: ReactNode;
};

export function FeedPosts({ leading }: FeedPostsProps = {}) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();
  const columnCount = useFeedColumnCount();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  useFeedPostDeepLink(posts, isLoading);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const root =
      node.closest<HTMLElement>(".main.main--feed-scroll") ??
      document.querySelector<HTMLElement>(".main.main--feed-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: "320px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, posts.length]);

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
      {hasNextPage ? (
        <div ref={loadMoreRef} className="feed-api-posts__sentinel" aria-hidden="true" />
      ) : null}
      {isFetchingNextPage ? (
        <p className="feed-api-posts__status" aria-busy="true">
          Carregando mais publicações…
        </p>
      ) : null}
    </div>
  );
}
