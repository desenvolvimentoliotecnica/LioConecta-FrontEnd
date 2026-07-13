import { useEffect, useMemo, useState } from "react";
import { useHelpDeskAreas, useHelpDeskCategories } from "../../api/hooks/useHelpDesk";
import type { PortalSystemDto } from "../../api/types";
import {
  SYSTEMS_ACCESS_ENVIRONMENTS,
  type SystemsAccessEnvironment,
} from "../../config/systems/accessRequest";
import { resolveSystemsAccessArea } from "../help-desk/helpDeskAreaCatalog";
import { formatCategoryPath } from "../help-desk/helpDeskCategoryTree";
import { helpDeskQueryErrorMessage } from "../help-desk/helpDeskQueryError";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { resolveSystemsAccessItilCategories } from "./resolveSystemsAccessItil";

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
] as const;

export type SystemAccessRequestPayload = {
  subject: string;
  priority: string;
  entityId: number;
  categoryId: number;
  description: string;
};

type Props = {
  open: boolean;
  systems: PortalSystemDto[];
  initialSystemId?: string | null;
  defaultEnvironment?: SystemsAccessEnvironment | string;
  preferredCategoryId?: number | null;
  pending?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: SystemAccessRequestPayload) => void;
};

function normalizeEnvironment(
  value: string | undefined,
): SystemsAccessEnvironment {
  if (value === "dev" || value === "hml" || value === "prd") return value;
  return "prd";
}

export function SystemAccessRequestModal({
  open,
  systems,
  initialSystemId = null,
  defaultEnvironment = "prd",
  preferredCategoryId = null,
  pending = false,
  errorMessage = null,
  onClose,
  onSubmit,
}: Props) {
  const [systemId, setSystemId] = useState("");
  const [environment, setEnvironment] = useState<SystemsAccessEnvironment>(
    normalizeEnvironment(defaultEnvironment),
  );
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priority, setPriority] = useState("media");
  const [justification, setJustification] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const areasQuery = useHelpDeskAreas(open);
  const areas = areasQuery.data ?? [];
  const tiArea = resolveSystemsAccessArea(areas);

  const categoriesQuery = useHelpDeskCategories(
    tiArea?.id ?? "",
    open && Boolean(tiArea),
  );
  const categories = categoriesQuery.data ?? [];

  const itil = useMemo(
    () => resolveSystemsAccessItilCategories(categories, preferredCategoryId),
    [categories, preferredCategoryId],
  );

  const selectedSystem = systems.find((item) => item.id === systemId) ?? null;
  const accessNotes = selectedSystem?.accessNotes?.trim() || "";

  useEffect(() => {
    if (!open) return;
    setSystemId(initialSystemId ?? "");
    setEnvironment(normalizeEnvironment(defaultEnvironment));
    setCategoryId(null);
    setPriority("media");
    setJustification("");
    setLocalError(null);
  }, [open, initialSystemId, defaultEnvironment]);

  useEffect(() => {
    if (!open || itil.serviceOptions.length === 0) return;
    setCategoryId((current) => {
      if (current != null && itil.serviceOptions.some((item) => item.id === current)) {
        return current;
      }
      if (itil.serviceOptions.length === 1) {
        return itil.serviceOptions[0].id;
      }
      return null;
    });
  }, [open, itil.serviceOptions]);

  const handleSubmit = () => {
    setLocalError(null);

    if (!selectedSystem) {
      setLocalError("Selecione o sistema para o qual deseja acesso.");
      return;
    }
    if (!tiArea) {
      setLocalError("Entidade GLPI indisponível para Help Desk. Tente novamente mais tarde.");
      return;
    }
    if (categoryId == null) {
      setLocalError("Selecione o tipo de serviço.");
      return;
    }
    const trimmed = justification.trim();
    if (!trimmed) {
      setLocalError("Informe a justificativa da solicitação.");
      return;
    }

    const envLabel =
      SYSTEMS_ACCESS_ENVIRONMENTS.find((item) => item.value === environment)?.label ?? environment;
    const serviceLabel = formatCategoryPath(categories, categoryId) || String(categoryId);

    const description = [
      "Solicitação de acesso a sistema (portal LioConecta).",
      "",
      `Sistema: ${selectedSystem.name}`,
      `Slug: ${selectedSystem.slug}`,
      `Categoria do hub: ${selectedSystem.category}`,
      `Ambiente solicitado: ${envLabel}`,
      `Serviço ITIL: ${serviceLabel}`,
      accessNotes ? `Observações de acesso do sistema: ${accessNotes}` : null,
      "",
      "Justificativa:",
      trimmed,
    ]
      .filter((line) => line !== null)
      .join("\n");

    onSubmit({
      subject: `Solicitação de acesso — ${selectedSystem.name}`,
      priority,
      entityId: tiArea.entityId,
      categoryId,
      description,
    });
  };

  const catalogError =
    areasQuery.isError
      ? helpDeskQueryErrorMessage(
          areasQuery.error,
          "Não foi possível carregar as áreas do catálogo GLPI.",
        )
      : categoriesQuery.isError
        ? "Não foi possível carregar o catálogo do GLPI."
        : null;

  const displayError = localError || errorMessage || catalogError;

  return (
    <ContrachequeModal
      open={open}
      title="Solicitar acesso"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="pay-modal__btn pay-modal__btn--ghost"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            onClick={handleSubmit}
            disabled={pending || areasQuery.isLoading || categoriesQuery.isLoading}
          >
            {pending ? "Enviando…" : "Enviar solicitação"}
          </button>
        </>
      }
    >
      <div className="systems-access-request">
        <p className="systems-access-request__intro">
          A solicitação abre um chamado no GLPI para a equipe de TI.
        </p>

        {displayError ? (
          <p className="hd-modal__error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {displayError}
          </p>
        ) : null}

        <div className="systems-form systems-access-request__form">
          <label>
            Sistema
            <select
              value={systemId}
              onChange={(event) => setSystemId(event.target.value)}
              disabled={pending}
              required
            >
              <option value="">Selecione…</option>
              {systems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.category ? ` (${item.category})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ambiente
            <select
              value={environment}
              onChange={(event) =>
                setEnvironment(normalizeEnvironment(event.target.value))
              }
              disabled={pending}
            >
              {SYSTEMS_ACCESS_ENVIRONMENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {accessNotes ? (
            <div className="systems-access-request__notes" role="note">
              <strong>Observações de acesso</strong>
              <p>{accessNotes}</p>
            </div>
          ) : null}

          <label>
            Tipo de serviço
            <select
              value={categoryId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setCategoryId(value ? Number.parseInt(value, 10) : null);
              }}
              disabled={pending || categoriesQuery.isLoading || itil.serviceOptions.length === 0}
              required
            >
              <option value="">
                {categoriesQuery.isLoading ? "Carregando…" : "Selecione…"}
              </option>
              {itil.serviceOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName?.trim() || item.name}
                </option>
              ))}
            </select>
          </label>

          {itil.usedRootFallback ? (
            <p className="systems-form__hint">
              Não foi possível localizar &quot;Identidade e Acessos&quot;. Selecione a categoria
              ITIL adequada ou configure <code>helpdesk.systems_access_category_id</code>.
            </p>
          ) : null}

          <label>
            Prioridade
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={pending}
            >
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Justificativa
            <textarea
              rows={4}
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              placeholder="Descreva o motivo e o perfil de acesso necessário."
              disabled={pending}
              required
            />
          </label>
        </div>
      </div>
    </ContrachequeModal>
  );
}
