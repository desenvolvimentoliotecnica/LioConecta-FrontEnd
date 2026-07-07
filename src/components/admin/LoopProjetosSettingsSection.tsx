import { useEffect, useState } from "react";
import { config } from "../../api/client";
import { useLoopSettings, useSaveLoopSettings } from "../../api/hooks/useLoopSettings";
import type { UserRole } from "../../api/types";
import { DEFAULT_LOOP_SETTINGS, type LoopSettings } from "../../config/loop/settings";
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

export function LoopProjetosSettingsSection() {
  const { data: settings, isLoading, isError } = useLoopSettings();
  const saveMutation = useSaveLoopSettings();
  const [form, setForm] = useState<LoopSettings>(DEFAULT_LOOP_SETTINGS);
  const [extraEmails, setExtraEmails] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    setForm(settings);
    setExtraEmails(settings.allowedEmails.join("\n"));
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

    const next: LoopSettings = { ...form, allowedEmails: parseEmails(extraEmails) };

    try {
      await saveMutation.mutateAsync(next);
      setForm(next);
      setFeedback({
        type: "success",
        message: config.useMock
          ? "Configurações do Loop salvas localmente (modo mock)."
          : "Configurações do Loop salvas no servidor.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do Loop. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do Loop de Projetos">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-infinity" />
        </div>
        <div>
          <div className="org-governance__intro-title">Loop de Projetos e Equipes</div>
          <p className="org-governance__intro-text">
            Define quem pode acessar o módulo de gestão de projetos pelo menu lateral (∞ Loop).
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
            checked={form.enabled}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setForm((c) => ({ ...c, enabled: e.target.checked }))}
          />
          Módulo Loop habilitado
        </label>

        <div className="org-governance__field org-governance__field--full">
          <span>Perfis com acesso</span>
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
          <span>E-mails adicionais (um por linha)</span>
          <textarea
            rows={4}
            value={extraEmails}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setExtraEmails(e.target.value)}
            placeholder="gestor@empresa.com.br"
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
