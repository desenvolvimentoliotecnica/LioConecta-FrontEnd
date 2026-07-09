import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/rbac/permissions";
import {
  useSaveTotvsRmConfiguration,
  useTestTotvsRmConnection,
  useTotvsRmConfiguration,
} from "../../api/hooks/useTotvsRm";
import type { UpsertTotvsRmConfigurationRequest } from "../../api/types";
import "../../styles/totvs-rm-config-page.css";

const DEFAULT_FORM: UpsertTotvsRmConfigurationRequest = {
  isEnabled: false,
  server: "",
  port: 1433,
  database: "",
  userName: "",
  password: "",
  trustServerCertificate: true,
  timesheetPeriodStartDay: 16,
  timesheetPeriodEndDay: 15,
};

function clampPeriodDay(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 1 && value <= 28 ? value : fallback;
}

function formatUpdatedAt(value?: string): string {
  if (!value) return "Nunca salvo";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function TotvsRmConfigPage() {
  const { hasPermission, isLoading: meLoading } = usePermissions();
  const configQuery = useTotvsRmConfiguration();
  const saveMutation = useSaveTotvsRmConfiguration();
  const testMutation = useTestTotvsRmConnection();

  const [form, setForm] = useState<UpsertTotvsRmConfigurationRequest>(DEFAULT_FORM);
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
      server: configQuery.data.server,
      port: configQuery.data.port || 1433,
      database: configQuery.data.database,
      userName: configQuery.data.userName,
      password: "",
      trustServerCertificate: configQuery.data.trustServerCertificate,
      timesheetPeriodStartDay: configQuery.data.timesheetPeriodStartDay || 16,
      timesheetPeriodEndDay: configQuery.data.timesheetPeriodEndDay || 15,
    });
  }, [configQuery.data]);

  const updateField = <K extends keyof UpsertTotvsRmConfigurationRequest>(
    key: K,
    value: UpsertTotvsRmConfigurationRequest[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildPayload = (): UpsertTotvsRmConfigurationRequest => ({
    ...form,
    server: form.server.trim(),
    database: form.database.trim(),
    userName: form.userName.trim(),
    password: form.password?.trim() ? form.password.trim() : null,
    port: Number(form.port) || 1433,
    timesheetPeriodStartDay: clampPeriodDay(form.timesheetPeriodStartDay, 16),
    timesheetPeriodEndDay: clampPeriodDay(form.timesheetPeriodEndDay, 15),
  });

  const handleSave = async () => {
    setFeedback(null);
    try {
      await saveMutation.mutateAsync(buildPayload());
      setFeedback({
        type: "success",
        title: "Configuração salva com sucesso.",
      });
      updateField("password", "");
    } catch {
      setFeedback({
        type: "error",
        title: "Não foi possível salvar a configuração TOTVS RM.",
      });
    }
  };

  const handleTest = async () => {
    setFeedback(null);
    try {
      const result = await testMutation.mutateAsync(buildPayload());
      setFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch {
      setFeedback({
        type: "error",
        title: "Falha ao testar conexão com o TOTVS RM.",
      });
    }
  };

  if (meLoading) {
    return (
      <main className="main">
        <p className="totvs-rm-config__empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasPermission(PERMISSIONS.admin.totvsManage)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/admin/workers">Workers</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">TOTVS RM</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Integração TOTVS RM — Ponto</h1>
            <p className="page-header__desc">
              Conexão SQL Server read-only com o Corpore para espelho de ponto (ABATFUN / AAFHTFUN).
              CodColigada fixa: 1.
            </p>
          </div>
        </div>
      </header>

      <section className="totvs-rm-config__intro" aria-label="Resumo">
        <div className="totvs-rm-config__intro-head">
          <div className="totvs-rm-config__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-database" />
          </div>
          <div>
            <div className="totvs-rm-config__intro-title">Automação de ponto</div>
            <p className="totvs-rm-config__intro-text">
              Credenciais com permissão de leitura nas tabelas ABATFUN, ANATUBAT e AAFHTFUN. O worker{" "}
              <code>totvs-timesheet-sync</code> usa esta conexão para popular o cache local.
            </p>
            <p className="totvs-rm-config__updated">
              Última atualização: {formatUpdatedAt(configQuery.data?.updatedAt)}
              {configQuery.data?.hasPassword ? " · senha configurada" : " · senha não configurada"}
            </p>
          </div>
        </div>
      </section>

      {configQuery.isError ? (
        <div className="totvs-rm-config__alert totvs-rm-config__alert--error">
          Não foi possível carregar a configuração. Verifique se o backend está em execução.
        </div>
      ) : null}

      {feedback ? (
        <div
          className={`totvs-rm-config__alert totvs-rm-config__alert--${feedback.type}`}
          role="status"
        >
          <strong>{feedback.title}</strong>
          {feedback.detail ? <p>{feedback.detail}</p> : null}
        </div>
      ) : null}

      <form
        className="totvs-rm-config__form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <label className="totvs-rm-config__toggle">
          <input
            type="checkbox"
            checked={form.isEnabled}
            onChange={(event) => updateField("isEnabled", event.target.checked)}
          />
          <span className="totvs-rm-config__toggle-track" aria-hidden="true" />
          <span>Habilitar integração TOTVS RM</span>
        </label>

        <div className="totvs-rm-config__grid">
          <label className="totvs-rm-config__field">
            <span>Servidor SQL</span>
            <input
              type="text"
              value={form.server}
              onChange={(event) => updateField("server", event.target.value)}
              placeholder="sqlserver.empresa.local"
              autoComplete="off"
              required
            />
          </label>

          <label className="totvs-rm-config__field">
            <span>Porta</span>
            <input
              type="number"
              min={1}
              max={65535}
              value={form.port}
              onChange={(event) => updateField("port", Number(event.target.value))}
              required
            />
          </label>

          <label className="totvs-rm-config__field">
            <span>Database</span>
            <input
              type="text"
              value={form.database}
              onChange={(event) => updateField("database", event.target.value)}
              placeholder="Corpore"
              autoComplete="off"
              required
            />
          </label>

          <label className="totvs-rm-config__field">
            <span>Usuário SQL</span>
            <input
              type="text"
              value={form.userName}
              onChange={(event) => updateField("userName", event.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <label className="totvs-rm-config__field totvs-rm-config__field--password">
            <span>Senha SQL</span>
            <div className="totvs-rm-config__password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password ?? ""}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder={
                  configQuery.data?.hasPassword
                    ? "Deixe em branco para manter a senha atual"
                    : "Informe a senha"
                }
                autoComplete="new-password"
              />
              <button
                type="button"
                className="totvs-rm-config__password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </label>
        </div>

        <label className="totvs-rm-config__toggle totvs-rm-config__toggle--inline">
          <input
            type="checkbox"
            checked={form.trustServerCertificate}
            onChange={(event) => updateField("trustServerCertificate", event.target.checked)}
          />
          <span className="totvs-rm-config__toggle-track" aria-hidden="true" />
          <span>Trust Server Certificate (recomendado em HML)</span>
        </label>

        <fieldset className="totvs-rm-config__fieldset">
          <legend>Período de fechamento do ponto</legend>
          <p className="totvs-rm-config__fieldset-help">
            Define o ciclo de apuração exibido no espelho de ponto. Ex.: início dia 16 e fim dia 15
            corresponde ao período 16/MM-1 até 15/MM (mês de referência = mês do fechamento).
          </p>
          <div className="totvs-rm-config__grid totvs-rm-config__grid--period">
            <label className="totvs-rm-config__field">
              <span>Dia de início</span>
              <input
                type="number"
                min={1}
                max={28}
                value={form.timesheetPeriodStartDay}
                onChange={(event) =>
                  updateField("timesheetPeriodStartDay", Number(event.target.value))
                }
                required
              />
            </label>
            <label className="totvs-rm-config__field">
              <span>Dia de fechamento</span>
              <input
                type="number"
                min={1}
                max={28}
                value={form.timesheetPeriodEndDay}
                onChange={(event) =>
                  updateField("timesheetPeriodEndDay", Number(event.target.value))
                }
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="totvs-rm-config__actions">
          <button
            type="button"
            className="totvs-rm-config__btn totvs-rm-config__btn--ghost"
            onClick={() => void handleTest()}
            disabled={testMutation.isPending || configQuery.isLoading}
          >
            {testMutation.isPending ? "Testando…" : "Testar conexão"}
          </button>
          <button
            type="submit"
            className="totvs-rm-config__btn totvs-rm-config__btn--primary"
            disabled={saveMutation.isPending || configQuery.isLoading}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar configuração"}
          </button>
        </div>
      </form>
    </main>
  );
}
