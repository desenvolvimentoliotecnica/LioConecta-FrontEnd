import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useUniLioInstructorQuestionDetail,
  useUniLioInstructorQuestions,
  useUniLioMarkQuestionRead,
  useUniLioQuestionReply,
} from "../../../api/hooks/useUniLioQuestions";
import { formatUniLioDateTime } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-questions.css";

function statusLabel(status: string) {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return "Aberta";
}

function visibilityLabel(visibility: string) {
  return visibility === "public" ? "Pública (FAQ)" : "Privada";
}

export function UniLioInstrutorDuvidasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("question");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isFallback } = useUniLioInstructorQuestions({
    status: statusFilter || undefined,
    unreadOnly,
    pageSize: 50,
  });

  const { data: detail, isLoading: detailLoading } = useUniLioInstructorQuestionDetail(selectedId);
  const replyMutation = useUniLioQuestionReply();
  const markReadMutation = useUniLioMarkQuestionRead("instructor");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (!selectedId || !detail?.unread) return;
    void markReadMutation.mutateAsync(selectedId);
  }, [selectedId, detail?.unread, markReadMutation]);

  useEffect(() => {
    setReplyBody("");
  }, [selectedId]);

  const selectedSummary = useMemo(
    () => data.items.find((item) => item.id === selectedId) ?? null,
    [data.items, selectedId],
  );

  const handleSelect = (id: string) => {
    setSearchParams({ question: id });
  };

  const handleReply = async () => {
    if (!selectedId || !replyBody.trim()) return;
    await replyMutation.mutateAsync({ questionId: selectedId, body: replyBody.trim() });
    setReplyBody("");
  };

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando caixa de dúvidas…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Caixa de dúvidas</h1>
        <p className="unilio-page__desc">
          Dúvidas enviadas pelos alunos nos seus cursos, com data, curso, módulo e visibilidade.
        </p>
        <Link to="/unilio/instrutor" className="unilio-module-questions__link">
          Voltar ao painel do instrutor
        </Link>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-questions-inbox__filters">
        <button
          type="button"
          className={`unilio-questions-inbox__filter${!statusFilter && !unreadOnly ? " is-active" : ""}`}
          onClick={() => {
            setStatusFilter("");
            setUnreadOnly(false);
          }}
        >
          Todas
        </button>
        <button
          type="button"
          className={`unilio-questions-inbox__filter${statusFilter === "open" ? " is-active" : ""}`}
          onClick={() => setStatusFilter("open")}
        >
          Abertas
        </button>
        <button
          type="button"
          className={`unilio-questions-inbox__filter${statusFilter === "answered" ? " is-active" : ""}`}
          onClick={() => setStatusFilter("answered")}
        >
          Respondidas
        </button>
        <button
          type="button"
          className={`unilio-questions-inbox__filter${unreadOnly ? " is-active" : ""}`}
          onClick={() => setUnreadOnly((v) => !v)}
        >
          Não lidas
          {data.unreadCount > 0 ? (
            <span className="unilio-questions-inbox__unread" style={{ marginLeft: "0.35rem" }}>
              {data.unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="unilio-questions-inbox__table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Módulo</th>
              <th>Dúvida</th>
              <th>Visibilidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr
                key={item.id}
                style={{ cursor: "pointer", background: item.id === selectedId ? "#f0fdf4" : undefined }}
                onClick={() => handleSelect(item.id)}
              >
                <td>{formatUniLioDateTime(item.createdAt)}</td>
                <td>{item.authorName}</td>
                <td>{item.courseTitle}</td>
                <td>{item.moduleTitle ?? "Curso inteiro"}</td>
                <td>{item.body.length > 80 ? `${item.body.slice(0, 80)}…` : item.body}</td>
                <td>{visibilityLabel(item.visibility)}</td>
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

      {selectedId ? (
        <section className="unilio-questions-inbox__detail">
          {detailLoading && !detail ? (
            <p>Carregando detalhe…</p>
          ) : detail ? (
            <>
              <h2>Detalhe da dúvida</h2>
              <p>
                <strong>{detail.authorName}</strong> · {detail.courseTitle}
                {detail.moduleTitle ? ` · ${detail.moduleTitle}` : " · Curso inteiro"} ·{" "}
                {formatUniLioDateTime(detail.createdAt)}
              </p>
              <div className="unilio-questions-inbox__thread">
                <div className="unilio-questions-inbox__bubble unilio-questions-inbox__bubble--learner">
                  {detail.body}
                </div>
                {detail.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`unilio-questions-inbox__bubble ${
                      reply.isInstructorReply
                        ? "unilio-questions-inbox__bubble--instructor"
                        : "unilio-questions-inbox__bubble--learner"
                    }`}
                  >
                    <strong>{reply.authorName}</strong>
                    <p style={{ margin: "0.35rem 0 0" }}>{reply.body}</p>
                    <small>{formatUniLioDateTime(reply.createdAt)}</small>
                  </div>
                ))}
              </div>

              {detail.status !== "closed" ? (
                <div className="unilio-questions-inbox__reply-form">
                  <label htmlFor="instructor-reply">Sua resposta</label>
                  <textarea
                    id="instructor-reply"
                    value={replyBody}
                    maxLength={2000}
                    placeholder="Escreva a resposta para o aluno…"
                    onChange={(e) => setReplyBody(e.target.value)}
                  />
                  <div className="unilio-questions-inbox__reply-actions">
                    <button
                      type="button"
                      className="unilio-player__complete-btn"
                      disabled={!replyBody.trim() || replyMutation.isPending}
                      onClick={() => void handleReply()}
                    >
                      {replyMutation.isPending ? "Enviando…" : "Responder aluno"}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : selectedSummary ? (
            <p>Não foi possível carregar o detalhe desta dúvida.</p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
