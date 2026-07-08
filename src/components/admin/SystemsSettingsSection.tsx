import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSaveSystemsSettings, useSystemsSettings } from "../../api/hooks/useSystemsSettings";
import type { UserRole } from "../../api/types";
import { DEFAULT_SYSTEMS_SETTINGS, type SystemsSettings } from "../../config/systems/settings";
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

export function SystemsSettingsSection() {
  const { data: settings, isLoading, isError } = useSystemsSettings();
  const saveMutation = useSaveSystemsSettings();
  const [form, setForm] = useState<SystemsSettings>(DEFAULT_SYSTEMS_SETTINGS);
  const [editorEmails, setEditorEmails] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    setForm(settings);
    setEditorEmails(settings.allowedEmails.join("\n"));
  }, [settings, isLoading]);

  const toggleRole = (role: UserRole) => {
    setForm((current) => {
      const next = current.allowedRoles.includes(role)
        ? current.allowedRoles.filter((item) => item !== role)
        : [...current.allowedRoles, role];
      return { ...current, allowedRoles: next };
    });
  };

  const handleSave = async () => {
    setFeedback(null);
    const next: SystemsSettings = {
      ...form,
      allowedEmails: parseEmails(editorEmails),
    };

    try {
      await saveMutation.mutateAsync(next);
      setForm(next);
      setFeedback({
        type: "success",
        message: "Configurações do hub de sistemas salvas no servidor.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do hub de sistemas">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-table-cells" />
        </div>
        <div>
          <h3 className="org-governance__panel-title">Quem pode gerir o catálogo de sistemas</h3>
          <p className="org-governance__panel-desc">
            Por padrão, perfis TI (e Admin) podem criar, editar e desativar sistemas no hub. Inclua e-mails extras na
            whitelist quando necessário.
          </p>
        </div>
      </div>

      {isError ? (
        <p className="org-governance__feedback org-governance__feedback--error">
          Não foi possível carregar as configurações do servidor.
        </p>
      ) : null}

      <fieldset className="loop-settings__roles" disabled={isLoading || saveMutation.isPending}>
        <legend>Perfis autorizados</legend>
        <div className="loop-settings__role-grid">
          {ROLE_OPTIONS.map((role) => (
            <label key={role} className="loop-settings__role-item">
              <input
                type="checkbox"
                checked={form.allowedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="loop-settings__emails">
        <span>E-mails autorizados (um por linha)</span>
        <textarea
          rows={4}
          value={editorEmails}
          onChange={(event) => setEditorEmails(event.target.value)}
          placeholder="ti@empresa.com.br"
          disabled={isLoading || saveMutation.isPending}
        />
      </label>

      {feedback ? (
        <p
          className={`org-governance__feedback org-governance__feedback--${feedback.type}`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="org-governance__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void handleSave()}
          disabled={isLoading || saveMutation.isPending}
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar permissões"}
        </button>
        <Link className="btn btn--ghost" to="/servicos/acesso-sistemas">
          Abrir hub de sistemas
        </Link>
      </div>
    </section>
  );
}
