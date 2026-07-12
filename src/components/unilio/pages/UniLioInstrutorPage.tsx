import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUniLioInstructorCourses } from "../../../api/hooks/useUniLioInstructorCourses";
import { useUniLioInstructorQuestions } from "../../../api/hooks/useUniLioQuestions";
import {
  useUniLioAuthoringCourses,
  useWithdrawUniLioCourse,
} from "../../../api/hooks/useUniLioAuthoring";
import { usePermissions } from "../../../hooks/usePermissions";
import { mergeInstructorCourses } from "../instructorCoursesModel";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioInstructorCoursesTable } from "../UniLioInstructorCoursesTable";
import "../../../styles/unilio-aprovacao.css";
import "../../../styles/unilio-questions.css";
import "../../../styles/unilio-instrutor-page.css";

export function UniLioInstrutorPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission("unilio.courses.approve");
  const { data: instructorMetrics, isLoading, isFallback } = useUniLioInstructorCourses();
  const { data: authoringCourses = [], isLoading: authoringLoading } = useUniLioAuthoringCourses();
  const { data: instructorQuestions } = useUniLioInstructorQuestions({ pageSize: 1 });
  const withdrawCourse = useWithdrawUniLioCourse();

  const courses = useMemo(
    () => mergeInstructorCourses(authoringCourses, instructorMetrics.items),
    [authoringCourses, instructorMetrics.items],
  );

  const pendingCount = useMemo(
    () => courses.filter((c) => c.status === "pending_approval").length,
    [courses],
  );

  async function handleEditPending(courseId: string) {
    try {
      await withdrawCourse.mutateAsync(courseId);
      navigate(`/unilio/instrutor/curso/${courseId}/editar`);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Não foi possível reverter o curso para rascunho. Tente novamente.",
      );
    }
  }

  async function handleWithdrawOnly(courseId: string) {
    try {
      await withdrawCourse.mutateAsync(courseId);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Não foi possível reverter o curso para rascunho. Tente novamente.",
      );
    }
  }

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
        <div className="unilio-authoring-form__actions unilio-instrutor-page__actions">
          <Link to="/unilio/instrutor/curso/novo/editar" className="unilio-player__complete-btn" style={{ textDecoration: "none" }}>
            Novo curso
          </Link>
          <Link
            to="/unilio/instrutor/curso/novo/editar?tipo=scorm"
            className="unilio-player__help-btn unilio-instrutor-page__scorm-btn"
            style={{ textDecoration: "none" }}
          >
            <i className="fa-solid fa-file-zipper" aria-hidden="true" />
            Novo curso SCORM
          </Link>
          <Link to="/unilio/instrutor/duvidas" className="unilio-player__help-btn" style={{ textDecoration: "none" }}>
            <i className="fa-solid fa-inbox" aria-hidden="true" />
            Caixa de dúvidas
            {instructorQuestions.openCount > 0 ? (
              <span className="unilio-questions-inbox__unread">{instructorQuestions.openCount}</span>
            ) : null}
          </Link>
          {canApprove ? (
            <Link to="/unilio/admin/aprovacoes" className="unilio-player__help-btn" style={{ textDecoration: "none" }}>
              <i className="fa-solid fa-stamp" aria-hidden="true" />
              Aprovar cursos
              {pendingCount > 0 ? (
                <span className="unilio-questions-inbox__unread">{pendingCount}</span>
              ) : null}
            </Link>
          ) : null}
        </div>
      </div>

      {canApprove && pendingCount > 0 ? (
        <section className="unilio-authoring-pending-banner" style={{ marginBottom: "1rem" }}>
          <p>
            Há {pendingCount} curso{pendingCount === 1 ? "" : "s"} aguardando aprovação (incluindo os seus enviados).
            Abra a fila de aprovações para publicar.
          </p>
          <Link to="/unilio/admin/aprovacoes" className="unilio-player__complete-btn" style={{ textDecoration: "none" }}>
            Ir para aprovações
          </Link>
        </section>
      ) : null}

      <UniLioFallbackBanner show={isFallback} />

      <UniLioInstructorCoursesTable
        courses={courses}
        withdrawBusy={withdrawCourse.isPending}
        onEditPending={(courseId) => void handleEditPending(courseId)}
        onWithdraw={(courseId) => void handleWithdrawOnly(courseId)}
      />
    </main>
  );
}
