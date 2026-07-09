import { useUniLioInstructorCourses } from "../../../api/hooks/useUniLioInstructorCourses";
import { formatUniLioRating } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";

export function UniLioInstrutorPage() {
  const { data, isLoading, isFallback } = useUniLioInstructorCourses();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando cursos do instrutor…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Painel do Instrutor</h1>
        <p className="unilio-page__desc">Cursos sob sua responsabilidade e métricas de engajamento.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Área</th>
              <th>Matriculados</th>
              <th>Concluídos</th>
              <th>Avaliação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((course) => (
              <tr key={course.courseId}>
                <td>{course.title}</td>
                <td>{course.area}</td>
                <td>{course.enrolledCount}</td>
                <td>{course.completedCount}</td>
                <td>{formatUniLioRating(course.avgRating)}</td>
                <td>{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
