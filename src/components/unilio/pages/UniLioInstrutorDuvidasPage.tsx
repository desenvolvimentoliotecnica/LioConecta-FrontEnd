import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useUniLioInstructorQuestionDetail,
  useUniLioInstructorQuestions,
  useUniLioMarkQuestionRead,
  useUniLioQuestionReply,
} from "../../../api/hooks/useUniLioQuestions";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioFilterBar } from "../UniLioFilterBar";
import { UniLioInstructorQuestionsTable } from "../UniLioInstructorQuestionsTable";
import { UniLioQuestionDetailModal } from "../UniLioQuestionDetailModal";
import "../../../styles/unilio-catalog.css";
import "../../../styles/unilio-instrutor-page.css";
import "../../../styles/unilio-questions.css";

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

  const handleSelect = (id: string) => {
    setSearchParams({ question: id });
  };

  const handleCloseModal = () => {
    setSearchParams({});
  };

  const handleReply = async () => {
    if (!selectedId || !replyBody.trim()) return;
    await replyMutation.mutateAsync({ questionId: selectedId, body: replyBody.trim() });
    setReplyBody("");
  };

  const answeredCount = data.items.filter((item) => item.status === "answered").length;

  if (isLoading) {
    return (
      <main className="unilio-page unilio-page--inbox">
        <p className="unilio-page__loading">Carregando caixa de dúvidas…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page unilio-page--inbox">
      <div className="unilio-inbox-page-head">
        <Link to="/unilio/instrutor" className="unilio-inbox-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Voltar ao painel do instrutor
        </Link>
        <h1 className="unilio-page__title">Caixa de dúvidas</h1>
        <p className="unilio-page__desc">
          Dúvidas enviadas pelos alunos nos seus cursos, com data, curso, módulo e visibilidade.
        </p>
      </div>

      <div className="unilio-instrutor-courses__summary unilio-inbox-summary">
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{data.items.length}</span>
          <span className="unilio-instrutor-courses__stat-label">Dúvidas</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{data.openCount}</span>
          <span className="unilio-instrutor-courses__stat-label">Abertas</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{answeredCount}</span>
          <span className="unilio-instrutor-courses__stat-label">Respondidas</span>
        </article>
        <article className="unilio-instrutor-courses__stat">
          <span className="unilio-instrutor-courses__stat-value">{data.unreadCount}</span>
          <span className="unilio-instrutor-courses__stat-label">Não lidas</span>
        </article>
      </div>

      <div className="unilio-catalog-toolbar-row">
        <UniLioFilterBar className="unilio-catalog-filter-bar" />
      </div>

      <UniLioFallbackBanner show={isFallback} />

      <div className="unilio-instrutor-courses__filters unilio-instrutor-courses__filters--inbox" role="group" aria-label="Filtrar dúvidas">
        <button
          type="button"
          className={`unilio-instrutor-courses__filter${!statusFilter && !unreadOnly ? " is-active" : ""}`}
          onClick={() => {
            setStatusFilter("");
            setUnreadOnly(false);
          }}
        >
          Todas
        </button>
        <button
          type="button"
          className={`unilio-instrutor-courses__filter${statusFilter === "open" ? " is-active" : ""}`}
          onClick={() => {
            setStatusFilter("open");
            setUnreadOnly(false);
          }}
        >
          Abertas
          {data.openCount > 0 ? (
            <span className="unilio-instrutor-courses__filter-badge">{data.openCount}</span>
          ) : null}
        </button>
        <button
          type="button"
          className={`unilio-instrutor-courses__filter${statusFilter === "answered" ? " is-active" : ""}`}
          onClick={() => {
            setStatusFilter("answered");
            setUnreadOnly(false);
          }}
        >
          Respondidas
        </button>
        <button
          type="button"
          className={`unilio-instrutor-courses__filter${unreadOnly ? " is-active" : ""}`}
          onClick={() => {
            setUnreadOnly((value) => !value);
            setStatusFilter("");
          }}
        >
          Não lidas
          {data.unreadCount > 0 ? (
            <span className="unilio-instrutor-courses__filter-badge">{data.unreadCount}</span>
          ) : null}
        </button>
      </div>

      <UniLioInstructorQuestionsTable
        items={data.items}
        selectedId={selectedId}
        openCount={data.openCount}
        onSelect={handleSelect}
      />

      {selectedId && detail ? (
        <UniLioQuestionDetailModal
          open
          mode="instructor"
          detail={detail}
          loading={detailLoading}
          replyBody={replyBody}
          replyBusy={replyMutation.isPending}
          onReplyBodyChange={setReplyBody}
          onReply={() => void handleReply()}
          onClose={handleCloseModal}
        />
      ) : null}
    </main>
  );
}
