import { useEffect, useRef, useState } from "react";
import { config } from "../../api/client";
import { usePortalUiSettings, useSavePortalUiSettings } from "../../api/hooks/usePortalUiSettings";
import {
  DEFAULT_PORTAL_UI_SETTINGS,
  buildDefaultRoadmap,
  portalUiSettingsFingerprint,
  type MaturityRoadmapItem,
  type PortalUiSettings,
} from "../../config/portal-ui-settings";
import "../../styles/organogram-governance-page.css";

function createCustomRoadmapItem(label: string): MaturityRoadmapItem {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim(),
    status: "pending",
  };
}

function RoadmapColumn({
  title,
  items,
  emptyLabel,
  onUpdateItem,
  onMoveItem,
  onRemoveItem,
  disabled,
}: {
  title: string;
  items: MaturityRoadmapItem[];
  emptyLabel: string;
  onUpdateItem: (id: string, patch: Partial<MaturityRoadmapItem>) => void;
  onMoveItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="portal-ui-roadmap__column">
      <h3 className="portal-ui-roadmap__column-title">{title}</h3>
      {items.length === 0 ? (
        <p className="portal-ui-roadmap__empty">{emptyLabel}</p>
      ) : (
        <ul className="portal-ui-roadmap__list">
          {items.map((item) => (
            <li key={item.id} className="portal-ui-roadmap__item">
              <div className="portal-ui-roadmap__item-head">
                <input
                  className="portal-ui-roadmap__label-input"
                  value={item.label}
                  disabled={disabled}
                  onChange={(event) => onUpdateItem(item.id, { label: event.target.value })}
                  aria-label={`Nome: ${item.label}`}
                />
                <div className="portal-ui-roadmap__item-actions">
                  <button
                    type="button"
                    className="portal-ui-roadmap__action-btn"
                    disabled={disabled}
                    onClick={() => onMoveItem(item.id)}
                    title={item.status === "done" ? "Mover para A fazer" : "Mover para Já feito"}
                  >
                    <i
                      className={`fa-solid ${item.status === "done" ? "fa-arrow-right" : "fa-arrow-left"}`}
                      aria-hidden="true"
                    />
                  </button>
                  {item.id.startsWith("custom-") ? (
                    <button
                      type="button"
                      className="portal-ui-roadmap__action-btn portal-ui-roadmap__action-btn--danger"
                      disabled={disabled}
                      onClick={() => onRemoveItem(item.id)}
                      title="Remover item"
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
              {item.path ? <span className="portal-ui-roadmap__path">{item.path}</span> : null}
              <textarea
                className="portal-ui-roadmap__notes"
                rows={2}
                value={item.notes ?? ""}
                disabled={disabled}
                placeholder="Notas (opcional)"
                onChange={(event) => onUpdateItem(item.id, { notes: event.target.value })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PortalUiSettingsSection() {
  const { data: settings, fingerprint, isLoading, isError } = usePortalUiSettings();
  const saveMutation = useSavePortalUiSettings();
  const [form, setForm] = useState<PortalUiSettings>(DEFAULT_PORTAL_UI_SETTINGS);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warn"; message: string } | null>(null);
  const hydratedFingerprint = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (hydratedFingerprint.current === fingerprint) return;

    setForm(settings.roadmap.length > 0 ? settings : { ...settings, roadmap: buildDefaultRoadmap() });
    hydratedFingerprint.current = fingerprint;
  }, [fingerprint, isLoading, settings]);

  const doneItems = form.roadmap.filter((item) => item.status === "done");
  const pendingItems = form.roadmap.filter((item) => item.status === "pending");

  const updateItem = (id: string, patch: Partial<MaturityRoadmapItem>) => {
    setForm((current) => ({
      ...current,
      roadmap: current.roadmap.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const moveItem = (id: string) => {
    setForm((current) => ({
      ...current,
      roadmap: current.roadmap.map((item) =>
        item.id === id ? { ...item, status: item.status === "done" ? "pending" : "done" } : item,
      ),
    }));
  };

  const removeItem = (id: string) => {
    setForm((current) => ({
      ...current,
      roadmap: current.roadmap.filter((item) => item.id !== id),
    }));
  };

  const addCustomItem = () => {
    const label = newItemLabel.trim();
    if (!label) return;
    setForm((current) => ({
      ...current,
      roadmap: [...current.roadmap, createCustomRoadmapItem(label)],
    }));
    setNewItemLabel("");
  };

  const resetRoadmapFromMaturity = () => {
    setForm((current) => ({ ...current, roadmap: buildDefaultRoadmap() }));
  };

  const handleSave = async () => {
    setFeedback(null);

    const next: PortalUiSettings = {
      maturityBadgesEnabled: form.maturityBadgesEnabled,
      roadmap: form.roadmap.filter((item) => item.label.trim()),
    };

    try {
      const { settings: saved, persistedToServer } = await saveMutation.mutateAsync(next);
      setForm(saved);
      hydratedFingerprint.current = portalUiSettingsFingerprint(saved);
      setFeedback({
        type: persistedToServer ? "success" : "warn",
        message: config.useMock
          ? "Configurações do Portal UI salvas localmente (modo mock)."
          : persistedToServer
            ? "Configurações do Portal UI salvas no servidor."
            : "Configurações guardadas neste navegador. Reinicie a API com as chaves portal.ui.* para persistir no banco.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do Portal UI. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do Portal UI">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-layer-group" />
        </div>
        <div>
          <div className="org-governance__intro-title">Portal UI — maturidade e roadmap</div>
          <p className="org-governance__intro-text">
            Controle os badges de maturidade na topbar e acompanhe o que já está integrado versus o que
            ainda falta implementar.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="org-governance__alert org-governance__alert--error" role="alert">
          Não foi possível carregar as configurações do servidor. Exibindo valores locais até reconectar.
        </div>
      ) : null}

      {feedback ? (
        <div className={`org-governance__alert org-governance__alert--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      ) : null}

      <form
        className="loop-settings__form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <label className="org-governance__toggle">
          <input
            type="checkbox"
            checked={form.maturityBadgesEnabled}
            disabled={isLoading || saveMutation.isPending}
            onChange={(event) => setForm((current) => ({ ...current, maturityBadgesEnabled: event.target.checked }))}
          />
          Exibir indicadores de maturidade nos menus da topbar
        </label>

        <div className="portal-ui-roadmap">
          <div className="portal-ui-roadmap__header">
            <div>
              <h2 className="portal-ui-roadmap__title">Roadmap de implementação</h2>
              <p className="portal-ui-roadmap__desc">
                Itens marcados como feitos correspondem a páginas integradas ou parcialmente integradas.
                Use as setas para mover entre colunas ou adicione itens personalizados.
              </p>
            </div>
            <button
              type="button"
              className="org-governance__btn org-governance__btn--ghost"
              disabled={isLoading || saveMutation.isPending}
              onClick={resetRoadmapFromMaturity}
            >
              Restaurar padrão
            </button>
          </div>

          <div className="portal-ui-roadmap__grid">
            <RoadmapColumn
              title={`Já feito (${doneItems.length})`}
              items={doneItems}
              emptyLabel="Nenhum item concluído ainda."
              onUpdateItem={updateItem}
              onMoveItem={moveItem}
              onRemoveItem={removeItem}
              disabled={isLoading || saveMutation.isPending}
            />
            <RoadmapColumn
              title={`A fazer (${pendingItems.length})`}
              items={pendingItems}
              emptyLabel="Nada pendente — tudo integrado!"
              onUpdateItem={updateItem}
              onMoveItem={moveItem}
              onRemoveItem={removeItem}
              disabled={isLoading || saveMutation.isPending}
            />
          </div>

          <div className="portal-ui-roadmap__add">
            <input
              type="text"
              className="portal-ui-roadmap__add-input"
              value={newItemLabel}
              disabled={isLoading || saveMutation.isPending}
              placeholder="Novo item personalizado..."
              onChange={(event) => setNewItemLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomItem();
                }
              }}
            />
            <button
              type="button"
              className="org-governance__btn org-governance__btn--ghost"
              disabled={isLoading || saveMutation.isPending || !newItemLabel.trim()}
              onClick={addCustomItem}
            >
              Adicionar item
            </button>
          </div>
        </div>

        <div className="org-governance__toolbar">
          <button
            type="submit"
            className="org-governance__btn org-governance__btn--primary"
            disabled={isLoading || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
