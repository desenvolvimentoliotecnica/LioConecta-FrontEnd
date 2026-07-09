import { useEffect, useRef, useState } from "react";
import { config } from "../../api/client";
import { useCompassSettings, useSaveCompassSettings } from "../../api/hooks/useCompassSettings";
import {
  DEFAULT_COMPASS_SETTINGS,
  compassSettingsFingerprint,
  type CompassSettings,
} from "../../config/compass/settings";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

export function CompassSettingsSection() {
  const { data: settings, fingerprint, isLoading, isError } = useCompassSettings();
  const saveMutation = useSaveCompassSettings();
  const [form, setForm] = useState<CompassSettings>(DEFAULT_COMPASS_SETTINGS);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warn"; message: string } | null>(null);
  const hydratedFingerprint = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (hydratedFingerprint.current === fingerprint) return;

    setForm(settings);
    hydratedFingerprint.current = fingerprint;
  }, [fingerprint, isLoading, settings]);

  const handleSave = async () => {
    setFeedback(null);

    const next: CompassSettings = { ...form };

    try {
      const { settings: saved, persistedToServer } = await saveMutation.mutateAsync(next);
      setForm(saved);
      hydratedFingerprint.current = compassSettingsFingerprint(saved);
      setFeedback({
        type: persistedToServer ? "success" : "warn",
        message: config.useMock
          ? "Configurações do Compass salvas localmente (modo mock)."
          : persistedToServer
            ? "Configurações do Compass salvas no servidor."
            : "Configurações guardadas neste navegador. Reinicie a API com a versão que inclui as chaves compass.* para persistir no banco.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível salvar as configurações do Compass. Tente novamente.",
      });
    }
  };

  return (
    <section className="org-governance__panel loop-settings" aria-label="Configurações do Compass IBP">
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.compass.access} moduleLabel="Compass IBP" />

      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-compass" />
        </div>
        <div>
          <div className="org-governance__intro-title">Compass IBP</div>
          <p className="org-governance__intro-text">
            Habilita ou desabilita o módulo no portal. Quem pode acessar é definido em Controle de acesso.
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
          Módulo Compass habilitado
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
