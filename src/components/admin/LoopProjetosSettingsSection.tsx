import { useEffect, useRef, useState } from "react";
import { config } from "../../api/client";
import { useLoopSettings, useSaveLoopSettings } from "../../api/hooks/useLoopSettings";
import { DEFAULT_LOOP_SETTINGS, loopSettingsFingerprint, type LoopSettings } from "../../config/loop/settings";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { RbacDeprecatedNotice } from "../auth/RbacDeprecatedNotice";
import "../../styles/organogram-governance-page.css";

export function LoopProjetosSettingsSection() {
  const { data: settings, fingerprint, isLoading, isError } = useLoopSettings();
  const saveMutation = useSaveLoopSettings();
  const [form, setForm] = useState<LoopSettings>(DEFAULT_LOOP_SETTINGS);
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

    const next: LoopSettings = { ...form };

    try {
      const { settings: saved, persistedToServer } = await saveMutation.mutateAsync(next);
      setForm(saved);
      hydratedFingerprint.current = loopSettingsFingerprint(saved);
      setFeedback({
        type: persistedToServer ? "success" : "warn",
        message: config.useMock
          ? "Configurações do Loop salvas localmente (modo mock)."
          : persistedToServer
            ? "Configurações do Loop salvas no servidor."
            : "Configurações guardadas neste navegador. Reinicie a API com a versão que inclui as chaves loop.* para persistir no banco.",
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
      <RbacDeprecatedNotice permissionKey={PERMISSIONS.loop.access} moduleLabel="Loop de Projetos" />

      <div className="org-governance__intro-head">
        <div className="org-governance__intro-icon loop-settings__icon" aria-hidden="true">
          <i className="fa-solid fa-infinity" />
        </div>
        <div>
          <div className="org-governance__intro-title">Loop de Projetos e Equipes</div>
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
          Módulo Loop habilitado
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
