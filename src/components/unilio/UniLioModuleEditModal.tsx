import { useEffect, useRef, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { resolveBackendAssetUrl } from "../../api/assetUrl";
import type {
  UniLioAuthoringModule,
  UniLioUpsertModuleRequest,
} from "../../api/hooks/useUniLioAuthoring";
import {
  useDeleteUniLioModuleAttachment,
  useUploadUniLioModuleAttachment,
} from "../../api/hooks/useUniLioAuthoring";
import { MODULE_CONTENT_TYPE_OPTIONS } from "../../config/unilio/constants";
import {
  parseUniLioQuizJson,
} from "../../utils/unilioQuiz";
import {
  defaultQuestionnaireDraft,
  isQuestionnaireDraftValid,
  type QuestionnaireDraft,
} from "../../utils/unilioQuestionnaire";
import { UniLioArticleEditor } from "./UniLioArticleEditor";
import { UniLioQuestionnaireEditor } from "./UniLioQuestionnaireEditor";
import {
  formatUniLioAttachmentSize,
  uniLioAttachmentIconClass,
  UNILIO_MODULE_ATTACHMENT_ACCEPT,
  UNILIO_MODULE_ATTACHMENT_MAX_BYTES,
} from "../../utils/unilioAttachments";
import "../../styles/unilio-article-editor.css";

type ModuleContentType = "article" | "video" | "external" | "pdf" | "quiz";

type Props = {
  open: boolean;
  courseId: string;
  module: UniLioAuthoringModule | null;
  canEdit: boolean;
  busy?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (body: UniLioUpsertModuleRequest) => void;
  onDelete?: () => void;
};

const MODULE_CONTENT_TYPES: ModuleContentType[] = [
  "article",
  "video",
  "external",
  "pdf",
  "quiz",
];

function defaultQuizDraft(): QuestionnaireDraft {
  return defaultQuestionnaireDraft(70);
}

function quizDraftFromModule(module: UniLioAuthoringModule): QuestionnaireDraft {
  const parsed = parseUniLioQuizJson(
    module.quizJson,
    module.quizPassingScore ?? 70,
  );
  if (!parsed) return defaultQuizDraft();
  return {
    passingScore: parsed.passingScore,
    questions: parsed.questions,
  };
}

function serializeQuizDraft(draft: QuestionnaireDraft): string {
  return JSON.stringify({
    passingScore: draft.passingScore,
    questions: draft.questions.map((question) => ({
      id: question.id,
      text: question.text.trim(),
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label.trim(),
      })),
      correctAnswer: question.correctAnswer,
    })),
  });
}

function buildRequest(
  module: UniLioAuthoringModule,
  title: string,
  contentType: ModuleContentType,
  durationMinutes: number,
  articleHtml: string,
  contentUrl: string,
  quizDraft: QuestionnaireDraft,
): UniLioUpsertModuleRequest {
  return {
    sortOrder: module.sortOrder,
    title: title.trim(),
    contentType,
    durationMinutes,
    contentUrl:
      contentType === "video" ||
      contentType === "external" ||
      contentType === "pdf"
        ? contentUrl.trim() || null
        : null,
    articleHtml:
      contentType === "article" ? articleHtml.trim() || "<p></p>" : null,
    quizJson: contentType === "quiz" ? serializeQuizDraft(quizDraft) : null,
  };
}

export function UniLioModuleEditModal({
  open,
  courseId,
  module,
  canEdit,
  busy = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAttachment = useUploadUniLioModuleAttachment(courseId);
  const deleteAttachment = useDeleteUniLioModuleAttachment(courseId);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ModuleContentType>("article");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [articleHtml, setArticleHtml] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [quizDraft, setQuizDraft] = useState<QuestionnaireDraft>(defaultQuizDraft);

  const typeOptions = MODULE_CONTENT_TYPE_OPTIONS;

  useEffect(() => {
    if (!open || !module) return;
    setAttachmentError(null);
    setTitle(module.title);
    setContentType(
      MODULE_CONTENT_TYPES.includes(module.contentType as ModuleContentType)
        ? (module.contentType as ModuleContentType)
        : "article",
    );
    setDurationMinutes(module.durationMinutes);
    setArticleHtml(module.articleHtml ?? "");
    setContentUrl(module.contentUrl ?? "");
    setQuizDraft(quizDraftFromModule(module));
  }, [module, open]);

  if (!module) return null;

  const canSave =
    title.trim().length > 0 &&
    durationMinutes > 0 &&
    (contentType !== "quiz" || isQuestionnaireDraftValid(quizDraft));

  async function handleAttachmentSelected(file: File | null) {
    if (!file || !module || !canEdit) return;

    setAttachmentError(null);
    if (file.size > UNILIO_MODULE_ATTACHMENT_MAX_BYTES) {
      setAttachmentError("Arquivo excede o limite de 25 MB.");
      return;
    }

    try {
      await uploadAttachment.mutateAsync({ moduleId: module.id, file });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o arquivo.";
      setAttachmentError(message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <ContrachequeModal
      open={open}
      title={`Editar módulo ${module.sortOrder}`}
      wide
      compact={false}
      onClose={onClose}
      footer={
        <>
          {canEdit && onDelete ? (
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost unilio-module-edit-modal__delete"
              disabled={busy || deleting}
              onClick={onDelete}
            >
              {deleting ? "Excluindo…" : "Excluir módulo"}
            </button>
          ) : null}
          <button
            type="button"
            className="pay-modal__btn pay-modal__btn--ghost"
            onClick={onClose}
          >
            Fechar
          </button>
          {canEdit ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={!canSave || busy || deleting}
              onClick={() =>
                onSave(
                  buildRequest(
                    module,
                    title,
                    contentType,
                    durationMinutes,
                    articleHtml,
                    contentUrl,
                    quizDraft,
                  ),
                )
              }
            >
              {busy ? "Salvando…" : "Salvar módulo"}
            </button>
          ) : null}
        </>
      }
    >
      <div className="unilio-module-edit-modal unilio-module-edit-modal--editor">
        <div className="unilio-module-edit-modal__layout">
          <div className="unilio-module-edit-modal__main">
            <input
                className="unilio-module-edit-modal__title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
                placeholder="Título do módulo"
                aria-label="Título do módulo"
              />

            {contentType === "article" ? (
              <div className="unilio-module-edit-modal__content">
                <UniLioArticleEditor
                  value={articleHtml}
                  onChange={setArticleHtml}
                  disabled={!canEdit}
                  placeholder="Escreva o conteúdo do módulo. Use a barra de ferramentas para formatação, imagens, tabelas e vídeos."
                />
              </div>
            ) : null}

            {contentType === "video" ||
            contentType === "external" ||
            contentType === "pdf" ? (
              <div className="unilio-module-edit-modal__content unilio-module-edit-modal__content--url">
                <label className="unilio-authoring-field">
                  <span className="unilio-authoring-field__label">
                    {contentType === "video"
                      ? "URL do vídeo"
                      : contentType === "pdf"
                        ? "URL do PDF"
                        : "URL externa"}
                  </span>
                  <input
                    className="unilio-authoring-field__control"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </label>
              </div>
            ) : null}

            {contentType === "quiz" ? (
              <UniLioQuestionnaireEditor
                heading="Questões do questionário"
                questions={quizDraft.questions}
                disabled={!canEdit}
                onChange={(questions) =>
                  setQuizDraft((current) => ({ ...current, questions }))
                }
              />
            ) : null}
          </div>

          <aside className="unilio-module-edit-modal__sidebar" aria-label="Configurações do módulo">
            <div className="unilio-module-edit-modal__panel">
              <header className="unilio-module-edit-modal__panel-head">
                <h3>Configurações</h3>
              </header>
              <div className="unilio-module-edit-modal__panel-body">
                <label className="unilio-authoring-field">
                  <span className="unilio-authoring-field__label">Formato</span>
                  <select
                    className="unilio-authoring-field__control"
                    value={contentType}
                    onChange={(e) =>
                      setContentType(e.target.value as ModuleContentType)
                    }
                    disabled={!canEdit}
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="unilio-authoring-field">
                  <span className="unilio-authoring-field__label">Duração (min)</span>
                  <input
                    className="unilio-authoring-field__control"
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    disabled={!canEdit}
                  />
                </label>

                {contentType === "quiz" ? (
                  <label className="unilio-authoring-field">
                    <span className="unilio-authoring-field__label">Nota mínima (%)</span>
                    <input
                      className="unilio-authoring-field__control"
                      type="number"
                      min={1}
                      max={100}
                      value={quizDraft.passingScore}
                      onChange={(e) =>
                        setQuizDraft((current) => ({
                          ...current,
                          passingScore: Number(e.target.value),
                        }))
                      }
                      disabled={!canEdit}
                    />
                  </label>
                ) : null}
              </div>
            </div>

            <section className="unilio-module-edit-modal__panel unilio-module-edit-modal__attachments">
              <header className="unilio-module-edit-modal__panel-head">
                <h3>Materiais complementares</h3>
              </header>
              <div className="unilio-module-edit-modal__panel-body">
                {module.attachments.length > 0 ? (
                  <ul className="unilio-module-edit-modal__attachment-list">
                    {module.attachments.map((attachment) => (
                      <li key={attachment.id} className="unilio-module-edit-modal__attachment-item">
                        <a
                          className="unilio-module-edit-modal__attachment-link"
                          href={resolveBackendAssetUrl(attachment.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={attachment.fileName}
                        >
                          <i
                            className={`fa-solid ${uniLioAttachmentIconClass(attachment.fileName)}`}
                            aria-hidden="true"
                          />
                          <span className="unilio-module-edit-modal__attachment-name">
                            {attachment.fileName}
                          </span>
                          <span className="unilio-module-edit-modal__attachment-size">
                            {formatUniLioAttachmentSize(attachment.sizeBytes)}
                          </span>
                        </a>
                        {canEdit ? (
                          <button
                            type="button"
                            className="unilio-authoring-table__action-btn unilio-authoring-table__action-btn--muted"
                            disabled={deleteAttachment.isPending || uploadAttachment.isPending}
                            onClick={() =>
                              void deleteAttachment.mutateAsync({
                                moduleId: module.id,
                                attachmentId: attachment.id,
                              })
                            }
                          >
                            Remover
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="unilio-module-edit-modal__attachments-empty">
                    Nenhum anexo neste módulo.
                  </p>
                )}

                {canEdit ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="unilio-module-edit-modal__attachment-input"
                      accept={UNILIO_MODULE_ATTACHMENT_ACCEPT}
                      onChange={(event) =>
                        void handleAttachmentSelected(event.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      className="unilio-authoring-btn unilio-authoring-btn--secondary unilio-module-edit-modal__attachment-btn"
                      disabled={busy || deleting || uploadAttachment.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-paperclip" aria-hidden="true" />
                      {uploadAttachment.isPending ? "Enviando…" : "Adicionar arquivo"}
                    </button>
                  </>
                ) : null}

                {attachmentError ? (
                  <p className="unilio-module-edit-modal__attachments-error" role="alert">
                    {attachmentError}
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </ContrachequeModal>
  );
}
