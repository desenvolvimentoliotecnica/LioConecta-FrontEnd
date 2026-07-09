import { useEffect, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import {
  parseAssessmentQuestionsJson,
  serializeAssessmentQuestions,
} from "../../utils/unilioAssessment";
import {
  assessmentQuestionsToQuizDraft,
  defaultQuestionnaireDraft,
  isQuestionnaireDraftValid,
  quizDraftToAssessmentQuestions,
  type QuestionnaireDraft,
} from "../../utils/unilioQuestionnaire";
import type { UniLioUpsertAssessmentRequest } from "../../api/hooks/useUniLioAuthoring";
import { UniLioQuestionnaireEditor } from "./UniLioQuestionnaireEditor";

type AssessmentSource = {
  id?: string;
  title: string;
  passingScore: number;
  questionsJson: string;
} | null;

type Props = {
  open: boolean;
  assessment: AssessmentSource;
  canEdit: boolean;
  busy?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (body: UniLioUpsertAssessmentRequest) => void;
  onDelete?: () => void;
};

function draftFromAssessment(assessment: AssessmentSource): QuestionnaireDraft {
  if (!assessment) return defaultQuestionnaireDraft(80);
  const questions = parseAssessmentQuestionsJson(assessment.questionsJson);
  return assessmentQuestionsToQuizDraft(questions, assessment.passingScore);
}

export function UniLioAssessmentEditModal({
  open,
  assessment,
  canEdit,
  busy = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("Avaliação final");
  const [draft, setDraft] = useState<QuestionnaireDraft>(defaultQuestionnaireDraft(80));

  useEffect(() => {
    if (!open) return;
    setTitle(assessment?.title?.trim() || "Avaliação final");
    setDraft(draftFromAssessment(assessment));
  }, [assessment, open]);

  const canSave =
    title.trim().length > 0 && isQuestionnaireDraftValid(draft);

  return (
    <ContrachequeModal
      open={open}
      title="Avaliação final do curso"
      wide
      compact={false}
      onClose={onClose}
      footer={
        <>
          {canEdit && onDelete && assessment ? (
            <button
              type="button"
              className="pay-modal__btn pay-modal__btn--ghost unilio-module-edit-modal__delete"
              disabled={busy || deleting}
              onClick={onDelete}
            >
              {deleting ? "Excluindo…" : "Remover avaliação"}
            </button>
          ) : null}
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
          {canEdit ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={!canSave || busy || deleting}
              onClick={() =>
                onSave({
                  title: title.trim(),
                  passingScore: draft.passingScore,
                  questionsJson: serializeAssessmentQuestions(
                    quizDraftToAssessmentQuestions(draft),
                  ),
                })
              }
            >
              {busy ? "Salvando…" : "Salvar avaliação"}
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
              placeholder="Título da avaliação"
              aria-label="Título da avaliação"
            />

            <UniLioQuestionnaireEditor
              heading="Questões da avaliação"
              questions={draft.questions}
              disabled={!canEdit}
              onChange={(questions) => setDraft((current) => ({ ...current, questions }))}
            />
          </div>

          <aside className="unilio-module-edit-modal__sidebar" aria-label="Configurações da avaliação">
            <div className="unilio-module-edit-modal__panel">
              <header className="unilio-module-edit-modal__panel-head">
                <h3>Configurações</h3>
              </header>
              <div className="unilio-module-edit-modal__panel-body">
                <p className="unilio-module-edit-modal__hint">
                  Teste final obrigatório para concluir o curso quando configurado.
                </p>

                <label className="unilio-authoring-field">
                  <span className="unilio-authoring-field__label">Nota mínima (%)</span>
                  <input
                    className="unilio-authoring-field__control"
                    type="number"
                    min={1}
                    max={100}
                    value={draft.passingScore}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        passingScore: Number(e.target.value),
                      }))
                    }
                    disabled={!canEdit}
                  />
                </label>

                <p className="unilio-module-edit-modal__hint">
                  {draft.questions.length} questão
                  {draft.questions.length === 1 ? "" : "ões"} cadastrada
                  {draft.questions.length === 1 ? "" : "s"}.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ContrachequeModal>
  );
}
