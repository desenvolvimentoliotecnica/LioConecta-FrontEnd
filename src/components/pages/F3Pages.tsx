import { useState } from "react";
import { PermissionGate } from "../auth/PermissionGate";
import { useCreateFeedback, useFeedback, useMoodMetrics, useUpdateFeedback } from "../../api/hooks/useF3";
import { PERMISSIONS } from "../../config/rbac/permissions";
import {
  FEEDBACK_CATEGORY_SUGGESTION,
  FEEDBACK_STATUS_CLOSED,
  FEEDBACK_STATUS_IN_REVIEW,
  FEEDBACK_STATUS_RECEIVED,
  FEEDBACK_STATUS_RESPONDED,
  type FeedbackCategory,
  type FeedbackStatus,
} from "../../api/types";

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  [FEEDBACK_STATUS_RECEIVED]: "Recebido",
  [FEEDBACK_STATUS_IN_REVIEW]: "Em análise",
  [FEEDBACK_STATUS_RESPONDED]: "Respondido",
  [FEEDBACK_STATUS_CLOSED]: "Encerrado",
};

export function MoodAnalyticsPage() {
  const metrics = useMoodMetrics();
  return (
    <PermissionGate
      permission={PERMISSIONS.mood.analytics}
      fallback={
        <main className="main">
          <p className="page-empty-note">Você não tem permissão para visualizar o clima.</p>
        </main>
      }
    >
      <main className="main">
        <header className="page-header">
          <h1 className="page-header__title">Clima organizacional</h1>
          <p className="page-header__desc">Acompanhamento consolidado das respostas de humor (sem identificação individual).</p>
        </header>
        {metrics.isLoading ? (
          <p className="page-empty-note">Carregando métricas...</p>
        ) : metrics.data ? (
          <>
            <section className="docs-hub__grid">
              <article className="docs-hub__card">
                <span className="docs-hub__card-title">{metrics.data.total}</span>
                <span className="docs-hub__card-desc">Respostas no período</span>
              </article>
              {Object.entries(metrics.data.byMood).map(([mood, total]) => (
                <article className="docs-hub__card" key={mood}>
                  <span className="docs-hub__card-title">{total}</span>
                  <span className="docs-hub__card-desc">{mood}</span>
                </article>
              ))}
            </section>
            <section className="docs-hub__controls">
              <h2>Respostas por dia</h2>
              {metrics.data.daily.map((day) => (
                <div
                  key={day.date}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr 50px",
                    gap: 12,
                    alignItems: "center",
                    margin: "8px 0",
                  }}
                >
                  <span>{new Date(day.date).toLocaleDateString("pt-BR")}</span>
                  <span style={{ height: 10, background: "#e6eaf0", borderRadius: 8 }}>
                    <span
                      style={{
                        display: "block",
                        width: `${Math.min(100, (day.total / Math.max(1, metrics.data.total)) * 100)}%`,
                        height: "100%",
                        background: "#1267b3",
                        borderRadius: 8,
                      }}
                    />
                  </span>
                  <span>{day.total}</span>
                </div>
              ))}
            </section>
            <section className="docs-hub__controls">
              <h2>Por departamento</h2>
              <table>
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Respostas</th>
                    <th>Distribuição</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.data.byDepartment.map((department) => (
                    <tr key={department.departmentName}>
                      <td>{department.departmentName}</td>
                      <td>{department.total}</td>
                      <td>
                        {Object.entries(department.byMood)
                          .map(([mood, total]) => `${mood}: ${total}`)
                          .join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <p className="page-empty-note">Não foi possível carregar as métricas.</p>
        )}
      </main>
    </PermissionGate>
  );
}

export function FeedbackPage() {
  const createFeedback = useCreateFeedback();
  const [category, setCategory] = useState<FeedbackCategory>(FEEDBACK_CATEGORY_SUGGESTION);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <main className="main">
      <header className="page-header">
        <h1 className="page-header__title">Feedback</h1>
        <p className="page-header__desc">Compartilhe sugestões, elogios ou pontos de melhoria.</p>
      </header>
      <form
        className="docs-hub__controls"
        onSubmit={(event) => {
          event.preventDefault();
          void createFeedback
            .mutateAsync({
              category,
              subject: subject.trim() || "Feedback",
              message: message.trim(),
              isAnonymous: anonymous,
            })
            .then(() => {
              setSubject("");
              setMessage("");
              setSuccess(true);
            });
        }}
      >
        <label>
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(Number(event.target.value) as FeedbackCategory)}
          >
            <option value={0}>Sugestão</option>
            <option value={1}>Elogio</option>
            <option value={2}>Reclamação</option>
            <option value={3}>Outro</option>
          </select>
        </label>
        <label>
          Assunto
          <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} />
        </label>
        <label>
          Mensagem
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength={3} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
          />{" "}
          Enviar anonimamente
        </label>
        <button className="official-card__cta" disabled={createFeedback.isPending}>
          {createFeedback.isPending ? "Enviando..." : "Enviar feedback"}
        </button>
        {success ? <p role="status">Feedback enviado. Obrigado por contribuir.</p> : null}
      </form>
    </main>
  );
}

export function FeedbackTriagePage() {
  const feedback = useFeedback();
  const update = useUpdateFeedback();

  return (
    <PermissionGate
      permission={PERMISSIONS.feedback.triage}
      fallback={
        <main className="main">
          <p className="page-empty-note">Você não tem permissão para triar feedbacks.</p>
        </main>
      }
    >
      <main className="main">
        <header className="page-header">
          <h1 className="page-header__title">Triagem de feedback</h1>
          <p className="page-header__desc">Acompanhe e responda às mensagens recebidas.</p>
        </header>
        {feedback.data?.length ? (
          <section className="official-list">
            {feedback.data.map((item) => {
              const status = Number(item.status) as FeedbackStatus;
              return (
                <article className="official-card" key={item.id}>
                  <div className="official-card__body">
                    <div className="official-card__meta">
                      <span className="tag">{STATUS_LABEL[status] ?? String(item.status)}</span>
                      <span className="official-card__date">{item.subject}</span>
                    </div>
                    <p className="official-card__excerpt">{item.message}</p>
                    <textarea
                      defaultValue={item.responseText ?? ""}
                      placeholder="Resposta"
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        if (value !== (item.responseText ?? "")) {
                          void update.mutateAsync({
                            id: item.id,
                            body: {
                              status: FEEDBACK_STATUS_RESPONDED,
                              responseText: value,
                            },
                          });
                        }
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="official-card__cta"
                        onClick={() =>
                          void update.mutateAsync({
                            id: item.id,
                            body: { status: FEEDBACK_STATUS_IN_REVIEW, responseText: item.responseText },
                          })
                        }
                      >
                        Em análise
                      </button>
                      <button
                        type="button"
                        className="official-card__cta"
                        onClick={() =>
                          void update.mutateAsync({
                            id: item.id,
                            body: { status: FEEDBACK_STATUS_CLOSED, responseText: item.responseText },
                          })
                        }
                      >
                        Encerrar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <p className="page-empty-note">Nenhum feedback para triagem.</p>
        )}
      </main>
    </PermissionGate>
  );
}
