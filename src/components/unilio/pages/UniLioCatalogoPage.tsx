import { useEffect, useState } from "react";
import { useUniLioCatalog } from "../../../api/hooks/useUniLioCatalog";
import { useUniLioFilters } from "../UniLioAccessGate";
import { UniLioCourseCard } from "../UniLioCourseCard";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioFilterBar } from "../UniLioFilterBar";
import "../../../styles/unilio-catalog.css";

const PAGE_SIZE = 12;
const VIEW_STORAGE_KEY = "unilio.catalog.view";

type CatalogViewMode = "list" | "cards";

function readViewMode(): CatalogViewMode {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === "cards" ? "cards" : "list";
  } catch {
    return "list";
  }
}

export function UniLioCatalogoPage() {
  const { filters } = useUniLioFilters();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<CatalogViewMode>(readViewMode);

  useEffect(() => {
    setPage(1);
  }, [filters.area, filters.contentType, filters.status, filters.search, filters.period, filters.department]);

  const { data, isLoading, isFallback } = useUniLioCatalog({
    ...filters,
    page,
    pageSize: PAGE_SIZE,
  });

  function handleViewChange(mode: CatalogViewMode) {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  if (isLoading) {
    return (
      <main className="unilio-page unilio-page--catalog">
        <p className="unilio-page__loading">Carregando catálogo…</p>
      </main>
    );
  }

  const rangeStart = data.totalCount === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const rangeEnd = Math.min(data.page * data.pageSize, data.totalCount);

  return (
    <main className="unilio-page unilio-page--catalog">
      <div className="unilio-catalog-page-head">
        <h1 className="unilio-page__title">Catálogo</h1>
        <p className="unilio-page__desc">
          {data.totalCount} curso{data.totalCount !== 1 ? "s" : ""} disponíve{data.totalCount !== 1 ? "is" : "l"}.
        </p>
      </div>

      <div className="unilio-catalog-toolbar-row">
        <UniLioFilterBar className="unilio-catalog-filter-bar" />
      </div>

      <div className="unilio-catalog-view-row">
        <div className="unilio-catalog-view-toggle" role="group" aria-label="Modo de exibição">
          <button
            type="button"
            className={`unilio-catalog-view-toggle__btn${viewMode === "list" ? " is-active" : ""}`}
            aria-pressed={viewMode === "list"}
            onClick={() => handleViewChange("list")}
          >
            <i className="fa-solid fa-list" aria-hidden="true" /> Lista
          </button>
          <button
            type="button"
            className={`unilio-catalog-view-toggle__btn${viewMode === "cards" ? " is-active" : ""}`}
            aria-pressed={viewMode === "cards"}
            onClick={() => handleViewChange("cards")}
          >
            <i className="fa-solid fa-grip" aria-hidden="true" /> Cards
          </button>
        </div>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      {data.totalCount > 0 ? (
        <p className="unilio-catalog-toolbar__meta">
          Exibindo {rangeStart}–{rangeEnd} de {data.totalCount}
        </p>
      ) : null}

      <div className={viewMode === "list" ? "unilio-catalog-list" : "unilio-catalog-grid"}>
        {data.items.map((course) => (
          <UniLioCourseCard key={course.id} course={course} variant={viewMode === "list" ? "list" : "card"} />
        ))}
      </div>

      {data.items.length === 0 ? (
        <p className="unilio-panel__empty">Nenhum curso encontrado com os filtros atuais.</p>
      ) : null}

      {data.totalPages > 1 ? (
        <div className="unilio-catalog-pagination">
          <span className="unilio-catalog-pagination__info">
            Página {data.page} de {data.totalPages}
          </span>
          <div className="unilio-catalog-pagination__actions">
            <button
              type="button"
              className="unilio-shell__reset"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className="unilio-shell__reset"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
