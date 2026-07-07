import { useEffect, useMemo, useState } from "react";
import { useHelpDeskAreas, useHelpDeskCategories } from "../../api/hooks/useHelpDesk";
import type { HelpDeskItilCategoryDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import {
  findAreaById,
  formatAreaServiceCount,
  getAreaIconClass,
} from "./helpDeskAreaCatalog";
import { helpDeskQueryErrorMessage } from "./helpDeskQueryError";
import {
  buildCategoryPath,
  findCategoryById,
  formatCategoryPath,
  getChildCategories,
  getRootCategories,
} from "./helpDeskCategoryTree";

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

type WizardPhase = "area" | "catalog" | "details";

type Props = {
  open: boolean;
  pending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    subject: string;
    priority: string;
    entityId: number;
    categoryId: number;
    description: string;
  }) => void;
};

export function HelpDeskOpenTicketModal({ open, pending, errorMessage, onClose, onSubmit }: Props) {
  const [phase, setPhase] = useState<WizardPhase>("area");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<number | null>(null);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("media");
  const [description, setDescription] = useState("");

  const areasQuery = useHelpDeskAreas(open);
  const areas = areasQuery.data ?? [];

  const categoriesQuery = useHelpDeskCategories(areaId, open && phase !== "area");
  const categories = categoriesQuery.data ?? [];

  const categoryBreadcrumb = useMemo(() => {
    if (currentParentId === null) return [] as HelpDeskItilCategoryDto[];
    return buildCategoryPath(categories, currentParentId);
  }, [categories, currentParentId]);

  const currentCategoryLevel = useMemo(() => {
    if (currentParentId === null) {
      return getRootCategories(categories);
    }
    return getChildCategories(categories, currentParentId);
  }, [categories, currentParentId]);

  const selectedArea = areaId !== null ? findAreaById(areas, areaId) : null;
  const selectedCategory = categoryId !== null ? findCategoryById(categories, categoryId) : null;

  useEffect(() => {
    if (!open) return;
    setPhase("area");
    setAreaId(null);
    setEntityId(null);
    setCurrentParentId(null);
    setCategoryId(null);
    setSubject("");
    setPriority("media");
    setDescription("");
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleAreaSelect = (item: (typeof areas)[number]) => {
    setAreaId(item.id);
    setEntityId(item.entityId);
    setCurrentParentId(null);
    setCategoryId(null);
    setPhase("catalog");
  };

  const handleCategorySelect = (item: HelpDeskItilCategoryDto) => {
    if (item.hasChildren) {
      setCurrentParentId(item.id);
      return;
    }

    setCategoryId(item.id);
    setPhase("details");
  };

  const handleBack = () => {
    if (phase === "details") {
      if (selectedCategory?.parentId != null && selectedCategory.parentId > 0) {
        setCurrentParentId(selectedCategory.parentId);
      } else {
        setCurrentParentId(null);
      }
      setPhase("catalog");
      return;
    }

    if (phase === "catalog") {
      setPhase("area");
      setAreaId(null);
      setEntityId(null);
      setCurrentParentId(null);
      setCategoryId(null);
    }
  };

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim() || categoryId === null || entityId === null) return;
    onSubmit({
      subject: subject.trim(),
      priority,
      entityId,
      categoryId,
      description: description.trim(),
    });
  };

  const canGoBack = phase === "details" || phase === "catalog";

  const stepState = (target: WizardPhase) => {
    const order: WizardPhase[] = ["area", "catalog", "details"];
    const currentIndex = order.indexOf(phase);
    const targetIndex = order.indexOf(target);
    if (targetIndex < currentIndex) return "is-done";
    if (targetIndex === currentIndex) return "is-active";
    return "";
  };

  return (
    <ContrachequeModal
      open={open}
      wide
      title="Abrir chamado"
      onClose={handleClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
            Cancelar
          </button>
          {canGoBack ? (
            <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleBack}>
              Voltar
            </button>
          ) : null}
          {phase === "details" ? (
            <button
              type="button"
              className="pay-modal__btn"
              disabled={pending || !subject.trim() || !description.trim() || categoryId === null || entityId === null}
              onClick={handleSubmit}
            >
              {pending ? "Enviando…" : "Enviar chamado"}
            </button>
          ) : null}
        </>
      }
    >
      <div className="hd-wizard__steps" aria-label="Progresso">
        <div className={`hd-wizard__step ${stepState("area")}`}>
          <span className="hd-wizard__step-index">1</span>
          <span className="hd-wizard__step-label">Área</span>
        </div>
        <div className={`hd-wizard__step ${stepState("catalog")}`}>
          <span className="hd-wizard__step-index">2</span>
          <span className="hd-wizard__step-label">Catálogo</span>
        </div>
        <div className={`hd-wizard__step ${stepState("details")}`}>
          <span className="hd-wizard__step-index">3</span>
          <span className="hd-wizard__step-label">Detalhes</span>
        </div>
      </div>

      {errorMessage ? (
        <p className="hd-modal__error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {errorMessage}
        </p>
      ) : null}

      {phase === "area" ? (
        <>
          <p className="hd-modal__intro">
            <i className="fa-solid fa-grid-2" aria-hidden="true" />
            Escolha a área — como no app mobile — para ver os serviços disponíveis.
          </p>

          {areasQuery.isLoading ? (
            <p className="hd-modal__empty">Carregando áreas…</p>
          ) : areasQuery.isError ? (
            <p className="hd-modal__error" role="alert">
              {helpDeskQueryErrorMessage(
                areasQuery.error,
                "Não foi possível carregar as áreas do catálogo GLPI.",
              )}
            </p>
          ) : areas.length === 0 ? (
            <p className="hd-modal__empty">Nenhuma área configurada.</p>
          ) : (
            <div className="hd-wizard__area-list" role="list">
              {areas.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="hd-wizard__area-card"
                  role="listitem"
                  onClick={() => handleAreaSelect(item)}
                >
                  <span className="hd-wizard__area-icon" aria-hidden="true">
                    <i className={getAreaIconClass(item.icon)} />
                  </span>
                  <span className="hd-wizard__area-body">
                    <span className="hd-wizard__area-title">{item.name}</span>
                    <span className="hd-wizard__area-meta">{formatAreaServiceCount(item.serviceCount)}</span>
                  </span>
                  <i className="fa-solid fa-chevron-right hd-wizard__area-chevron" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </>
      ) : null}

      {phase === "catalog" ? (
        <>
          {selectedArea ? (
            <div className="hd-wizard__summary">
              <span className="hd-wizard__summary-label">Área selecionada</span>
              <strong>{selectedArea.name}</strong>
            </div>
          ) : null}

          <p className="hd-modal__intro">
            <i className="fa-solid fa-sitemap" aria-hidden="true" />
            Escolha o serviço do catálogo. Se houver subitens, continue navegando até a opção final.
          </p>

          <nav className="hd-wizard__breadcrumb" aria-label="Navegação do catálogo">
            <button
              type="button"
              className={`hd-wizard__crumb${currentParentId === null ? " is-current" : ""}`}
              onClick={() => setCurrentParentId(null)}
            >
              Início
            </button>
            {categoryBreadcrumb.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`hd-wizard__crumb${item.id === currentParentId ? " is-current" : ""}`}
                onClick={() => setCurrentParentId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {categoriesQuery.isLoading ? (
            <p className="hd-modal__empty">Carregando catálogo…</p>
          ) : categoriesQuery.isError ? (
            <p className="hd-modal__error" role="alert">
              Não foi possível carregar o catálogo do GLPI.
            </p>
          ) : currentCategoryLevel.length === 0 ? (
            <p className="hd-modal__empty">
              Nenhum serviço disponível nesta área. A infra precisa configurar os IDs de categoria em{" "}
              <code>helpdesk.glpi_areas</code>.
            </p>
          ) : (
            <div className="hd-wizard__grid" role="list">
              {currentCategoryLevel.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="hd-wizard__card"
                  role="listitem"
                  onClick={() => handleCategorySelect(item)}
                >
                  <span className="hd-wizard__card-icon" aria-hidden="true">
                    <i className={item.hasChildren ? "fa-solid fa-folder" : "fa-solid fa-file-lines"} />
                  </span>
                  <span className="hd-wizard__card-body">
                    <span className="hd-wizard__card-title">{item.name}</span>
                    {item.fullName && item.fullName !== item.name ? (
                      <span className="hd-wizard__card-meta">{item.fullName}</span>
                    ) : null}
                  </span>
                  {item.hasChildren ? (
                    <i className="fa-solid fa-chevron-right hd-wizard__card-chevron" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </>
      ) : null}

      {phase === "details" ? (
        <>
          <p className="hd-modal__intro">
            <i className="fa-solid fa-ticket" aria-hidden="true" />
            Preencha os detalhes do chamado. A equipe receberá o protocolo automaticamente no GLPI.
          </p>

          {selectedArea ? (
            <div className="hd-wizard__summary">
              <span className="hd-wizard__summary-label">Área</span>
              <strong>{selectedArea.name}</strong>
            </div>
          ) : null}

          {categoryId !== null ? (
            <div className="hd-wizard__summary">
              <span className="hd-wizard__summary-label">Serviço</span>
              <strong>{formatCategoryPath(categories, categoryId)}</strong>
            </div>
          ) : null}

          <div className="hd-modal-form hd-modal-form--details">
            <label className="hd-modal-form__field hd-modal-form__field--full">
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
            <label className="hd-modal-form__field hd-modal-form__field--full">
              <span className="hd-modal-form__label">
                <i className="fa-regular fa-message" aria-hidden="true" /> Descrição
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema, mensagens de erro e passos para reproduzir"
                rows={4}
              />
            </label>
          </div>
        </>
      ) : null}
    </ContrachequeModal>
  );
}
