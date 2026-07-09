import { useEffect, useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import type { UniLioQuestionVisibility } from "../../config/unilio/types";
import "../../styles/unilio-questions.css";

type Props = {
  open: boolean;
  courseTitle: string;
  moduleTitle: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (payload: { body: string; visibility: UniLioQuestionVisibility; scopeCourse: boolean }) => void;
};

export function UniLioModuleQuestionModal({
  open,
  courseTitle,
  moduleTitle,
  busy = false,
  onClose,
  onSubmit,
}: Props) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<UniLioQuestionVisibility>("private");
  const [scopeCourse, setScopeCourse] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBody("");
    setVisibility("private");
    setScopeCourse(false);
  }, [open, courseTitle, moduleTitle]);

  const canSubmit = body.trim().length > 0 && body.trim().length <= 2000;

  return (
    <ContrachequeModal
      open={open}
      title="Enviar dúvida"
      compact
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={!canSubmit || busy}
            onClick={() =>
              onSubmit({
                body: body.trim(),
                visibility,
                scopeCourse,
              })
            }
          >
            {busy ? "Enviando…" : "Enviar dúvida"}
          </button>
        </>
      }
    >
      <div className="unilio-question-modal">
        <p className="unilio-question-modal__context">
          <strong>{courseTitle}</strong>
          {!scopeCourse ? <> · {moduleTitle}</> : <> · sobre o curso inteiro</>}
        </p>

        <label className="unilio-question-modal__field">
          <span>Sua dúvida</span>
          <textarea
            rows={5}
            maxLength={2000}
            value={body}
            placeholder="Descreva sua dúvida sobre o conteúdo…"
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <fieldset className="unilio-question-modal__fieldset">
          <legend>Escopo</legend>
          <label className="unilio-question-modal__radio">
            <input
              type="radio"
              name="scope"
              checked={!scopeCourse}
              onChange={() => setScopeCourse(false)}
            />
            Sobre este módulo
          </label>
          <label className="unilio-question-modal__radio">
            <input
              type="radio"
              name="scope"
              checked={scopeCourse}
              onChange={() => setScopeCourse(true)}
            />
            Sobre o curso inteiro
          </label>
        </fieldset>

        <fieldset className="unilio-question-modal__fieldset">
          <legend>Visibilidade</legend>
          <label className="unilio-question-modal__radio">
            <input
              type="radio"
              name="visibility"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            Privada — só eu e o instrutor
          </label>
          <label className="unilio-question-modal__radio">
            <input
              type="radio"
              name="visibility"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            Pública no módulo — outros alunos veem como FAQ
          </label>
        </fieldset>
      </div>
    </ContrachequeModal>
  );
}
