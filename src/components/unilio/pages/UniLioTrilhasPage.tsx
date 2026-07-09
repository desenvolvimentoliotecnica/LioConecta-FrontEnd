import { useSearchParams } from "react-router-dom";
import { useUniLioPathDetail, useUniLioPaths } from "../../../api/hooks/useUniLioPaths";
import { UniLioCourseCard } from "../UniLioCourseCard";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioPanel, UniLioProgressBar } from "../UniLioShared";
import { UniLioPathDiagram } from "../UniLioPathDiagram";
import "../../../styles/unilio-dashboard.css";

export function UniLioTrilhasPage() {
  const [searchParams] = useSearchParams();
  const pathId = searchParams.get("path") ?? undefined;
  const { data: paths, isLoading, isFallback } = useUniLioPaths();
  const { data: pathDetail } = useUniLioPathDetail(pathId);

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando trilhas…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Trilhas de Aprendizagem</h1>
        <p className="unilio-page__desc">Percursos estruturados para desenvolvimento de competências.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioPathDiagram paths={paths.items} activePathId={pathId} />

      {pathDetail ? (
        <UniLioPanel title={pathDetail.title} desc={pathDetail.description}>
          <UniLioProgressBar value={pathDetail.progressPct} />
          <div className="unilio-catalog-grid">
            {pathDetail.courses.map((course) => (
              <UniLioCourseCard key={course.id} course={course} />
            ))}
          </div>
        </UniLioPanel>
      ) : null}
    </main>
  );
}
