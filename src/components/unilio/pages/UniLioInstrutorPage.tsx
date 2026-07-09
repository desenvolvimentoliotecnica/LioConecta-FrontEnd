import { Link } from "react-router-dom";
import { useUniLioInstructorCourses } from "../../../api/hooks/useUniLioInstructorCourses";
import { useUniLioInstructorQuestions } from "../../../api/hooks/useUniLioQuestions";
import { useUniLioAuthoringCourses } from "../../../api/hooks/useUniLioAuthoring";
import { formatUniLioRating } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-aprovacao.css";
import "../../../styles/unilio-questions.css";

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "pending_approval":
      return "Aguardando aprovação";
    case "published":
      return "Publicado";
    case "rejected":
      return "Rejeitado";
    default:
      return status;
  }
}

export function UniLioInstrutorPage() {
  const { data, isLoading, isFallback } = useUniLioInstructorCourses();
  const { data: authoringCourses = [], isLoading: authoringLoading } = useUniLioAuthoringCourses();
  const { data: instructorQuestions } = useUniLioInstructorQuestions({ pageSize: 1 });

  if (isLoading || authoringLoading) {
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
        <div className="unilio-authoring-form__actions" style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/unilio/instrutor/curso/novo/editar" className="unilio-player__complete-btn" style={{ textDecoration: "none" }}>
            Novo curso
          </Link>
          <Link to="/unilio/instrutor/duvidas" className="unilio-player__help-btn" style={{ textDecoration: "none" }}>
            <i className="fa-solid fa-inbox" aria-hidden="true" />
            Caixa de dúvidas
            {instructorQuestions.unreadCount > 0 ? (
              <span className="unilio-questions-inbox__unread">{instructorQuestions.unreadCount}</span>
            ) : null}
          </Link>
        </div>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      {authoringCourses.length > 0 ? (
        <section className="unilio-authoring-modules" style={{ marginBottom: "1rem" }}>
          <h2>Meus cursos (autoria)</h2>
          <div className="unilio-table-wrap">
            <table className="audit-trail-page__table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Área</th>
                  <th>Módulos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {authoringCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.area}</td>
                    <td>{course.moduleCount}</td>
                    <td>{statusLabel(course.status)}</td>
                    <td>
                      {(course.status === "draft" || course.status === "rejected") && (
                        <Link to={`/unilio/instrutor/curso/${course.id}/editar`}>Editar</Link>
                      )}
                      {course.status === "pending_approval" && <span>Em revisão</span>}
                      {course.status === "published" && (
                        <Link to={`/unilio/curso/${course.id}`}>Ver no catálogo</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
                <td>{statusLabel(course.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
