import { useEffect, useMemo, useState } from "react";
import { useFeedback, useUpdateFeedback } from "../../api/hooks/useF3";
import {
  FEEDBACK_CATEGORY_COMPLAINT,
  FEEDBACK_CATEGORY_OTHER,
  FEEDBACK_CATEGORY_PRAISE,
  FEEDBACK_CATEGORY_SUGGESTION,
  FEEDBACK_STATUS_CLOSED,
  FEEDBACK_STATUS_IN_REVIEW,
  FEEDBACK_STATUS_RECEIVED,
  FEEDBACK_STATUS_RESPONDED,
  type FeedbackCategory,
  type FeedbackDto,
  type FeedbackStatus,
} from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePortalConfirm } from "../../hooks/usePortalConfirm";
import { PermissionGate } from "../auth/PermissionGate";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { UserAvatar } from "../ui/UserAvatar";
import "../../styles/feedback-triage-page.css";

const STATUS_META: Record<
  FeedbackStatus,
  { label: string; className: string; icon: string }
> = {
  [FEEDBACK_STATUS_RECEIVED]: {
    label: "Recebido",
    className: "feedback-triage__badge--received",
    icon: "fa-inbox",
  },
  [FEEDBACK_STATUS_IN_REVIEW]: {
    label: "Em análise",
    className: "feedback-triage__badge--review",
    icon: "fa-magnifying-glass",
  },
  [FEEDBACK_STATUS_RESPONDED]: {
    label: "Respondido",
    className: "feedback-triage__badge--responded",
    icon: "fa-check",
  },
  [FEEDBACK_STATUS_CLOSED]: {
    label: "Encerrado",
    className: "feedback-triage__badge--closed",
    icon: "fa-lock",
  },
};

const CATEGORY_META: Record<FeedbackCategory, { label: string; icon: string }> = {
  [FEEDBACK_CATEGORY_SUGGESTION]: { label: "Sugestão", icon: "fa-lightbulb" },
  [FEEDBACK_CATEGORY_PRAISE]: { label: "Elogio", icon: "fa-heart" },
  [FEEDBACK_CATEGORY_COMPLAINT]: { label: "Reclamação", icon: "fa-comment-dots" },
  [FEEDBACK_CATEGORY_OTHER]: { label: "Outro", icon: "fa-ellipsis" },
};

const FILTERS: Array<{ id: "all" | FeedbackStatus; label: string }> = [
  { id: "all", label: "Todos" },
  { id: FEEDBACK_STATUS_RECEIVED, label: "Recebidos" },
  { id: FEEDBACK_STATUS_IN_REVIEW, label: "Em análise" },
  { id: FEEDBACK_STATUS_RESPONDED, label: "Respondidos" },
  { id: FEEDBACK_STATUS_CLOSED, label: "Encerrados" },
];

type ToastState = { type: "success" | "error"; message: string } | null;

function normalizeStatus(value: FeedbackDto["status"]): FeedbackStatus {
  return Number(value) as FeedbackStatus;
}

function normalizeCategory(value: FeedbackDto["category"]): FeedbackCategory {
  return Number(value) as FeedbackCategory;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedbackCard({
  item,
  busy,
  onSaveResponse,
  onSetStatus,
}: {
  item: FeedbackDto;
  busy: boolean;
  onSaveResponse: (item: FeedbackDto, responseText: string) => Promise<void>;
  onSetStatus: (item: FeedbackDto, status: FeedbackStatus, responseText?: string) => Promise<void>;
}) {
  const status = normalizeStatus(item.status);
  const category = normalizeCategory(item.category);
  const statusMeta = STATUS_META[status];
  const categoryMeta = CATEGORY_META[category];
  const [draft, setDraft] = useState(item.responseText ?? "");

  useEffect(() => {
    setDraft(item.responseText ?? "");
  }, [item.id, item.responseText]);

  const authorLabel = item.isAnonymous
    ? "Anônimo"
    : item.author?.name?.trim() || "Colaborador";

  return (
    <article className="feedback-triage__card">
      <div className="feedback-triage__card-head">
        <div className="feedback-triage__badges">
          <span className={`feedback-triage__badge ${statusMeta.className}`}>
            <i className={`fa-solid ${statusMeta.icon}`} aria-hidden="true" />
            {statusMeta.label}
          </span>
          <span className="feedback-triage__badge feedback-triage__badge--category">
            <i className={`fa-solid ${categoryMeta.icon}`} aria-hidden="true" />
            {categoryMeta.label}
          </span>
        </div>
        <div className="feedback-triage__author">
          {item.isAnonymous ? (
            <span className="feedback-triage__avatar avatar avatar--placeholder" aria-hidden="true">
              <i className="fa-solid fa-user-secret" />
            </span>
          ) : (
            <UserAvatar className="feedback-triage__avatar avatar" photoUrl={item.author?.photoUrl} />
          )}
          <div>
            <p className="feedback-triage__author-name">{authorLabel}</p>
            <p className="feedback-triage__author-meta">
              {item.isAnonymous
                ? "Identidade ocultada"
                : item.author?.departmentName || item.author?.title || "Sem área informada"}
            </p>
          </div>
        </div>
      </div>

      <div className="feedback-triage__meta">
        {item.createdAt ? (
          <span>
            <i className="fa-regular fa-clock" aria-hidden="true" />
            Recebido em {formatDateTime(item.createdAt)}
          </span>
        ) : null}
        {item.respondedAt ? (
          <span>
            <i className="fa-solid fa-reply" aria-hidden="true" />
            Respondido em {formatDateTime(item.respondedAt)}
          </span>
        ) : null}
      </div>

      <h2 className="feedback-triage__subject">{item.subject || "Sem assunto"}</h2>
      <p className="feedback-triage__message">{item.message}</p>

      <div className="feedback-triage__response">
        <label htmlFor={`feedback-response-${item.id}`}>Resposta do RH</label>
        <textarea
          id={`feedback-response-${item.id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva a resposta para o colaborador..."
          disabled={status === FEEDBACK_STATUS_CLOSED || busy}
        />
      </div>

      <div className="feedback-triage__actions">
        {status !== FEEDBACK_STATUS_IN_REVIEW && status !== FEEDBACK_STATUS_CLOSED ? (
          <button
            type="button"
            className="feedback-triage__btn feedback-triage__btn--secondary"
            disabled={busy}
            onClick={() => void onSetStatus(item, FEEDBACK_STATUS_IN_REVIEW, draft)}
          >
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            Em análise
          </button>
        ) : null}

        {status !== FEEDBACK_STATUS_CLOSED ? (
          <button
            type="button"
            className="feedback-triage__btn feedback-triage__btn--primary"
            disabled={busy || draft.trim().length === 0}
            onClick={() => void onSaveResponse(item, draft)}
          >
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
            Salvar resposta
          </button>
        ) : null}

        {status !== FEEDBACK_STATUS_CLOSED ? (
          <button
            type="button"
            className="feedback-triage__btn feedback-triage__btn--danger"
            disabled={busy}
            onClick={() => void onSetStatus(item, FEEDBACK_STATUS_CLOSED, draft)}
          >
            <i className="fa-solid fa-lock" aria-hidden="true" />
            Encerrar
          </button>
        ) : null}
      </div>
    </article>
  );
}

function FeedbackTriageContent() {
  const feedback = useFeedback();
  const update = useUpdateFeedback();
  const { ask, confirmModal } = usePortalConfirm();
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const items = feedback.data ?? [];

  const counts = useMemo(() => {
    const base = {
      received: 0,
      review: 0,
      responded: 0,
      closed: 0,
    };
    for (const item of items) {
      const status = normalizeStatus(item.status);
      if (status === FEEDBACK_STATUS_RECEIVED) base.received += 1;
      if (status === FEEDBACK_STATUS_IN_REVIEW) base.review += 1;
      if (status === FEEDBACK_STATUS_RESPONDED) base.responded += 1;
      if (status === FEEDBACK_STATUS_CLOSED) base.closed += 1;
    }
    return base;
  }, [items]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return items
      .filter((item) => (filter === "all" ? true : normalizeStatus(item.status) === filter))
      .filter((item) => {
        if (!normalized) return true;
        const author = item.isAnonymous ? "anônimo" : item.author?.name ?? "";
        const haystack =
          `${item.subject} ${item.message} ${item.responseText ?? ""} ${author}`.toLocaleLowerCase(
            "pt-BR",
          );
        return haystack.includes(normalized);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, items, query]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function handleSaveResponse(item: FeedbackDto, responseText: string) {
    const trimmed = responseText.trim();
    if (!trimmed) return;
    try {
      await update.mutateAsync({
        id: item.id,
        body: { status: FEEDBACK_STATUS_RESPONDED, responseText: trimmed },
      });
      showToast("success", "Resposta salva com sucesso.");
    } catch {
      showToast("error", "Não foi possível salvar a resposta.");
    }
  }

  async function handleSetStatus(
    item: FeedbackDto,
    status: FeedbackStatus,
    responseText?: string,
  ) {
    if (status === FEEDBACK_STATUS_CLOSED) {
      const confirmed = await ask({
        title: "Encerrar feedback?",
        message: "O item será marcado como encerrado e sairá da fila ativa de atendimento.",
        confirmLabel: "Encerrar",
        cancelLabel: "Cancelar",
        variant: "warning",
      });
      if (!confirmed) return;
    }

    try {
      await update.mutateAsync({
        id: item.id,
        body: {
          status,
          responseText: responseText?.trim() || item.responseText || null,
        },
      });
      showToast(
        "success",
        status === FEEDBACK_STATUS_CLOSED
          ? "Feedback encerrado."
          : `Status atualizado para ${STATUS_META[status].label.toLowerCase()}.`,
      );
    } catch {
      showToast("error", "Não foi possível atualizar o status.");
    }
  }

  return (
    <main className={`${sectionMainClass("rh")} feedback-triage`}>
      {toast ? (
        <div
          className={`feedback-triage__toast${toast.type === "error" ? " feedback-triage__toast--error" : ""}`}
          role="status"
        >
          <i
            className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}
            aria-hidden="true"
          />
          {toast.message}
        </div>
      ) : null}

      <SectionPageHead
        section="rh"
        title="Triagem de feedback"
        current="Triagem de feedback"
        description="Acompanhe, responda e encerre as mensagens recebidas dos colaboradores."
        toolbar={
          <div className="page-toolbar" aria-label="Filtros de triagem">
            <div className="page-toolbar__filters">
              <div className="page-filters" role="group" aria-label="Status">
                {FILTERS.map((item) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    className={`filter-chip${filter === item.id ? " is-active" : ""}`}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="page-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                className="page-search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar assunto, mensagem ou autor..."
                aria-label="Buscar feedbacks"
              />
            </label>
          </div>
        }
      />

      <section className="feedback-triage__kpis" aria-label="Resumo da fila">
        <article className="feedback-triage__kpi">
          <div className="feedback-triage__kpi-value">{counts.received}</div>
          <div className="feedback-triage__kpi-label">Recebidos</div>
        </article>
        <article className="feedback-triage__kpi">
          <div className="feedback-triage__kpi-value">{counts.review}</div>
          <div className="feedback-triage__kpi-label">Em análise</div>
        </article>
        <article className="feedback-triage__kpi">
          <div className="feedback-triage__kpi-value">{counts.responded}</div>
          <div className="feedback-triage__kpi-label">Respondidos</div>
        </article>
        <article className="feedback-triage__kpi">
          <div className="feedback-triage__kpi-value">{counts.closed}</div>
          <div className="feedback-triage__kpi-label">Encerrados</div>
        </article>
      </section>

      {feedback.isLoading ? <p className="page-empty-note">Carregando feedbacks...</p> : null}

      {!feedback.isLoading && visible.length > 0 ? (
        <section className="feedback-triage__list" aria-label="Fila de feedback">
          {visible.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              busy={update.isPending}
              onSaveResponse={handleSaveResponse}
              onSetStatus={handleSetStatus}
            />
          ))}
        </section>
      ) : null}

      {!feedback.isLoading && visible.length === 0 ? (
        <div className="feedback-triage__empty" role="status">
          <div className="feedback-triage__empty-icon" aria-hidden="true">
            <i className="fa-regular fa-comments" />
          </div>
          <h2 className="feedback-triage__empty-title">Nenhum feedback nesta fila</h2>
          <p className="feedback-triage__empty-text">
            Não há mensagens para o filtro selecionado. Ajuste o status ou a busca para ver outros
            itens.
          </p>
        </div>
      ) : null}

      {confirmModal}
    </main>
  );
}

export function FeedbackTriagePage() {
  return (
    <PermissionGate
      permission={PERMISSIONS.feedback.triage}
      fallback={
        <main className={sectionMainClass("rh")}>
          <p className="page-empty-note">Você não tem permissão para triar feedbacks.</p>
        </main>
      }
    >
      <FeedbackTriageContent />
    </PermissionGate>
  );
}
