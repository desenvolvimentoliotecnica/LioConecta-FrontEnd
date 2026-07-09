import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useApproveUniLioCourse,
  usePendingUniLioCourses,
  useRejectUniLioCourse,
  useUniLioCourseApprovalReview,
} from "../../../api/hooks/useUniLioAuthoring";
import { formatUniLioDuration } from "../../../utils/unilioView";
import "../../../styles/unilio-aprovacao.css";

export function UniLioAprovacaoListPage() {
  const { data = [], isLoading } = usePendingUniLioCourses();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando fila de aprovação…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Aprovação de cursos</h1>
        <p className="unilio-page__desc">Cursos enviados por instrutores aguardando revisão.</p>
      </div>

      {data.length === 0 ? (
        <p className="unilio-panel__empty">Nenhum curso aguardando aprovação.</p>
      ) : (
        <div className="unilio-aprovacao-list">
          {data.map((course) => (
            <Link key={course.id} to={`/unilio/admin/aprovacoes/${course.id}`} className="unilio-aprovacao-list__item">
              <div>
                <strong>{course.title}</strong>
                <span>{course.area}</span>
              </div>
              <span className="unilio-aprovacao-list__meta">
                {course.moduleCount} módulo{course.moduleCount !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export function UniLioAprovacaoReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useUniLioCourseApprovalReview(courseId);
  const approve = useApproveUniLioCourse();
  const reject = useRejectUniLioCourse();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando revisão…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="unilio-page">
        <p className="unilio-panel__empty">Curso não encontrado ou não está aguardando aprovação.</p>
        <Link to="/unilio/admin/aprovacoes">Voltar à fila</Link>
      </main>
    );
  }

  async function handleApprove() {
    if (!courseId) return;
    await approve.mutateAsync(courseId);
    navigate("/unilio/admin/aprovacoes");
  }

  async function handleReject() {
    if (!courseId) return;
    const reason = window.prompt("Motivo da rejeição (opcional):") ?? undefined;
    await reject.mutateAsync({ courseId, reason: reason || undefined });
    navigate("/unilio/admin/aprovacoes");
  }

  return (
    <main className="unilio-page unilio-aprovacao-review">
      <div className="unilio-page__head">
        <Link to="/unilio/admin/aprovacoes" className="unilio-aprovacao-review__back">
          ← Fila de aprovação
        </Link>
        <h1 className="unilio-page__title">Revisão do curso</h1>
        <p className="unilio-page__desc">Curso aguardando aprovação</p>
      </div>

      <article className="unilio-aprovacao-panel">
        <header className="unilio-aprovacao-panel__hero">
          {data.thumbnailUrl ? (
            <img src={data.thumbnailUrl} alt="" className="unilio-aprovacao-panel__thumb" />
          ) : null}
          <div>
            <h2>{data.title}</h2>
            <p className="unilio-aprovacao-panel__meta">
              {data.area} · {formatUniLioDuration(data.durationMinutes)}
              {data.isMandatory ? " · Obrigatório" : ""}
            </p>
            <p className="unilio-aprovacao-panel__meta">
              Instrutor: {data.instructorName}
              {data.submittedByName ? ` · Enviado por ${data.submittedByName}` : ""}
            </p>
          </div>
        </header>

        <section>
          <h3>Descrição</h3>
          <p>{data.description}</p>
        </section>

        {data.tags.length > 0 ? (
          <section>
            <h3>Tags</h3>
            <p>{data.tags.join(", ")}</p>
          </section>
        ) : null}

        <section>
          <h3>Módulos ({data.modules.length})</h3>
          <ul className="unilio-aprovacao-panel__modules">
            {data.modules.map((m) => (
              <li key={`${m.sortOrder}-${m.title}`}>
                <span>{m.sortOrder}.</span> {m.title} — {m.contentType} — {formatUniLioDuration(m.durationMinutes)}
              </li>
            ))}
          </ul>
        </section>

        {data.assessment ? (
          <section>
            <h3>Avaliação final</h3>
            <p>
              {data.assessment.title} · nota mínima {data.assessment.passingScore}% ·{" "}
              {data.assessment.questionCount} questão{data.assessment.questionCount !== 1 ? "ões" : ""}
            </p>
          </section>
        ) : null}

        <footer className="unilio-aprovacao-panel__actions">
          <button type="button" className="unilio-shell__reset" onClick={() => void handleReject()} disabled={reject.isPending}>
            Rejeitar
          </button>
          <button type="button" className="unilio-player__complete-btn" onClick={() => void handleApprove()} disabled={approve.isPending}>
            {approve.isPending ? "Publicando…" : "Aprovar e publicar"}
          </button>
        </footer>
      </article>
    </main>
  );
}
