import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveBackendAssetUrl } from "../../api/assetUrl";
import {
  useCreateSystem,
  useDeleteSystem,
  useRecordSystemClick,
  useSystems,
  useSystemsBootstrap,
  useUpdateSystem,
  useUploadSystemIcon,
} from "../../api/hooks/useSystems";
import { useSystemsSettings } from "../../api/hooks/useSystemsSettings";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import { useMe } from "../../api/hooks/useMe";
import type { PortalSystemDto } from "../../api/types";
import { canManageSystems } from "../../config/systems/settings";
import { systemBookmarkId } from "../../config/systems/bookmarks";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { SystemCardActionsMenu } from "../systems/SystemCardActionsMenu";
import {
  emptySystemForm,
  formFromDto,
  formToRequest,
  SystemFormModal,
  type SystemFormState,
} from "../systems/SystemFormModal";
import "../../styles/documents-hub-page.css";
import "../../styles/list-page.css";
import "../../styles/systems-hub-page.css";

export const SYSTEMS_HUB_PATH = "/servicos/acesso-sistemas";

function SystemCardIcon({ system }: { system: PortalSystemDto }) {
  if (system.iconKind === "Upload" && system.iconAssetUrl) {
    return (
      <img
        className="systems-hub__card-icon-img"
        src={resolveBackendAssetUrl(system.iconAssetUrl)}
        alt=""
      />
    );
  }

  return <i className={`fa-solid ${system.iconFaClass ?? "fa-table-cells"}`} aria-hidden="true" />;
}

export function SystemsHubPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: settings, isError: settingsError } = useSystemsSettings();
  const bootstrap = useSystemsBootstrap();
  const recordClick = useRecordSystemClick();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();

  const [includeInactive, setIncludeInactive] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PortalSystemDto | null>(null);
  const [formInitial, setFormInitial] = useState<SystemFormState>(emptySystemForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const list = useSystems({ includeInactive });

  const createMutation = useCreateSystem();
  const updateMutation = useUpdateSystem();
  const deleteMutation = useDeleteSystem();
  const uploadIconMutation = useUploadSystemIcon();

  const canManage =
    (bootstrap.data?.canManage ?? false) || (!settingsError && canManageSystems(me, settings));

  const items = list.data ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setFormInitial(emptySystemForm());
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (item: PortalSystemDto) => {
    setEditing(item);
    setFormInitial(formFromDto(item));
    setFormError(null);
    setEditorOpen(true);
  };

  const handleOpen = (item: PortalSystemDto) => {
    if (!item.launchUrl) {
      setFeedback("Este sistema não possui URL configurada para o ambiente atual.");
      return;
    }

    recordClick.mutate(item.id);

    if (item.destinationType === "Internal") {
      navigate(item.launchUrl);
      return;
    }

    window.open(item.launchUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (form: SystemFormState, pendingIconFile: File | null) => {
    setFormError(null);
    const body = formToRequest(form, pendingIconFile !== null, editing?.sortOrder);

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, body });
        if (pendingIconFile) {
          await uploadIconMutation.mutateAsync({ id: editing.id, file: pendingIconFile });
        }
        setFeedback("Sistema atualizado.");
      } else {
        const created = await createMutation.mutateAsync(body);
        if (pendingIconFile) {
          await uploadIconMutation.mutateAsync({ id: created.id, file: pendingIconFile });
        }
        setFeedback("Sistema criado.");
      }
      setEditorOpen(false);
    } catch {
      setFormError("Não foi possível salvar o sistema. Verifique os campos e permissões.");
    }
  };

  const handleDelete = async (item: PortalSystemDto) => {
    const confirmed = window.confirm(`Desativar o sistema ${item.name}?`);
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(item.id);
      setFeedback("Sistema desativado.");
    } catch {
      setFeedback("Não foi possível desativar este sistema.");
    }
  };

  return (
    <main className={sectionMainClass("ti")}>
      <SectionPageHead
        section="ti"
        title="Acesso a Sistemas"
        description="Hub corporativo de links para sistemas internos e externos, com URLs por ambiente."
        actions={
          canManage ? (
            <div className="systems-hub__head-actions">
              <button type="button" className="systems-hub__create-btn" onClick={openCreate}>
                <i className="fa-solid fa-plus" aria-hidden="true" />
                Novo Sistema
              </button>
              <label className="systems-hub__inactive-toggle">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(event) => setIncludeInactive(event.target.checked)}
                />
                <span>Exibir inativos</span>
              </label>
            </div>
          ) : null
        }
      />

      {feedback ? (
        <p className="systems-hub__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {list.isLoading ? (
        <div className="docs-hub__empty">
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
          <p>Carregando sistemas...</p>
        </div>
      ) : items.length > 0 ? (
        <section className="systems-hub__grid" aria-label="Sistemas corporativos">
          {items.map((item) => {
            const bookmarkId = systemBookmarkId(item.slug);
            const saved = isSaved(bookmarkId);

            return (
              <article
                key={item.id}
                className={`docs-hub__card docs-hub__card--ti systems-hub__card${
                  item.isActive ? "" : " is-inactive"
                }`}
              >
                <div className="systems-hub__card-top">
                  <button
                    type="button"
                    className={`systems-hub__bookmark${saved ? " is-saved" : ""}`}
                    aria-label={saved ? "Remover dos bookmarks" : "Salvar nos bookmarks"}
                    onClick={() => toggleBookmark(bookmarkId)}
                  >
                    <i className={`fa-${saved ? "solid" : "regular"} fa-bookmark`} aria-hidden="true" />
                  </button>
                  {canManage ? (
                    <SystemCardActionsMenu
                      onEdit={() => openEdit(item)}
                      onDeactivate={item.isActive ? () => void handleDelete(item) : undefined}
                    />
                  ) : null}
                </div>

                <button
                  type="button"
                  className="systems-hub__card-icon-btn docs-hub__card-icon docs-hub__card-icon--ti"
                  onClick={() => handleOpen(item)}
                  disabled={!item.launchUrl}
                  title={item.launchUrl ? `Abrir ${item.name}` : "URL indisponível neste ambiente"}
                  aria-label={item.launchUrl ? `Abrir ${item.name}` : `${item.name} indisponível`}
                >
                  <SystemCardIcon system={item} />
                </button>

                <h2 className="docs-hub__card-title systems-hub__card-title">{item.name}</h2>
                <p className="docs-hub__card-desc systems-hub__card-desc">
                  {item.description ?? "Sem descrição."}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="docs-hub__empty">
          <i className="fa-regular fa-window-restore" aria-hidden="true" />
          <p>Nenhum sistema disponível no momento.</p>
        </div>
      )}

      <SystemFormModal
        open={editorOpen}
        title={editing ? `Editar ${editing.name}` : "Novo sistema"}
        initial={formInitial}
        saving={saving || uploadIconMutation.isPending}
        error={formError}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
