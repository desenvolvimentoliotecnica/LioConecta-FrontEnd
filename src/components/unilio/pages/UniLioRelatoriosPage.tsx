import { Link } from "react-router-dom";
import { useUniLioReports } from "../../../api/hooks/useUniLioReports";
import { useUniLioFilters } from "../UniLioAccessGate";
import { UniLioCourseCard } from "../UniLioCourseCard";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioPanel, UniLioProgressBar } from "../UniLioShared";
import { formatUniLioDate } from "../../../utils/unilioView";

export function UniLioRelatoriosPage() {
  const { filters } = useUniLioFilters();
  const { data, isLoading, isFallback } = useUniLioReports(filters);

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando relatórios…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Relatórios</h1>
        <p className="unilio-page__desc">Métricas executivas de aprendizagem e gaps de compliance.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-reports-metrics">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="unilio-report-metric">
            <span className="unilio-report-metric__value">{metric.value}</span>
            <span className="unilio-report-metric__label">{metric.label}</span>
            <span className="unilio-report-metric__delta">{metric.delta}</span>
          </article>
        ))}
      </div>

      <UniLioPanel title="Cursos mais acessados">
        <div className="unilio-catalog-grid unilio-catalog-grid--compact">
          {data.topCourses.map((course) => (
            <UniLioCourseCard key={course.id} course={course} compact />
          ))}
        </div>
      </UniLioPanel>

      <UniLioPanel title="Gaps de compliance">
        <div className="unilio-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Área</th>
                <th>Progresso</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {data.complianceGaps.map((gap) => (
                <tr key={gap.courseId}>
                  <td>
                    <Link to={`/unilio/curso/${gap.courseId}`}>{gap.title}</Link>
                  </td>
                  <td>{gap.area}</td>
                  <td><UniLioProgressBar value={gap.progressPct} /></td>
                  <td>{gap.dueDate ? formatUniLioDate(gap.dueDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UniLioPanel>
    </main>
  );
}
