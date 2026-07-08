import { useEffect, useState } from "react";
import { useRamaisSettings, useSaveRamaisSettings } from "../../api/hooks/useRamaisSettings";
import type { UserRole } from "../../api/types";
import { DEFAULT_RAMAIS_SETTINGS, type RamaisSettings } from "../../config/ramais/settings";
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

export function RamaisSettingsSection() {
  const { data: settings, isLoading, isError } = useRamaisSettings();
  const saveMutation = useSaveRamaisSettings();
  const [form, setForm] = useState<RamaisSettings>(DEFAULT_RAMAIS_SETTINGS);
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
    const next: RamaisSettings = {
      ...form,
      allowedEmails: parseEmails(editorEmails),
    };

    try {
      await saveMutation.mutateAsync(next);
      setForm(next);
      setFeedback({
        type: "success",
        message: "Configurações de ramais salvas no servidor.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações de ramais. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações da lista de ramais">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-phone" />
        </div>
        <div>
          <h3 className="org-governance__panel-title">Quem pode gerir a lista de ramais</h3>
          <p className="org-governance__panel-desc">
            Por padrão, perfis HR (e Admin) têm acesso ao CRUD. Inclua e-mails extras na whitelist quando necessário.
          </p>
        </div>
      </div>

      {isError ? (
        <p className="org-governance__feedback org-governance__feedback--error">
          Não foi possível carregar as configurações de ramais.
        </p>
      ) : null}

      <fieldset className="loop-settings__fieldset" disabled={isLoading || saveMutation.isPending}>
        <legend>Perfis autorizados</legend>
        <div className="loop-settings__roles">
          {ROLE_OPTIONS.map((role) => (
            <label key={role} className="loop-settings__role">
              <input
                type="checkbox"
                checked={form.allowedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {role}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="loop-settings__field">
        E-mails adicionais (um por linha)
        <textarea
          rows={5}
          value={editorEmails}
          disabled={isLoading || saveMutation.isPending}
          onChange={(event) => setEditorEmails(event.target.value)}
          placeholder="colaborador@liotecnica.com.br"
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

      <div className="loop-settings__actions">
        <button
          type="button"
          className="org-governance__btn org-governance__btn--primary"
          disabled={isLoading || saveMutation.isPending}
          onClick={() => void handleSave()}
        >
          {saveMutation.isPending ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </section>
  );
}
