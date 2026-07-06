import { useEffect, useMemo, useState } from "react";
import { useHelpDeskCategories } from "../../api/hooks/useHelpDesk";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

type Props = {
  open: boolean;
  pending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    subject: string;
    priority: string;
    categoryId: number;
    description: string;
  }) => void;
};

export function HelpDeskOpenTicketModal({ open, pending, errorMessage, onClose, onSubmit }: Props) {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("media");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const categoriesQuery = useHelpDeskCategories(open);
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const items = categoriesQuery.data ?? [];
    return items.filter((item) => {
      const label = (item.fullName ?? item.name).trim().toLowerCase();
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (!open || categories.length === 0) return;
    setCategoryId((current) => {
      if (current !== null && categories.some((item) => item.id === current)) {
        return current;
      }
      return categories[0]?.id ?? null;
    });
  }, [open, categories]);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim() || categoryId === null) return;
    onSubmit({
      subject: subject.trim(),
      priority,
      categoryId,
      description: description.trim(),
    });
  };

  const handleClose = () => {
    setSubject("");
    setPriority("media");
    setCategoryId(null);
    setDescription("");
    onClose();
  };

  const categoryDisabled =
    categoriesQuery.isLoading || categoriesQuery.isError || categories.length === 0 || categoryId === null;

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
            disabled={pending || !subject.trim() || !description.trim() || categoryDisabled}
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

      {errorMessage ? (
        <p className="hd-modal__error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errorMessage}
        </p>
      ) : null}

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
            <select
              value={categoryId ?? ""}
              disabled={categoryDisabled}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categoriesQuery.isLoading ? (
                <option value="">Carregando categorias…</option>
              ) : categoriesQuery.isError ? (
                <option value="">Erro ao carregar categorias</option>
              ) : categories.length === 0 ? (
                <option value="">Nenhuma categoria disponível</option>
              ) : (
                categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName ?? item.name}
                  </option>
                ))
              )}
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
