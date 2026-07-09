import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useUniLioMarkQuestionRead,
  useUniLioMyQuestionDetail,
  useUniLioMyQuestions,
} from "../../../api/hooks/useUniLioQuestions";
import { formatUniLioDateTime } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioQuestionDetailModal } from "../UniLioQuestionDetailModal";
import "../../../styles/unilio-questions.css";

function statusLabel(status: string) {
  if (status === "answered") return "Respondida";
  if (status === "closed") return "Encerrada";
  return "Aguardando resposta";
}

export function UniLioMinhasDuvidasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("question");

  const { data, isLoading, isFallback } = useUniLioMyQuestions({ pageSize: 50 });
  const { data: detail, isLoading: detailLoading } = useUniLioMyQuestionDetail(selectedId);
  const markReadMutation = useUniLioMarkQuestionRead("learner");

  useEffect(() => {
    if (!selectedId || !detail?.unread) return;
    void markReadMutation.mutateAsync(selectedId);
  }, [selectedId, detail?.unread, markReadMutation]);

  const handleCloseModal = () => {
    setSearchParams({});
  };

  const handleSelect = (id: string) => {
    setSearchParams({ question: id });
  };

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando suas dúvidas…</p>
      </main>
    );
  }

  const moduleHref =
    detail?.moduleId != null
      ? `/unilio/curso/${detail.courseId}?modulo=${detail.moduleId}`
      : undefined;

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
                style={{ cursor: "pointer", background: item.id === selectedId ? "#f0fdf4" : undefined }}
                onClick={() => handleSelect(item.id)}
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

      {selectedId && detail ? (
        <UniLioQuestionDetailModal
          open
          mode="learner"
          detail={detail}
          loading={detailLoading}
          moduleHref={moduleHref}
          onClose={handleCloseModal}
        />
      ) : null}
    </main>
  );
}
