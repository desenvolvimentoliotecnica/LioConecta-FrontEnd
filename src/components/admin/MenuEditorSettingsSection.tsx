import { useEffect, useState } from "react";
import { useMenuEditorSettings, useSaveMenuEditorSettings } from "../../api/hooks/useMenuEditorSettings";
import type { UserRole } from "../../api/types";
import { DEFAULT_MENU_EDITOR_SETTINGS, type MenuEditorSettings } from "../../config/facilities/menu";
import "../../styles/organogram-governance-page.css";

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

function parseEmails(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function MenuEditorSettingsSection() {
  const { data: settings, isLoading, isError } = useMenuEditorSettings();
  const saveMutation = useSaveMenuEditorSettings();
  const [form, setForm] = useState<MenuEditorSettings>(DEFAULT_MENU_EDITOR_SETTINGS);
  const [editorEmails, setEditorEmails] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    setForm(settings);
    setEditorEmails(settings.allowedEmails.join("\n"));
    setEmailRecipients(settings.emailRecipients.join("\n"));
  }, [settings, isLoading]);

  const toggleRole = (role: UserRole) => {
    setForm((current) => {
      const next = current.allowedRoles.includes(role)
        ? current.allowedRoles.filter((r) => r !== role)
        : [...current.allowedRoles, role];
      return { ...current, allowedRoles: next };
    });
  };

  const handleSave = async () => {
    setFeedback(null);

    const next: MenuEditorSettings = {
      ...form,
      allowedEmails: parseEmails(editorEmails),
      emailRecipients: parseEmails(emailRecipients),
    };

    try {
      await saveMutation.mutateAsync(next);
      setForm(next);
      setFeedback({
        type: "success",
        message: "Configurações do cardápio salvas no servidor.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do cardápio. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do cardápio">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-utensils" />
        </div>
        <div>
          <div className="org-governance__intro-title">Gestão de cardápio (Facilities)</div>
          <p className="org-governance__intro-text">
            Define quem pode editar o cardápio semanal e os destinatários padrão do envio por e-mail.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="org-governance__alert org-governance__alert--error" role="alert">
          Não foi possível carregar as configurações do servidor.
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
        <div className="org-governance__field org-governance__field--full">
          <span>Perfis com permissão de edição</span>
          <div className="org-governance__role-list">
            {ROLE_OPTIONS.map((role) => (
              <label key={role} className="org-governance__role-chip">
                <input
                  type="checkbox"
                  checked={form.allowedRoles.includes(role)}
                  disabled={isLoading || saveMutation.isPending}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <label className="org-governance__field org-governance__field--full">
          <span>E-mails com permissão de edição (um por linha)</span>
          <textarea
            rows={4}
            value={editorEmails}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setEditorEmails(e.target.value)}
            placeholder="endomarketing@liotecnica.com.br"
          />
        </label>

        <label className="org-governance__field org-governance__field--full">
          <span>Destinatários padrão do envio semanal (um por linha)</span>
          <textarea
            rows={4}
            value={emailRecipients}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="colaboradores@liotecnica.com.br"
          />
        </label>

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
