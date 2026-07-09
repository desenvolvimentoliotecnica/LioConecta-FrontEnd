import { Link } from "react-router-dom";
import { useUniLioRecommendations } from "../../../api/hooks/useUniLioRecommendations";
import { formatUniLioDuration } from "../../../utils/unilioView";
import { UniLioContentTypeBadge } from "../UniLioShared";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";

export function UniLioRecomendacoesPage() {
  const { data, isLoading, isFallback } = useUniLioRecommendations();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando recomendações…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Recomendações</h1>
        <p className="unilio-page__desc">Cursos sugeridos com base no seu perfil e trilhas.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <ul className="unilio-recommendation-list unilio-recommendation-list--full">
        {data.items.map((rec) => (
          <li key={rec.courseId} className="unilio-recommendation-card">
            <Link to={`/unilio/curso/${rec.courseId}`}>
              <strong>{rec.title}</strong>
            </Link>
            <p>{rec.reason}</p>
            <div className="unilio-recommendation-card__meta">
              <UniLioContentTypeBadge type={rec.contentType} />
              <span>{rec.area}</span>
              <span>{formatUniLioDuration(rec.durationMinutes)}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
