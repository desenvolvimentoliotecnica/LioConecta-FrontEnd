import { useState } from "react";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const CATEGORIES = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "acesso", label: "Acesso / Senha" },
  { value: "rede", label: "Rede / VPN" },
  { value: "outros", label: "Outros" },
];

type Props = {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    subject: string;
    priority: string;
    category: string;
    description: string;
  }) => void;
};

export function HelpDeskOpenTicketModal({ open, pending, onClose, onSubmit }: Props) {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("media");
  const [category, setCategory] = useState("software");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    onSubmit({
      subject: subject.trim(),
      priority,
      category,
      description: description.trim(),
    });
  };

  const handleClose = () => {
    setSubject("");
    setPriority("media");
    setCategory("software");
    setDescription("");
    onClose();
  };

  return (
    <ContrachequeModal
      open={open}
      title="Abrir chamado"
      onClose={handleClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={pending || !subject.trim() || !description.trim()}
            onClick={handleSubmit}
          >
            {pending ? "Enviando…" : "Enviar chamado"}
          </button>
        </>
      }
    >
      <p className="hd-modal__intro">
        <i className="fa-solid fa-ticket" aria-hidden="true" />
        Registre incidente ou solicitação. A equipe de TI receberá o protocolo automaticamente.
      </p>
      <div className="hd-modal-form">
        <label className="hd-modal-form__field">
          <span className="hd-modal-form__label">
            <i className="fa-solid fa-heading" aria-hidden="true" /> Assunto
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex.: VPN desconectando frequentemente"
            maxLength={120}
          />
        </label>
        <div className="hd-modal-form__row">
          <label className="hd-modal-form__field">
            <span className="hd-modal-form__label">
              <i className="fa-solid fa-gauge-high" aria-hidden="true" /> Prioridade
            </span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="hd-modal-form__field">
            <span className="hd-modal-form__label">
              <i className="fa-solid fa-layer-group" aria-hidden="true" /> Categoria
            </span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="hd-modal-form__field hd-modal-form__field--full">
          <span className="hd-modal-form__label">
            <i className="fa-regular fa-message" aria-hidden="true" /> Descrição
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Descreva o problema, mensagens de erro e passos para reproduzir"
          />
        </label>
      </div>
    </ContrachequeModal>
  );
}
