import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  useUniLioMarkQuestionRead,
  useUniLioMyQuestions,
} from "../../../api/hooks/useUniLioQuestions";
import { formatUniLioDateTime } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-questions.css";

function statusLabel(status: string) {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return "Aguardando resposta";
}

export function UniLioMinhasDuvidasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("question");

  const { data, isLoading, isFallback } = useUniLioMyQuestions({ pageSize: 50 });
  const markReadMutation = useUniLioMarkQuestionRead("learner");

  const highlighted = useMemo(
    () => data.items.find((item) => item.id === highlightId) ?? null,
    [data.items, highlightId],
  );

  useEffect(() => {
    if (!highlightId || !highlighted?.unread) return;
    void markReadMutation.mutateAsync(highlightId);
  }, [highlightId, highlighted?.unread, markReadMutation]);

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando suas dúvidas…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Minhas dúvidas</h1>
        <p className="unilio-page__desc">
          Acompanhe o status das dúvidas enviadas nos cursos e volte ao módulo para ver as respostas.
        </p>
        {data.unreadCount > 0 ? (
          <p className="unilio-module-questions__badge" style={{ display: "inline-flex" }}>
            {data.unreadCount} nova(s) resposta(s)
          </p>
        ) : null}
      </div>

      <UniLioFallbackBanner show={isFallback} />

      {highlighted ? (
        <section className="unilio-questions-inbox__detail" style={{ marginBottom: "1rem" }}>
          <h2>Dúvida selecionada</h2>
          <p>
            <strong>{highlighted.courseTitle}</strong>
            {highlighted.moduleTitle ? ` · ${highlighted.moduleTitle}` : " · Curso inteiro"}
          </p>
          <p>{highlighted.body}</p>
          <p className="unilio-module-questions__status">{statusLabel(highlighted.status)}</p>
          {highlighted.moduleId ? (
            <button
              type="button"
              className="unilio-player__complete-btn"
              style={{ marginTop: "0.75rem" }}
              onClick={() => navigate(`/unilio/curso/${highlighted.courseId}?modulo=${highlighted.moduleId}`)}
            >
              Abrir no módulo
            </button>
          ) : (
            <Link
              to={`/unilio/curso/${highlighted.courseId}`}
              className="unilio-module-questions__link"
              style={{ display: "inline-block", marginTop: "0.75rem" }}
            >
              Abrir curso
            </Link>
          )}
        </section>
      ) : null}

      <div className="unilio-questions-inbox__table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Curso</th>
              <th>Módulo</th>
              <th>Dúvida</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr
                key={item.id}
                style={{ cursor: "pointer", background: item.id === highlightId ? "#f0fdf4" : undefined }}
                onClick={() => navigate(`/unilio/minhas-duvidas?question=${item.id}`)}
              >
                <td>{formatUniLioDateTime(item.createdAt)}</td>
                <td>{item.courseTitle}</td>
                <td>{item.moduleTitle ?? "Curso inteiro"}</td>
                <td>{item.body.length > 80 ? `${item.body.slice(0, 80)}…` : item.body}</td>
                <td>
                  {statusLabel(item.status)}
                  {item.unread ? (
                    <span className="unilio-questions-inbox__unread" style={{ marginLeft: "0.35rem" }}>
                      !
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
