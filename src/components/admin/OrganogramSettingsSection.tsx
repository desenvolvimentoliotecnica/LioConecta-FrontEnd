import { useEffect, useState } from "react";
import {
  useOrgChartSettings,
  useSaveOrgChartSettings,
} from "../../api/hooks/useOrgChartSettings";
import type { UpsertOrgChartSettingsRequest, UserRole } from "../../api/types";

const ROLE_OPTIONS: UserRole[] = [
  "Employee",
  "Manager",
  "HR",
  "TI",
  "Facilities",
  "Legal",
  "Admin",
  "AnalyticsViewer",
  "KioskReader",
];

const DEFAULT_FORM: UpsertOrgChartSettingsRequest = {
  governanceEnabled: false,
  editAllowedRoles: ["Admin", "HR"],
  editAllowedEmails: [],
  viewFullAllowedRoles: ["Admin", "HR"],
  allowDisplayNameEdit: false,
  allowReimport: true,
  showOverrideBadge: true,
};

function formatUpdatedAt(value?: string): string {
  if (!value) return "Nunca salvo";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function parseEmails(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function OrganogramSettingsSection() {
  const settingsQuery = useOrgChartSettings();
  const saveMutation = useSaveOrgChartSettings();
  const [form, setForm] = useState<UpsertOrgChartSettingsRequest>(DEFAULT_FORM);
  const [extraEmails, setExtraEmails] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!settingsQuery.data) return;
    setForm({
      governanceEnabled: settingsQuery.data.governanceEnabled,
      editAllowedRoles: settingsQuery.data.editAllowedRoles,
      editAllowedEmails: settingsQuery.data.editAllowedEmails,
      viewFullAllowedRoles: settingsQuery.data.viewFullAllowedRoles,
      allowDisplayNameEdit: settingsQuery.data.allowDisplayNameEdit,
      allowReimport: settingsQuery.data.allowReimport,
      showOverrideBadge: settingsQuery.data.showOverrideBadge,
    });
    setExtraEmails(settingsQuery.data.editAllowedEmails.join("\n"));
  }, [settingsQuery.data]);

  const toggleRole = (field: "editAllowedRoles" | "viewFullAllowedRoles", role: UserRole) => {
    setForm((current) => {
      const list = current[field];
      const next = list.includes(role) ? list.filter((item) => item !== role) : [...list, role];
      return { ...current, [field]: next };
    });
  };

  const handleSave = async () => {
    setFeedback(null);
    try {
      await saveMutation.mutateAsync({
        ...form,
        editAllowedEmails: parseEmails(extraEmails),
      });
      setFeedback({ type: "success", message: "Configurações do organograma salvas." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível salvar as configurações." });
    }
  };

  return (
    <section className="org-governance__panel" aria-label="Configurações do organograma">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-sliders" />
        </div>
        <div>
          <div className="org-governance__intro-title">Políticas de governança</div>
          <p className="org-governance__intro-text">
            Define quem pode editar posições, ver o organograma completo e como overrides manuais são
            exibidos.
          </p>
          <p className="org-governance__intro-text">
            Última atualização: {formatUpdatedAt(settingsQuery.data?.updatedAt)}
          </p>
        </div>
      </div>

      {settingsQuery.isError ? (
        <div className="org-governance__alert org-governance__alert--error">
          Não foi possível carregar as configurações.
        </div>
      ) : null}

      {feedback ? (
        <div className={`org-governance__alert org-governance__alert--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <label className="org-governance__toggle">
          <input
            type="checkbox"
            checked={form.governanceEnabled}
            onChange={(event) =>
              setForm((current) => ({ ...current, governanceEnabled: event.target.checked }))
            }
          />
          <span>Habilitar governança do organograma</span>
        </label>

        <div className="org-governance__grid">
          <div className="org-governance__field org-governance__field--full">
            <span>Papéis com permissão de edição</span>
            <div className="org-governance__role-list">
              {ROLE_OPTIONS.map((role) => (
                <label key={`edit-${role}`} className="org-governance__role-chip">
                  <input
                    type="checkbox"
                    checked={form.editAllowedRoles.includes(role)}
                    onChange={() => toggleRole("editAllowedRoles", role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <div className="org-governance__field org-governance__field--full">
            <span>Papéis com visão completa</span>
            <div className="org-governance__role-list">
              {ROLE_OPTIONS.map((role) => (
                <label key={`view-${role}`} className="org-governance__role-chip">
                  <input
                    type="checkbox"
                    checked={form.viewFullAllowedRoles.includes(role)}
                    onChange={() => toggleRole("viewFullAllowedRoles", role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <label className="org-governance__field org-governance__field--full">
            <span>E-mails adicionais com permissão de edição (um por linha)</span>
            <textarea
              rows={4}
              value={extraEmails}
              onChange={(event) => setExtraEmails(event.target.value)}
              placeholder="nome@liotecnica.com.br"
            />
          </label>
        </div>

        <label className="org-governance__toggle">
          <input
            type="checkbox"
            checked={form.allowDisplayNameEdit}
            onChange={(event) =>
              setForm((current) => ({ ...current, allowDisplayNameEdit: event.target.checked }))
            }
          />
          <span>Permitir edição do nome de exibição</span>
        </label>

        <label className="org-governance__toggle">
          <input
            type="checkbox"
            checked={form.allowReimport}
            onChange={(event) =>
              setForm((current) => ({ ...current, allowReimport: event.target.checked }))
            }
          />
          <span>Permitir reimportação do Graph</span>
        </label>

        <label className="org-governance__toggle">
          <input
            type="checkbox"
            checked={form.showOverrideBadge}
            onChange={(event) =>
              setForm((current) => ({ ...current, showOverrideBadge: event.target.checked }))
            }
          />
          <span>Exibir badge de override manual nos cards</span>
        </label>

        <div className="org-governance__toolbar">
          <button
            type="submit"
            className="org-governance__btn org-governance__btn--primary"
            disabled={saveMutation.isPending || settingsQuery.isLoading}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
