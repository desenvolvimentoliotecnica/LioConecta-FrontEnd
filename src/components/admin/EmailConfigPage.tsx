import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isAdminUser } from "../../api/auth";
import {
  useEmailConfiguration,
  useSaveEmailConfiguration,
  useTestEmailSmtp,
} from "../../api/hooks/useEmailConfig";
import { useMe } from "../../api/hooks/useMe";
import type { UpsertEmailConfigurationRequest } from "../../api/types";
import "../../styles/email-config-page.css";

const DEFAULT_FORM: UpsertEmailConfigurationRequest = {
  isEnabled: false,
  fromAddress: "",
  fromName: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  useStartTls: true,
  timeoutSeconds: 30,
  maxAttempts: 5,
  initialRetryDelaySeconds: 60,
  maxRetryDelaySeconds: 21600,
  dispatchBatchSize: 20,
  dispatchIntervalSeconds: 30,
};

function formatUpdatedAt(value?: string): string {
  if (!value) return "Nunca salvo";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function EmailConfigPage() {
  const meQuery = useMe();
  const configQuery = useEmailConfiguration();
  const saveMutation = useSaveEmailConfiguration();
  const testMutation = useTestEmailSmtp();

  const [form, setForm] = useState<UpsertEmailConfigurationRequest>(DEFAULT_FORM);
  const [testRecipient, setTestRecipient] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    title: string;
    detail?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!configQuery.data) return;
    setForm({
      isEnabled: configQuery.data.isEnabled,
      fromAddress: configQuery.data.fromAddress,
      fromName: configQuery.data.fromName,
      smtpHost: configQuery.data.smtpHost,
      smtpPort: configQuery.data.smtpPort || 587,
      smtpUsername: configQuery.data.smtpUsername,
      smtpPassword: "",
      useStartTls: configQuery.data.useStartTls,
      timeoutSeconds: configQuery.data.timeoutSeconds,
      maxAttempts: configQuery.data.maxAttempts,
      initialRetryDelaySeconds: configQuery.data.initialRetryDelaySeconds,
      maxRetryDelaySeconds: configQuery.data.maxRetryDelaySeconds,
      dispatchBatchSize: configQuery.data.dispatchBatchSize,
      dispatchIntervalSeconds: configQuery.data.dispatchIntervalSeconds,
    });
  }, [configQuery.data]);

  const updateField = <K extends keyof UpsertEmailConfigurationRequest>(
    key: K,
    value: UpsertEmailConfigurationRequest[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildPayload = (): UpsertEmailConfigurationRequest => ({
    ...form,
    fromAddress: form.fromAddress.trim(),
    fromName: form.fromName.trim(),
    smtpHost: form.smtpHost.trim(),
    smtpUsername: form.smtpUsername.trim(),
    smtpPassword: form.smtpPassword?.trim() ? form.smtpPassword.trim() : null,
    smtpPort: Number(form.smtpPort) || 587,
    timeoutSeconds: Number(form.timeoutSeconds) || 30,
    maxAttempts: Number(form.maxAttempts) || 5,
    initialRetryDelaySeconds: Number(form.initialRetryDelaySeconds) || 60,
    maxRetryDelaySeconds: Number(form.maxRetryDelaySeconds) || 21600,
    dispatchBatchSize: Number(form.dispatchBatchSize) || 20,
    dispatchIntervalSeconds: Number(form.dispatchIntervalSeconds) || 30,
  });

  const handleSave = async () => {
    setFeedback(null);
    try {
      await saveMutation.mutateAsync(buildPayload());
      setFeedback({ type: "success", title: "Configuração SMTP salva com sucesso." });
      updateField("smtpPassword", "");
    } catch {
      setFeedback({ type: "error", title: "Não foi possível salvar a configuração SMTP." });
    }
  };

  const handleTest = async () => {
    setFeedback(null);
    try {
      const result = await testMutation.mutateAsync({
        ...buildPayload(),
        testRecipient: testRecipient.trim() || null,
      });
      setFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch {
      setFeedback({ type: "error", title: "Falha ao testar conexão SMTP." });
    }
  };

  if (meQuery.isLoading) {
    return (
      <main className="main">
        <p className="email-config__empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!isAdminUser(meQuery.data)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/admin/email">E-mail</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Configuração SMTP</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Configuração SMTP</h1>
            <p className="page-header__desc">
              Credenciais e parâmetros de envio persistidos em banco — nenhuma chave em arquivos.
            </p>
          </div>
        </div>
      </header>

      <section className="email-config__intro" aria-label="Resumo">
        <div className="email-config__intro-head">
          <div className="email-config__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-envelope" />
          </div>
          <div>
            <div className="email-config__intro-title">Fila transacional</div>
            <p className="email-config__intro-text">
              O worker <code>email-dispatch</code> consome a fila e envia via SMTP usando esta
              configuração. Senha armazenada criptografada no PostgreSQL.
            </p>
            <p className="email-config__updated">
              Última atualização: {formatUpdatedAt(configQuery.data?.updatedAt)}
              {configQuery.data?.hasPassword ? " · senha configurada" : " · senha não configurada"}
            </p>
          </div>
        </div>
        <div className="email-config__intro-toolbar">
          <Link className="email-config__btn email-config__btn--ghost" to="/admin/email">
            Ver fila
          </Link>
          <Link className="email-config__btn email-config__btn--ghost" to="/admin/workers">
            Workers
          </Link>
        </div>
      </section>

      {configQuery.isError ? (
        <div className="email-config__alert email-config__alert--error">
          Não foi possível carregar a configuração. Verifique se o backend está em execução.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={`email-config__alert email-config__alert--${feedback.type}`}
          role="status"
        >
          <strong>{feedback.title}</strong>
          {feedback.detail ? <p>{feedback.detail}</p> : null}
        </div>
      ) : null}

      <form
        className="email-config__form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <label className="email-config__toggle">
          <input
            type="checkbox"
            checked={form.isEnabled}
            onChange={(event) => updateField("isEnabled", event.target.checked)}
          />
          <span className="email-config__toggle-track" aria-hidden="true" />
          <span>Habilitar envio de e-mails</span>
        </label>

        <div className="email-config__grid">
          <label className="email-config__field">
            <span>Host SMTP</span>
            <input
              type="text"
              value={form.smtpHost}
              onChange={(event) => updateField("smtpHost", event.target.value)}
              placeholder="smtp.empresa.com.br"
              autoComplete="off"
              required
            />
          </label>

          <label className="email-config__field">
            <span>Porta</span>
            <input
              type="number"
              min={1}
              max={65535}
              value={form.smtpPort}
              onChange={(event) => updateField("smtpPort", Number(event.target.value))}
              required
            />
          </label>

          <label className="email-config__field">
            <span>Usuário SMTP</span>
            <input
              type="text"
              value={form.smtpUsername}
              onChange={(event) => updateField("smtpUsername", event.target.value)}
              autoComplete="off"
            />
          </label>

          <label className="email-config__field email-config__field--password">
            <span>Senha SMTP</span>
            <div className="email-config__password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={form.smtpPassword ?? ""}
                onChange={(event) => updateField("smtpPassword", event.target.value)}
                placeholder={
                  configQuery.data?.hasPassword
                    ? "Deixe em branco para manter a senha atual"
                    : "Informe a senha"
                }
                autoComplete="new-password"
              />
              <button
                type="button"
                className="email-config__password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </label>

          <label className="email-config__field">
            <span>Remetente (e-mail)</span>
            <input
              type="email"
              value={form.fromAddress}
              onChange={(event) => updateField("fromAddress", event.target.value)}
              placeholder="noreply@liotecnica.com.br"
              autoComplete="off"
            />
          </label>

          <label className="email-config__field">
            <span>Nome do remetente</span>
            <input
              type="text"
              value={form.fromName}
              onChange={(event) => updateField("fromName", event.target.value)}
              placeholder="LioConecta"
              autoComplete="off"
            />
          </label>
        </div>

        <label className="email-config__toggle email-config__toggle--inline">
          <input
            type="checkbox"
            checked={form.useStartTls}
            onChange={(event) => updateField("useStartTls", event.target.checked)}
          />
          <span className="email-config__toggle-track" aria-hidden="true" />
          <span>Usar STARTTLS</span>
        </label>

        <fieldset className="email-config__fieldset">
          <legend>Fila e retry</legend>
          <div className="email-config__grid email-config__grid--compact">
            <label className="email-config__field">
              <span>Timeout (s)</span>
              <input
                type="number"
                min={5}
                max={300}
                value={form.timeoutSeconds}
                onChange={(event) => updateField("timeoutSeconds", Number(event.target.value))}
              />
            </label>
            <label className="email-config__field">
              <span>Máx. tentativas</span>
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxAttempts}
                onChange={(event) => updateField("maxAttempts", Number(event.target.value))}
              />
            </label>
            <label className="email-config__field">
              <span>Delay inicial retry (s)</span>
              <input
                type="number"
                min={10}
                value={form.initialRetryDelaySeconds}
                onChange={(event) =>
                  updateField("initialRetryDelaySeconds", Number(event.target.value))
                }
              />
            </label>
            <label className="email-config__field">
              <span>Delay máx. retry (s)</span>
              <input
                type="number"
                min={60}
                value={form.maxRetryDelaySeconds}
                onChange={(event) =>
                  updateField("maxRetryDelaySeconds", Number(event.target.value))
                }
              />
            </label>
            <label className="email-config__field">
              <span>Batch por ciclo</span>
              <input
                type="number"
                min={1}
                max={100}
                value={form.dispatchBatchSize}
                onChange={(event) => updateField("dispatchBatchSize", Number(event.target.value))}
              />
            </label>
            <label className="email-config__field">
              <span>Intervalo worker (s)</span>
              <input
                type="number"
                min={5}
                max={3600}
                value={form.dispatchIntervalSeconds}
                onChange={(event) =>
                  updateField("dispatchIntervalSeconds", Number(event.target.value))
                }
              />
            </label>
          </div>
        </fieldset>

        <div className="email-config__test-row">
          <label className="email-config__field email-config__field--grow">
            <span>Enviar teste para (opcional)</span>
            <input
              type="email"
              value={testRecipient}
              onChange={(event) => setTestRecipient(event.target.value)}
              placeholder="seu.email@liotecnica.com.br"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="email-config__actions">
          <button
            type="button"
            className="email-config__btn email-config__btn--ghost"
            onClick={() => void handleTest()}
            disabled={testMutation.isPending || configQuery.isLoading}
          >
            {testMutation.isPending ? "Testando…" : "Testar SMTP"}
          </button>
          <button
            type="submit"
            className="email-config__btn email-config__btn--primary"
            disabled={saveMutation.isPending || configQuery.isLoading}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar configuração"}
          </button>
        </div>
      </form>
    </main>
  );
}
