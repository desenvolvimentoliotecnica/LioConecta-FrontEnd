import { useUniLioCommunity } from "../../../api/hooks/useUniLioCommunity";
import { useUniLioFilters } from "../UniLioAccessGate";
import { UniLioCommunityFeed } from "../UniLioCommunityFeed";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-community.css";

export function UniLioComunidadePage() {
  const { filters } = useUniLioFilters();
  const { data, isLoading, isFallback } = useUniLioCommunity(filters);

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando comunidade…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Comunidade</h1>
        <p className="unilio-page__desc">Discussões, dicas e novidades da universidade corporativa.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioCommunityFeed posts={data.items} />
    </main>
  );
}
