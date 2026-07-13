import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../../api/client";
import { useCompassSettings, useSaveCompassSettings } from "../../api/hooks/useCompassSettings";
import {
  COMPASS_SECRET_MASK,
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

  const disabled = isLoading || saveMutation.isPending;

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
            Habilita o módulo e configura o acesso de leitura ao Datalake (`etl_hyperion`) usado pelos cenários.
            Quem pode acessar o Compass é definido em Controle de acesso.
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
            disabled={disabled}
            onChange={(e) => setForm((c) => ({ ...c, enabled: e.target.checked }))}
          />
          Módulo Compass habilitado
        </label>

        <div className="loop-settings__subsection">
          <h3 className="loop-settings__subtitle">Datalake (cenários Hyperion)</h3>
          <p className="org-governance__intro-text">
            Credenciais PostgreSQL para consultar <code>public.etl_hyperion</code>. Database padrão{" "}
            <code>datalake</code>, porta <code>5432</code>.
          </p>

          <label className="org-governance__field">
            <span>Host</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="ex.: 172.19.30.13"
              value={form.datalakeHost}
              disabled={disabled}
              onChange={(e) => setForm((c) => ({ ...c, datalakeHost: e.target.value }))}
            />
          </label>

          <label className="org-governance__field">
            <span>Usuário</span>
            <input
              type="text"
              autoComplete="off"
              value={form.datalakeUsername}
              disabled={disabled}
              onChange={(e) => setForm((c) => ({ ...c, datalakeUsername: e.target.value }))}
            />
          </label>

          <label className="org-governance__field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder={form.datalakePasswordHasValue ? "Senha já configurada — digite para alterar" : "Informe a senha"}
              value={form.datalakePassword}
              disabled={disabled}
              onChange={(e) => setForm((c) => ({ ...c, datalakePassword: e.target.value }))}
              onFocus={() => {
                if (form.datalakePassword === COMPASS_SECRET_MASK) {
                  setForm((c) => ({ ...c, datalakePassword: "" }));
                }
              }}
            />
          </label>

          <div className="loop-settings__row">
            <label className="org-governance__field">
              <span>Database</span>
              <input
                type="text"
                value={form.datalakeDatabase}
                disabled={disabled}
                onChange={(e) => setForm((c) => ({ ...c, datalakeDatabase: e.target.value }))}
              />
            </label>
            <label className="org-governance__field">
              <span>Porta</span>
              <input
                type="number"
                min={1}
                max={65535}
                value={form.datalakePort}
                disabled={disabled}
                onChange={(e) => setForm((c) => ({ ...c, datalakePort: e.target.value }))}
              />
            </label>
          </div>

          <p className="org-governance__intro-text">
            Após salvar, os totais aparecem em{" "}
            <Link to="/compass/cenarios">Compass → Cenários</Link>.
          </p>
        </div>

        <div className="org-governance__toolbar">
          <button
            type="submit"
            className="org-governance__btn org-governance__btn--primary"
            disabled={disabled}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
