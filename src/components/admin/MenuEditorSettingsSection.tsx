import { useEffect, useState } from "react";
import { useMenuEditorSettings, useSaveMenuEditorSettings } from "../../api/hooks/useMenuEditorSettings";
import { DEFAULT_MENU_EDITOR_SETTINGS, type MenuEditorSettings } from "../../config/facilities/menu";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

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
  const [emailRecipients, setEmailRecipients] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    setForm(settings);
    setEmailRecipients(settings.emailRecipients.join("\n"));
  }, [settings, isLoading]);

  const handleSave = async () => {
    setFeedback(null);

    const next: MenuEditorSettings = {
      ...form,
      allowedRoles: settings.allowedRoles,
      allowedEmails: settings.allowedEmails,
      emailRecipients: parseEmails(emailRecipients),
    };

    try {
      await saveMutation.mutateAsync(next);
      setForm(next);
      setFeedback({
        type: "success",
        message: "Destinatários do envio semanal salvos no servidor.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do cardápio.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do cardápio">
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.facilities.menuManage} moduleLabel="Gestão de cardápio" />

      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-utensils" />
        </div>
        <div>
          <div className="org-governance__intro-title">Gestão de cardápio (Facilities)</div>
          <p className="org-governance__intro-text">
            Quem edita o cardápio é definido em Controle de acesso. Aqui você configura apenas os destinatários padrão
            do envio semanal por e-mail.
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
            {saveMutation.isPending ? "Salvando…" : "Salvar destinatários"}
          </button>
        </div>
      </form>
    </section>
  );
}
