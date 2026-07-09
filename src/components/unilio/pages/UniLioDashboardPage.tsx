import { Link } from "react-router-dom";
import { useUniLioDashboard } from "../../../api/hooks/useUniLioDashboard";
import { useUniLioPaths } from "../../../api/hooks/useUniLioPaths";
import { useUniLioFilters } from "../UniLioAccessGate";
import { UniLioCourseCard } from "../UniLioCourseCard";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioKpiGrid } from "../UniLioKpiGrid";
import { UniLioAlertsPanel, UniLioPanel, UniLioProgressBar } from "../UniLioShared";
import { UniLioPathDiagram } from "../UniLioPathDiagram";
import "../../../styles/unilio-dashboard.css";

export function UniLioDashboardPage() {
  const { filters } = useUniLioFilters();
  const { data: view, isLoading, isFallback } = useUniLioDashboard(filters);
  const { data: paths } = useUniLioPaths();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando dashboard…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Visão Geral</h1>
        <p className="unilio-page__desc">Seu painel de aprendizagem — cursos, trilhas e próximos passos.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioKpiGrid kpis={view.kpis} />

      {view.activePath ? (
        <UniLioPanel title="Trilha ativa" desc={view.activePath.description} link="/unilio/trilhas" linkLabel="Ver trilhas">
          <h3>{view.activePath.title}</h3>
          <UniLioProgressBar value={view.activePath.progressPct} />
          <p>
            {view.activePath.completedCourses} de {view.activePath.courseCount} cursos concluídos
          </p>
        </UniLioPanel>
      ) : null}

      <div className="unilio-dashboard__grid">
        <UniLioAlertsPanel alerts={view.alerts} />
        <UniLioPanel title="Próximos passos" link="/unilio/catalogo" linkLabel="Ver catálogo completo">
          <div className="unilio-catalog-grid unilio-catalog-grid--compact">
            {view.nextSteps.map((course) => (
              <UniLioCourseCard key={course.id} course={course} compact />
            ))}
          </div>
        </UniLioPanel>
      </div>

      <UniLioPanel title="Trilhas disponíveis">
        <UniLioPathDiagram paths={paths.items} activePathId={view.activePath?.id} />
      </UniLioPanel>

      <UniLioPanel title="Recomendações para você" link="/unilio/recomendacoes">
        <ul className="unilio-recommendation-list">
          {view.topRecommendations.map((rec) => (
            <li key={rec.courseId}>
              <Link to={`/unilio/curso/${rec.courseId}`}>
                <strong>{rec.title}</strong>
              </Link>
              <span>{rec.reason}</span>
            </li>
          ))}
        </ul>
      </UniLioPanel>
    </main>
  );
}
