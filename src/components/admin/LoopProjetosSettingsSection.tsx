import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "../../api/client";
import { LOOP_SETTINGS_QUERY_KEY } from "../../api/hooks/useLoopSettings";
import type { UserRole } from "../../api/types";
import {
  DEFAULT_LOOP_SETTINGS,
  writeLoopSettingsToStorage,
  type LoopSettings,
} from "../../config/loop/settings";

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

export function LoopProjetosSettingsSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LoopSettings>(DEFAULT_LOOP_SETTINGS);
  const [extraEmails, setExtraEmails] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lioconecta.loop.settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LoopSettings;
        setForm(parsed);
        setExtraEmails(parsed.allowedEmails.join("\n"));
      } catch {
        // defaults
      }
    }
  }, []);

  const toggleRole = (role: UserRole) => {
    setForm((current) => {
      const next = current.allowedRoles.includes(role)
        ? current.allowedRoles.filter((r) => r !== role)
        : [...current.allowedRoles, role];
      return { ...current, allowedRoles: next };
    });
  };

  const handleSave = () => {
    const allowedEmails = extraEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const next: LoopSettings = { ...form, allowedEmails };
    writeLoopSettingsToStorage(next);
    void queryClient.invalidateQueries({ queryKey: LOOP_SETTINGS_QUERY_KEY });
    setFeedback({
      type: "success",
      message: config.useMock
        ? "Configurações do Loop salvas localmente (modo mock)."
        : "Configurações do Loop salvas. Sincronize com a API quando disponível.",
    });
  };

  return (
    <section className="org-governance__panel" aria-label="Configurações do Loop de Projetos">
      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-infinity" />
        </div>
        <div>
          <div className="org-governance__intro-title">Loop de Projetos e Equipes</div>
          <p className="org-governance__intro-text">
            Define quem pode acessar o módulo de gestão de projetos pelo menu lateral (∞ Loop).
          </p>
        </div>
      </div>

      <div className="org-governance__field">
        <label className="org-governance__checkbox">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((c) => ({ ...c, enabled: e.target.checked }))}
          />
          Módulo Loop habilitado
        </label>
      </div>

      <fieldset className="org-governance__fieldset">
        <legend>Perfis com acesso</legend>
        <div className="org-governance__role-grid">
          {ROLE_OPTIONS.map((role) => (
            <label key={role} className="org-governance__checkbox">
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

      <div className="org-governance__field">
        <label htmlFor="loop-extra-emails">E-mails adicionais (um por linha)</label>
        <textarea
          id="loop-extra-emails"
          className="org-governance__textarea"
          rows={3}
          value={extraEmails}
          onChange={(e) => setExtraEmails(e.target.value)}
          placeholder="gestor@empresa.com.br"
        />
      </div>

      {feedback ? (
        <div
          className={`org-governance__feedback org-governance__feedback--${feedback.type}`}
          role="status"
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="org-governance__actions">
        <button type="button" className="org-governance__btn org-governance__btn--primary" onClick={handleSave}>
          Salvar configurações
        </button>
      </div>
    </section>
  );
}
