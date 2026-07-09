import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUniLioInstructorCourses } from "../../../api/hooks/useUniLioInstructorCourses";
import { useUniLioInstructorQuestions } from "../../../api/hooks/useUniLioQuestions";
import {
  useUniLioAuthoringCourses,
  useWithdrawUniLioCourse,
} from "../../../api/hooks/useUniLioAuthoring";
import { mergeInstructorCourses } from "../instructorCoursesModel";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioInstructorCoursesTable } from "../UniLioInstructorCoursesTable";
import "../../../styles/unilio-aprovacao.css";
import "../../../styles/unilio-questions.css";
import "../../../styles/unilio-instrutor-page.css";

export function UniLioInstrutorPage() {
  const navigate = useNavigate();
  const { data: instructorMetrics, isLoading, isFallback } = useUniLioInstructorCourses();
  const { data: authoringCourses = [], isLoading: authoringLoading } = useUniLioAuthoringCourses();
  const { data: instructorQuestions } = useUniLioInstructorQuestions({ pageSize: 1 });
  const withdrawCourse = useWithdrawUniLioCourse();

  const courses = useMemo(
    () => mergeInstructorCourses(authoringCourses, instructorMetrics.items),
    [authoringCourses, instructorMetrics.items],
  );

  async function handleEditPending(courseId: string) {
    await withdrawCourse.mutateAsync(courseId);
    navigate(`/unilio/instrutor/curso/${courseId}/editar`);
  }

  async function handleWithdrawOnly(courseId: string) {
    await withdrawCourse.mutateAsync(courseId);
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
        <div className="unilio-authoring-form__actions" style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/unilio/instrutor/curso/novo/editar" className="unilio-player__complete-btn" style={{ textDecoration: "none" }}>
            Novo curso
          </Link>
          <Link to="/unilio/instrutor/duvidas" className="unilio-player__help-btn" style={{ textDecoration: "none" }}>
            <i className="fa-solid fa-inbox" aria-hidden="true" />
            Caixa de dúvidas
            {instructorQuestions.openCount > 0 ? (
              <span className="unilio-questions-inbox__unread">{instructorQuestions.openCount}</span>
            ) : null}
          </Link>
        </div>
      </div>

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
