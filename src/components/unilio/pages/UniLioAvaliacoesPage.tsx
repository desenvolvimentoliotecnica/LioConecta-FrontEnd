import { Link } from "react-router-dom";
import { useUniLioAssessments } from "../../../api/hooks/useUniLioAssessments";
import { formatUniLioDateTime } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioPanel } from "../UniLioShared";

export function UniLioAvaliacoesPage() {
  const { data, isLoading, isFallback } = useUniLioAssessments();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando avaliações…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Avaliações</h1>
        <p className="unilio-page__desc">Quizzes pendentes e histórico de tentativas.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <UniLioPanel title="Pendentes">
        {data.pending.length === 0 ? (
          <p className="unilio-panel__empty">Nenhuma avaliação pendente.</p>
        ) : (
          <ul className="unilio-assessment-list">
            {data.pending.map((a) => (
              <li key={a.id}>
                <Link to={`/unilio/curso/${a.courseId}`}>
                  <strong>{a.title}</strong>
                </Link>
                <span>{a.courseTitle} · Nota mínima: {a.passingScore}%</span>
              </li>
            ))}
          </ul>
        )}
      </UniLioPanel>

      <UniLioPanel title="Histórico">
        <div className="unilio-table-wrap">
          <table className="audit-trail-page__table">
            <thead>
              <tr>
                <th>Avaliação</th>
                <th>Curso</th>
                <th>Nota</th>
                <th>Resultado</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.courseTitle}</td>
                  <td>{a.lastScore ?? "—"}%</td>
                  <td>
                    <span className={`workers-status workers-status--${a.lastPassed ? "success" : "warning"}`}>
                      {a.lastPassed ? "Aprovado" : "Reprovado"}
                    </span>
                  </td>
                  <td>{a.lastAttemptedAt ? formatUniLioDateTime(a.lastAttemptedAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UniLioPanel>
    </main>
  );
}
