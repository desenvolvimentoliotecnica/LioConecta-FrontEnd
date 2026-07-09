import { useUniLioCatalog } from "../../../api/hooks/useUniLioCatalog";
import { useUniLioFilters } from "../UniLioAccessGate";
import { UniLioCourseCard } from "../UniLioCourseCard";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-catalog.css";

export function UniLioCatalogoPage() {
  const { filters } = useUniLioFilters();
  const { data, isLoading, isFallback } = useUniLioCatalog({ ...filters, pageSize: 12 });

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando catálogo…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Catálogo</h1>
        <p className="unilio-page__desc">
          {data.totalCount} curso{data.totalCount !== 1 ? "s" : ""} disponíve{data.totalCount !== 1 ? "is" : "l"}.
        </p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-catalog-grid">
        {data.items.map((course) => (
          <UniLioCourseCard key={course.id} course={course} />
        ))}
      </div>

      {data.items.length === 0 ? <p className="unilio-panel__empty">Nenhum curso encontrado com os filtros atuais.</p> : null}
    </main>
  );
}
