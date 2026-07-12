import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useCreateFeedback, useMyFeedback } from "../../api/hooks/useF3";
import { useMe } from "../../api/hooks/useMe";
import {
  FEEDBACK_CATEGORY_COMPLAINT,
  FEEDBACK_CATEGORY_OTHER,
  FEEDBACK_CATEGORY_PRAISE,
  FEEDBACK_CATEGORY_SUGGESTION,
  type FeedbackCategory,
  type FeedbackDto,
  type PersonSummaryDto,
} from "../../api/types";
import { usePortalConfirm } from "../../hooks/usePortalConfirm";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { PersonTypeahead } from "../pessoas/RamaisTypeaheads";
import { UserAvatar } from "../ui/UserAvatar";
import "../../styles/feedback-page.css";
import "../../styles/portal-confirm-modal.css";
import "../../styles/ramais-page.css";

type FeedbackTab = "rh" | "peer" | "meus";

const CATEGORIES: Array<{
  value: FeedbackCategory;
  label: string;
  icon: string;
  hint: string;
}> = [
  {
    value: FEEDBACK_CATEGORY_SUGGESTION,
    label: "Sugestão",
    icon: "fa-lightbulb",
    hint: "Ideias para melhorar processos e o dia a dia.",
  },
  {
    value: FEEDBACK_CATEGORY_PRAISE,
    label: "Elogio",
    icon: "fa-heart",
    hint: "Reconheça alguém ou uma prática que funcionou bem.",
  },
  {
    value: FEEDBACK_CATEGORY_COMPLAINT,
    label: "Reclamação",
    icon: "fa-comment-dots",
    hint: "Relate um problema com clareza e respeito.",
  },
  {
    value: FEEDBACK_CATEGORY_OTHER,
    label: "Outro",
    icon: "fa-ellipsis",
    hint: "Qualquer outro ponto que queira compartilhar.",
  },
];

const TABS: Array<{ id: FeedbackTab; label: string; icon: string }> = [
  { id: "rh", label: "Para o RH", icon: "fa-building-user" },
  { id: "peer", label: "Para um colega", icon: "fa-user-group" },
  { id: "meus", label: "Meus feedbacks", icon: "fa-inbox" },
];

function categoryLabel(value: FeedbackCategory): string {
  return CATEGORIES.find((item) => item.value === Number(value))?.label ?? "Feedback";
}

function formatFeedbackDate(value?: string | null): string {
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

function resolveViewerRole(item: FeedbackDto, meId?: string | null): "received" | "sent" | "team" {
  if (meId && item.targetPersonId === meId) return "received";
  if (meId && item.author?.id === meId) return "sent";
  return "team";
}

const ROLE_META = {
  received: { label: "Recebido", className: "feedback-page__role--received" },
  sent: { label: "Enviado", className: "feedback-page__role--sent" },
  team: { label: "Equipe", className: "feedback-page__role--team" },
} as const;

function FeedbackInboxCard({ item, meId }: { item: FeedbackDto; meId?: string | null }) {
  const role = resolveViewerRole(item, meId);
  const roleMeta = ROLE_META[role];
  const authorLabel = item.isAnonymous ? "Anônimo" : item.author?.name || "Colaborador";

  return (
    <article className="feedback-page__inbox-card" id={`feedback-${item.id}`}>
      <div className="feedback-page__inbox-head">
        <span className={`feedback-page__role ${roleMeta.className}`}>{roleMeta.label}</span>
        <span className="feedback-page__inbox-category">{categoryLabel(item.category)}</span>
        <span className="feedback-page__inbox-date">{formatFeedbackDate(item.createdAt)}</span>
      </div>
      <h3 className="feedback-page__inbox-title">{item.subject || "Sem assunto"}</h3>
      <p className="feedback-page__inbox-message">{item.message}</p>
      <div className="feedback-page__inbox-meta">
        <span>
          De: <strong>{authorLabel}</strong>
        </span>
        {item.target?.name ? (
          <span>
            Para: <strong>{item.target.name}</strong>
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function FeedbackPage() {
  const { data: me } = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const createFeedback = useCreateFeedback();
  const { ask, confirmModal } = usePortalConfirm();

  const tabParam = searchParams.get("tab");
  const initialTab: FeedbackTab =
    tabParam === "peer" || tabParam === "meus" || tabParam === "recebidos"
      ? tabParam === "recebidos"
        ? "meus"
        : tabParam
      : "rh";
  const [tab, setTab] = useState<FeedbackTab>(initialTab);

  const myFeedback = useMyFeedback(tab === "meus");

  const [category, setCategory] = useState<FeedbackCategory>(FEEDBACK_CATEGORY_SUGGESTION);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [targetQuery, setTargetQuery] = useState("");
  const [targetPerson, setTargetPerson] = useState<PersonSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMode, setSuccessMode] = useState<"rh" | "peer">("rh");
  const [successAnonymous, setSuccessAnonymous] = useState(false);

  const collaboratorName = me?.name?.trim() || "Colaborador";
  const selectedCategory = CATEGORIES.find((item) => item.value === category) ?? CATEGORIES[0];

  useEffect(() => {
    const next: FeedbackTab =
      tabParam === "peer" || tabParam === "meus" || tabParam === "recebidos"
        ? tabParam === "recebidos"
          ? "meus"
          : tabParam
        : "rh";
    setTab(next);
  }, [tabParam]);

  useEffect(() => {
    const highlightId = searchParams.get("id");
    if (tab !== "meus" || !highlightId) return;
    const el = document.getElementById(`feedback-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tab, searchParams, myFeedback.data]);

  const inboxItems = useMemo(() => myFeedback.data ?? [], [myFeedback.data]);

  function selectTab(next: FeedbackTab) {
    setTab(next);
    setError(null);
    const params = new URLSearchParams(searchParams);
    if (next === "rh") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    setSearchParams(params, { replace: true });
  }

  function resetForm() {
    setSubject("");
    setMessage("");
    setAnonymous(false);
    setCategory(FEEDBACK_CATEGORY_SUGGESTION);
    setTargetQuery("");
    setTargetPerson(null);
  }

  async function handleSubmitRh(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 3 || createFeedback.isPending) return;

    const confirmed = await ask({
      title: "Enviar feedback ao RH?",
      message: anonymous
        ? "Seu feedback será enviado de forma anônima. O RH receberá a mensagem sem identificar o autor."
        : `O feedback será registrado em nome de ${collaboratorName}. Deseja continuar?`,
      confirmLabel: "Enviar",
      cancelLabel: "Revisar",
      variant: "default",
    });
    if (!confirmed) return;

    try {
      await createFeedback.mutateAsync({
        category,
        subject: subject.trim() || selectedCategory.label,
        message: trimmedMessage,
        isAnonymous: anonymous,
      });
      setSuccessMode("rh");
      setSuccessAnonymous(anonymous);
      resetForm();
      setSuccessOpen(true);
    } catch {
      setError("Não foi possível enviar o feedback. Tente novamente em instantes.");
    }
  }

  async function handleSubmitPeer(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedMessage = message.trim();
    if (!targetPerson || trimmedMessage.length < 3 || createFeedback.isPending) return;

    if (me?.id && targetPerson.id === me.id) {
      setError("Escolha outro colaborador — não é possível enviar feedback 1:1 para si mesmo.");
      return;
    }

    const confirmed = await ask({
      title: "Enviar feedback 1:1?",
      message: `A mensagem será enviada para ${targetPerson.name}. A pessoa e o gestor dela poderão ver o conteúdo. Seu nome ficará visível.`,
      confirmLabel: "Enviar",
      cancelLabel: "Revisar",
      variant: "default",
    });
    if (!confirmed) return;

    try {
      await createFeedback.mutateAsync({
        category,
        subject: subject.trim() || selectedCategory.label,
        message: trimmedMessage,
        isAnonymous: false,
        targetPersonId: targetPerson.id,
      });
      setSuccessMode("peer");
      setSuccessAnonymous(false);
      resetForm();
      setSuccessOpen(true);
    } catch {
      setError("Não foi possível enviar o feedback 1:1. Tente novamente em instantes.");
    }
  }

  return (
    <main className={`${sectionMainClass("rh")} feedback-page`}>
      <SectionPageHead
        section="rh"
        title="Feedback"
        current="Feedback"
        description="Canal com o RH e feedback 1:1 entre colegas — visível ao autor, à pessoa alvo e ao gestor dela."
      />

      <div className="feedback-page__tabs" role="tablist" aria-label="Modos de feedback">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`feedback-page__tab${tab === item.id ? " is-active" : ""}`}
            aria-selected={tab === item.id}
            onClick={() => selectTab(item.id)}
          >
            <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "rh" ? (
        <div className="feedback-page__layout">
          <section className="feedback-page__card" aria-label="Formulário de feedback para o RH">
            <h2 className="feedback-page__card-title">Como podemos melhorar juntos?</h2>
            <p className="feedback-page__card-desc">
              Sua mensagem ajuda o RH a entender o clima e priorizar ações. Escreva com clareza — o
              tom respeitoso faz diferença.
            </p>

            <form className="feedback-page__form" onSubmit={(event) => void handleSubmitRh(event)}>
              <CategoryField category={category} onChange={setCategory} selected={selectedCategory} />
              <SubjectField value={subject} onChange={setSubject} />
              <MessageField value={message} onChange={setMessage} />

              <div
                className={`feedback-page__identity${anonymous ? " is-anonymous" : ""}`}
                aria-live="polite"
              >
                {anonymous ? (
                  <span className="feedback-page__avatar avatar avatar--placeholder" aria-hidden="true">
                    <i className="fa-solid fa-user-secret" />
                  </span>
                ) : (
                  <UserAvatar className="feedback-page__avatar avatar" photoUrl={me?.photoUrl} />
                )}
                <div className="feedback-page__identity-body">
                  {anonymous ? (
                    <>
                      <p className="feedback-page__identity-name">Envio anônimo</p>
                      <p className="feedback-page__identity-meta">
                        Seu nome não será exibido na triagem do RH.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="feedback-page__identity-name">{collaboratorName}</p>
                      <p className="feedback-page__identity-meta">
                        {[me?.title, me?.departmentName].filter(Boolean).join(" · ") ||
                          "O feedback será associado ao seu perfil."}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <label className="feedback-page__checkbox">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                />
                <span>
                  Enviar anonimamente
                  <span className="feedback-page__hint" style={{ display: "block", marginTop: 2 }}>
                    Ideal quando preferir não se identificar. O conteúdo continua sendo tratado com
                    confidencialidade.
                  </span>
                </span>
              </label>

              {error ? (
                <p className="feedback-page__error" role="alert">
                  {error}
                </p>
              ) : null}

              <SubmitButton pending={createFeedback.isPending} disabled={message.trim().length < 3} />
            </form>
          </section>

          <aside className="feedback-page__aside" aria-label="Orientações">
            <div className="feedback-page__tip">
              <h2 className="feedback-page__tip-title">
                <i className="fa-solid fa-shield-heart" aria-hidden="true" />
                Canal seguro com o RH
              </h2>
              <p>
                O RH recebe as mensagens com cuidado. Feedbacks identificados permitem retorno
                direto; anônimos ajudam a mapear temas sensíveis.
              </p>
              <ul>
                <li>Seja específico: o quê, quando e impacto.</li>
                <li>Foque em fatos e melhorias possíveis.</li>
                <li>Evite dados pessoais de terceiros.</li>
              </ul>
            </div>
          </aside>
        </div>
      ) : null}

      {tab === "peer" ? (
        <div className="feedback-page__layout">
          <section className="feedback-page__card" aria-label="Formulário de feedback 1:1">
            <h2 className="feedback-page__card-title">Feedback para um colega</h2>
            <p className="feedback-page__card-desc">
              Envie um feedback direto a outra pessoa. Ela e o gestor dela poderão ver a mensagem.
              Seu nome fica visível — não há envio anônimo neste modo.
            </p>

            <form className="feedback-page__form" onSubmit={(event) => void handleSubmitPeer(event)}>
              <div className="feedback-page__field feedback-page__typeahead">
                <PersonTypeahead
                  label="Pessoa"
                  value={targetQuery}
                  onChange={(value) => {
                    setTargetQuery(value);
                    if (targetPerson && value !== targetPerson.name) {
                      setTargetPerson(null);
                    }
                  }}
                  onSelectPerson={(person) => {
                    setTargetPerson(person);
                    setTargetQuery(person.name);
                  }}
                  placeholder="Buscar colaborador..."
                  hint="Digite ao menos 2 letras para buscar no diretório."
                  required
                />
                {targetPerson ? (
                  <p className="feedback-page__selected-person">
                    Selecionado: <strong>{targetPerson.name}</strong>
                    {targetPerson.title ? ` · ${targetPerson.title}` : ""}
                  </p>
                ) : null}
              </div>

              <CategoryField category={category} onChange={setCategory} selected={selectedCategory} />
              <SubjectField value={subject} onChange={setSubject} />
              <MessageField value={message} onChange={setMessage} />

              <div className="feedback-page__identity" aria-live="polite">
                <UserAvatar className="feedback-page__avatar avatar" photoUrl={me?.photoUrl} />
                <div className="feedback-page__identity-body">
                  <p className="feedback-page__identity-name">{collaboratorName}</p>
                  <p className="feedback-page__identity-meta">
                    Você será identificado como autor deste feedback 1:1.
                  </p>
                </div>
              </div>

              {error ? (
                <p className="feedback-page__error" role="alert">
                  {error}
                </p>
              ) : null}

              <SubmitButton
                pending={createFeedback.isPending}
                disabled={!targetPerson || message.trim().length < 3}
                label="Enviar feedback 1:1"
              />
            </form>
          </section>

          <aside className="feedback-page__aside" aria-label="Orientações 1:1">
            <div className="feedback-page__tip">
              <h2 className="feedback-page__tip-title">
                <i className="fa-solid fa-comments" aria-hidden="true" />
                Quem vê o 1:1
              </h2>
              <p>Visibilidade restrita — o RH não entra neste fluxo.</p>
              <ul>
                <li>Você (autor)</li>
                <li>A pessoa que recebe</li>
                <li>O gestor direto dela</li>
              </ul>
            </div>
          </aside>
        </div>
      ) : null}

      {tab === "meus" ? (
        <section className="feedback-page__inbox" aria-label="Meus feedbacks 1:1">
          {myFeedback.isLoading ? <p className="page-empty-note">Carregando feedbacks...</p> : null}
          {!myFeedback.isLoading && inboxItems.length === 0 ? (
            <div className="feedback-page__inbox-empty">
              <i className="fa-regular fa-inbox" aria-hidden="true" />
              <p>Nenhum feedback 1:1 ainda. Envie um na aba “Para um colega”.</p>
            </div>
          ) : null}
          {!myFeedback.isLoading && inboxItems.length > 0 ? (
            <div className="feedback-page__inbox-list">
              {inboxItems.map((item) => (
                <FeedbackInboxCard key={item.id} item={item} meId={me?.id} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {confirmModal}

      <ContrachequeModal
        open={successOpen}
        title="Feedback enviado"
        compact
        onClose={() => setSuccessOpen(false)}
        footer={
          <button type="button" className="pay-modal__btn" onClick={() => setSuccessOpen(false)}>
            Fechar
          </button>
        }
      >
        <div className="portal-confirm">
          <div className="portal-confirm__icon feedback-page__success-icon" aria-hidden="true">
            <i className="fa-solid fa-circle-check" />
          </div>
          <p className="portal-confirm__message">
            {successMode === "peer"
              ? `Pronto, ${collaboratorName.split(" ")[0]}! Seu feedback 1:1 foi enviado. A pessoa e o gestor dela foram notificados.`
              : successAnonymous
                ? "Obrigado! Sua mensagem anônima foi registrada e seguirá para triagem do RH."
                : `Obrigado, ${collaboratorName.split(" ")[0]}! Sua mensagem foi registrada e seguirá para triagem do RH.`}
          </p>
        </div>
      </ContrachequeModal>
    </main>
  );
}

function CategoryField({
  category,
  onChange,
  selected,
}: {
  category: FeedbackCategory;
  onChange: (value: FeedbackCategory) => void;
  selected: (typeof CATEGORIES)[number];
}) {
  return (
    <div className="feedback-page__field">
      <span id="feedback-category-label">Categoria</span>
      <div className="feedback-page__categories" role="group" aria-labelledby="feedback-category-label">
        {CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`feedback-page__category${category === item.value ? " is-active" : ""}`}
            onClick={() => onChange(item.value)}
            aria-pressed={category === item.value}
          >
            <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>
      <p className="feedback-page__hint">{selected.hint}</p>
    </div>
  );
}

function SubjectField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="feedback-page__field">
      <label htmlFor="feedback-subject">Assunto</label>
      <input
        id="feedback-subject"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Resumo em poucas palavras"
        maxLength={120}
      />
    </div>
  );
}

function MessageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="feedback-page__field">
      <label htmlFor="feedback-message">Mensagem</label>
      <textarea
        id="feedback-message"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Conte o contexto, o impacto e, se puder, uma sugestão de melhoria..."
        required
        minLength={3}
        maxLength={4000}
      />
      <p className="feedback-page__hint">Mínimo de 3 caracteres.</p>
    </div>
  );
}

function SubmitButton({
  pending,
  disabled,
  label = "Enviar feedback",
}: {
  pending: boolean;
  disabled: boolean;
  label?: string;
}) {
  return (
    <div className="feedback-page__actions">
      <button type="submit" className="feedback-page__submit" disabled={disabled || pending}>
        {pending ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            Enviando...
          </>
        ) : (
          <>
            <i className="fa-solid fa-paper-plane" aria-hidden="true" />
            {label}
          </>
        )}
      </button>
    </div>
  );
}
