import { useEffect, useRef, useState } from "react";
import { config } from "../../api/client";
import { useSaveUniLioSettings, useUniLioSettings } from "../../api/hooks/useUniLioSettings";
import type { UserRole } from "../../api/types";
import {
  DEFAULT_UNILIO_SETTINGS,
  unilioSettingsFingerprint,
  type UniLioSettings,
} from "../../config/unilio/settings";
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

export function UniLioSettingsSection() {
  const { data: settings, fingerprint, isLoading, isError } = useUniLioSettings();
  const saveMutation = useSaveUniLioSettings();
  const [form, setForm] = useState<UniLioSettings>(DEFAULT_UNILIO_SETTINGS);
  const [extraEmails, setExtraEmails] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warn"; message: string } | null>(null);
  const hydratedFingerprint = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (hydratedFingerprint.current === fingerprint) return;

    setForm(settings);
    setExtraEmails(settings.allowedEmails.join("\n"));
    hydratedFingerprint.current = fingerprint;
  }, [fingerprint, isLoading, settings]);

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

    const next: UniLioSettings = { ...form, allowedEmails: parseEmails(extraEmails) };

    try {
      const { settings: saved, persistedToServer } = await saveMutation.mutateAsync(next);
      setForm(saved);
      setExtraEmails(saved.allowedEmails.join("\n"));
      hydratedFingerprint.current = unilioSettingsFingerprint(saved);
      setFeedback({
        type: persistedToServer ? "success" : "warn",
        message: config.useMock
          ? "Configurações do UniLio salvas localmente (modo mock)."
          : persistedToServer
            ? "Configurações do UniLio salvas no servidor."
            : "Configurações guardadas neste navegador. Reinicie a API com a versão que inclui as chaves unilio.* para persistir no banco.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do UniLio. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do UniLio">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-graduation-cap" />
        </div>
        <div>
          <div className="org-governance__intro-title">UniLio — Portal de Aprendizagem</div>
          <p className="org-governance__intro-text">
            Define quem pode acessar o módulo de universidade corporativa (LMS) pelo menu lateral.
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
          Módulo UniLio habilitado
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
          <span>E-mails adicionais com acesso (um por linha)</span>
          <textarea
            rows={4}
            value={extraEmails}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setExtraEmails(e.target.value)}
            placeholder="colaborador@empresa.com.br"
          />
          <small className="backend-config-page__field-hint">
            Lista de permissão: estes e-mails entram no UniLio mesmo sem o perfil marcado acima.
          </small>
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
