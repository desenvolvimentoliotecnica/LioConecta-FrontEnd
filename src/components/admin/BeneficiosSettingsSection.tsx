import { useEffect, useState } from "react";
import { useBenefitsSettings, useSaveBenefitsSettings } from "../../api/hooks/useBenefitsSettings";
import type { UserRole } from "../../api/types";
import {
  DEFAULT_BENEFICIOS_SETTINGS,
  type BeneficiosSettings,
} from "../../config/beneficios/settings";
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

export function BeneficiosSettingsSection() {
  const { data: settings, isLoading, isError } = useBenefitsSettings();
  const saveMutation = useSaveBenefitsSettings();
  const [form, setForm] = useState<BeneficiosSettings>(DEFAULT_BENEFICIOS_SETTINGS);
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
    const next: BeneficiosSettings = {
      allowedRoles: form.allowedRoles,
      allowedEmails: parseEmails(editorEmails),
    };

    try {
      await saveMutation.mutateAsync(next);
      setFeedback({ type: "success", message: "Permissões de benefícios salvas." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível salvar as permissões." });
    }
  };

  if (isLoading) return <p>Carregando permissões de benefícios...</p>;
  if (isError) return <p>Não foi possível carregar as permissões de benefícios.</p>;

  return (
    <div className="org-governance__settings">
      <fieldset>
        <legend>Perfis com permissão de gestão</legend>
        <div className="org-governance__role-grid">
          {ROLE_OPTIONS.map((role) => (
            <label key={role}>
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

      <label>
        E-mails autorizados (um por linha)
        <textarea
          rows={5}
          value={editorEmails}
          onChange={(event) => setEditorEmails(event.target.value)}
          placeholder="rh@empresa.com.br"
        />
      </label>

      {feedback ? (
        <p className={feedback.type === "success" ? "org-governance__success" : "org-governance__error"}>
          {feedback.message}
        </p>
      ) : null}

      <button
        type="button"
        className="org-governance__btn org-governance__btn--primary"
        disabled={saveMutation.isPending}
        onClick={() => void handleSave()}
      >
        {saveMutation.isPending ? "Salvando..." : "Salvar permissões"}
      </button>
    </div>
  );
}
