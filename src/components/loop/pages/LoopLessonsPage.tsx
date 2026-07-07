import { useMemo } from "react";
import { getLoopData } from "../../../utils/loopView";
import { formatLoopDate, getPersonName, getProjectName } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import "../../../styles/loop-dashboard.css";

export function LoopLessonsPage() {
  const { filters } = useLoopFilters();
  const lessons = useMemo(() => {
    const data = getLoopData();
    const projectIds = new Set(
      data.projects
        .filter((p) => !filters.projectId || p.id === filters.projectId)
        .filter((p) => !filters.teamId || p.teamId === filters.teamId)
        .map((p) => p.id),
    );
    return data.lessons.filter((l) => projectIds.has(l.projectId));
  }, [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Aprendizados</h1>
        <p className="loop-page__desc">Lições aprendidas que retroalimentam o próximo ciclo de planejamento.</p>
      </div>

      <div className="loop-lessons-grid">
        {lessons.map((l) => (
          <article key={l.id} className="loop-lesson-card">
            <div className="loop-lesson-card__category">{l.category}</div>
            <h2>{l.title}</h2>
            <p>{l.description}</p>
            <p className="loop-lesson-card__rec">
              <strong>Recomendação:</strong> {l.recommendation}
            </p>
            <footer>
              {getProjectName(getLoopData(), l.projectId)} · {getPersonName(getLoopData(), l.createdBy)} ·{" "}
              {formatLoopDate(l.createdAt)}
            </footer>
          </article>
        ))}
      </div>

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
