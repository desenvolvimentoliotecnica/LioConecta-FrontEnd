import { useFeed } from "../../api/hooks/useFeed";
import { config } from "../../api/client";
import { FeedPostCard } from "./FeedPostCard";

export function FeedPosts() {
  const { data, isLoading, isError } = useFeed();

  if (config.useMock) return null;

  const socialPosts = (data?.items ?? []).filter((post) => post.type === 0);

  if (isLoading) {
    return (
      <div className="feed-api-posts" aria-busy="true" aria-label="Carregando publicações">
        <p className="feed-api-posts__status">Carregando publicações…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="feed-api-posts" role="alert">
        <p className="feed-api-posts__status feed-api-posts__status--error">
          Não foi possível carregar as publicações do feed.
        </p>
      </div>
    );
  }

  if (socialPosts.length === 0) return null;

  return (
    <div className="feed-api-posts" aria-label="Publicações do feed">
      <div className="feed-grid">
        <div className="feed-column">
          {socialPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
