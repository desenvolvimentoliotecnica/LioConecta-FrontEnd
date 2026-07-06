import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { isAdminUser } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAppSettings, useUpdateAppSettings } from "../../api/hooks/useAppSettings";
import { useTestGraphConnection } from "../../api/hooks/useGraphConfig";
import { useTestPlannerConnection } from "../../api/hooks/usePlannerConfig";
import { useTestGlpiConnection } from "../../api/hooks/useGlpiConfig";
import { useTestLdapConnection } from "../../api/hooks/useLdapConfig";
import { useMe } from "../../api/hooks/useMe";
import type { AppSettingCategoryDto, AppSettingDto } from "../../api/types";
import "../../styles/backend-config-page.css";

const SECRET_MASK = "********";
const GRAPH_TENANT_KEY = "graph.tenant_id";
const GRAPH_CLIENT_KEY = "graph.client_id";
const GRAPH_SECRET_KEY = "graph.client_secret";
const GLPI_BASE_URL_KEY = "glpi.base_url";
const GLPI_APP_TOKEN_KEY = "glpi.app_token";
const GLPI_USER_TOKEN_KEY = "glpi.user_token";
const LDAP_HOST_KEY = "ldap.host";
const LDAP_PORT_KEY = "ldap.port";
const LDAP_USE_SSL_KEY = "ldap.use_ssl";
const LDAP_BIND_DN_KEY = "ldap.bind_dn";
const LDAP_BIND_PASSWORD_KEY = "ldap.bind_password";
const LDAP_SEARCH_BASE_KEY = "ldap.search_base";
const INTEGRATIONS_MOCK_KEY = "integrations.use_dev_adapters";
const PLANNER_ENABLED_KEY = "planner.enabled";
const PLANNER_PLAN_ID_KEY = "planner.plan_id";
const PLANNER_DEFAULT_BUCKET_KEY = "planner.default_bucket_id";

function apiErrorDetail(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (error.status === 404) {
    return "Endpoint /admin/glpi/test não encontrado — recompile e reinicie a API LioConecta com a versão mais recente.";
  }
  if (typeof error.body === "string" && error.body.trim()) return error.body;
  if (error.body && typeof error.body === "object") {
    const record = error.body as Record<string, unknown>;
    const title = record.title ?? record.message ?? record.detail;
    if (typeof title === "string" && title.trim()) return title;
  }
  return error.message;
}

function buildDraft(categories: AppSettingCategoryDto[]): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const category of categories) {
    for (const setting of category.settings) {
      draft[setting.key] = setting.value;
    }
  }
  return draft;
}

function SettingField({
  setting,
  value,
  onChange,
}: {
  setting: AppSettingDto;
  value: string;
  onChange: (next: string) => void;
}) {
  const inputId = `setting-${setting.key.replace(/\./g, "-")}`;

  if (setting.valueType === "boolean") {
    return (
      <div className="backend-config-page__field">
        <label htmlFor={inputId}>
          {setting.label}
          {setting.isSecret ? (
            <span className="backend-config-page__badge">
              <i className="fa-solid fa-lock" aria-hidden="true" /> secreto
            </span>
          ) : null}
        </label>
        {setting.description ? (
          <span className="backend-config-page__field-hint">{setting.description}</span>
        ) : null}
        <select
          id={inputId}
          className="backend-config-page__select"
          value={value === "true" ? "true" : "false"}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="true">Sim (true)</option>
          <option value="false">Não (false)</option>
        </select>
      </div>
    );
  }

  const isMultiline =
    setting.valueType === "json" ||
    setting.valueType === "secret" ||
    setting.key.includes("connection");

  const inputType =
    setting.isSecret ? "password" : setting.valueType === "url" ? "url" : "text";

  return (
    <div className="backend-config-page__field">
      <label htmlFor={inputId}>
        {setting.label}
        {setting.isSecret ? (
          <span className="backend-config-page__badge">
            <i className="fa-solid fa-lock" aria-hidden="true" /> secreto
          </span>
        ) : null}
      </label>
      {setting.description ? (
        <span className="backend-config-page__field-hint">{setting.description}</span>
      ) : null}
      {isMultiline ? (
        <textarea
          id={inputId}
          className="backend-config-page__textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder={setting.isSecret && !setting.hasValue ? "Informe o valor secreto" : undefined}
        />
      ) : (
        <input
          id={inputId}
          className="backend-config-page__input"
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          placeholder={
            setting.valueType === "url"
              ? "https://..."
              : setting.isSecret && !setting.hasValue
                ? "Informe o valor secreto"
                : undefined
          }
        />
      )}
    </div>
  );
}

export function BackendConfigPage() {
  const [searchParams] = useSearchParams();
  const { data: me, isLoading: meLoading } = useMe();
  const { data: categories = [], isLoading, isError } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const testGraphConnection = useTestGraphConnection();
  const testPlannerConnection = useTestPlannerConnection();
  const testGlpiConnection = useTestGlpiConnection();
  const testLdapConnection = useTestLdapConnection();
  const [activeCategory, setActiveCategory] = useState<string>("database");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "warn" | "info" | "error"; text: string } | null>(
    null,
  );
  const [testFeedback, setTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);
  const [glpiTestFeedback, setGlpiTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);

  const [ldapTestFeedback, setLdapTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);

  const [plannerTestFeedback, setPlannerTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);

  const isAdmin = isAdminUser(me);

  useEffect(() => {
    if (categories.length > 0) {
      setDraft(buildDraft(categories));
      const categoryFromUrl = searchParams.get("category");
      if (categoryFromUrl && categories.some((category) => category.id === categoryFromUrl)) {
        setActiveCategory(categoryFromUrl);
      } else if (!categories.some((c) => c.id === activeCategory)) {
        setActiveCategory(categories[0]?.id ?? "database");
      }
    }
  }, [categories, activeCategory, searchParams]);

  const activeSection = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? categories[0],
    [categories, activeCategory],
  );

  const usesDevAdapters = (draft[INTEGRATIONS_MOCK_KEY] ?? "true") === "true";

  async function handleTestGraphConnection() {
    setTestFeedback(null);
    try {
      const clientSecret = draft[GRAPH_SECRET_KEY]?.trim();
      const result = await testGraphConnection.mutateAsync({
        tenantId: draft[GRAPH_TENANT_KEY]?.trim() || null,
        clientId: draft[GRAPH_CLIENT_KEY]?.trim() || null,
        clientSecret:
          clientSecret && clientSecret !== SECRET_MASK ? clientSecret : null,
      });
      setTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch {
      setTestFeedback({
        type: "error",
        title: "Falha ao testar conexão com o Microsoft Graph.",
      });
    }
  }

  async function handleTestGlpiConnection() {
    setGlpiTestFeedback(null);
    try {
      const appToken = draft[GLPI_APP_TOKEN_KEY]?.trim();
      const userToken = draft[GLPI_USER_TOKEN_KEY]?.trim();
      const result = await testGlpiConnection.mutateAsync({
        baseUrl: draft[GLPI_BASE_URL_KEY]?.trim() || null,
        appToken: appToken && appToken !== SECRET_MASK ? appToken : null,
        userToken: userToken && userToken !== SECRET_MASK ? userToken : null,
      });
      setGlpiTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch (error) {
      setGlpiTestFeedback({
        type: "error",
        title: "Falha ao testar conexão com o GLPI.",
        detail: apiErrorDetail(error),
      });
    }
  }

  async function handleTestLdapConnection() {
    setLdapTestFeedback(null);
    try {
      const bindPassword = draft[LDAP_BIND_PASSWORD_KEY]?.trim();
      const portRaw = draft[LDAP_PORT_KEY]?.trim();
      const port = portRaw ? Number.parseInt(portRaw, 10) : null;
      const result = await testLdapConnection.mutateAsync({
        host: draft[LDAP_HOST_KEY]?.trim() || null,
        port: Number.isFinite(port) ? port : null,
        useSsl: (draft[LDAP_USE_SSL_KEY] ?? "false") === "true",
        bindDn: draft[LDAP_BIND_DN_KEY]?.trim() || null,
        bindPassword: bindPassword && bindPassword !== SECRET_MASK ? bindPassword : null,
        searchBase: draft[LDAP_SEARCH_BASE_KEY]?.trim() || null,
      });
      setLdapTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch (error) {
      setLdapTestFeedback({
        type: "error",
        title: "Falha ao testar conexão LDAP.",
        detail: apiErrorDetail(error),
      });
    }
  }

  async function handleTestPlannerConnection() {
    setPlannerTestFeedback(null);
    try {
      const result = await testPlannerConnection.mutateAsync({
        planId: draft[PLANNER_PLAN_ID_KEY]?.trim() || null,
      });
      setPlannerTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch {
      setPlannerTestFeedback({
        type: "error",
        title: "Falha ao testar conexão com o Microsoft Planner.",
      });
    }
  }

  async function handleSave() {
    if (!activeSection) return;

    setFeedback(null);
    try {
      const result = await updateSettings.mutateAsync({
        settings: activeSection.settings.map((setting) => ({
          key: setting.key,
          value: draft[setting.key] ?? setting.value,
        })),
      });

      setDraft(buildDraft(result.categories));
      setFeedback({
        type: result.requiresRestart ? "warn" : "success",
        text: result.message ?? "Configurações salvas.",
      });
    } catch {
      setFeedback({ type: "warn", text: "Não foi possível salvar as configurações." });
    }
  }

  if (!meLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Configurações do Backend</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Configurações do Backend</h1>
            <p className="page-header__desc">
              Credenciais, endpoints de integração, conexões e parâmetros operacionais — persistidos no
              PostgreSQL. Acesso restrito a administradores.
            </p>
          </div>
        </div>
      </header>

      <section className="backend-config-page__controls" aria-label="Resumo">
        <div className="backend-config-page__summary">
          <div className="backend-config-page__summary-icon" aria-hidden="true">
            <i className="fa-solid fa-server" />
          </div>
          <div>
            <div className="backend-config-page__summary-title">Painel de infraestrutura</div>
            <p className="backend-config-page__summary-text">
              Todas as configurações são lidas do banco na inicialização da API. Alterações em conexões,
              Azure AD ou adaptadores exigem reinício do serviço. Valores secretos são mascarados na
              interface — deixe em branco ou mantenha {SECRET_MASK} para preservar o valor atual.
            </p>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="backend-config-page__toolbar">
            <div className="backend-config-page__tabs" role="tablist" aria-label="Categorias">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  className={`filter-chip${activeCategory === category.id ? " is-active" : ""}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="backend-config-page__save"
              onClick={() => void handleSave()}
              disabled={updateSettings.isPending || !activeSection}
            >
              <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
              {updateSettings.isPending ? "Salvando..." : "Salvar seção"}
            </button>
          </div>
        ) : null}
      </section>

      {feedback ? (
        <div
          className={`backend-config-page__alert backend-config-page__alert--${feedback.type}`}
          role="status"
        >
          {feedback.text}
        </div>
      ) : null}

      {isLoading ? <p className="page-empty-note">Carregando configurações...</p> : null}

      {isError ? (
        <div className="backend-config-page__alert backend-config-page__alert--warn">
          Não foi possível carregar as configurações. Verifique se a API está online e se você tem perfil
          Admin.
        </div>
      ) : null}

      {activeSection ? (
        <section className="backend-config-page__section" aria-labelledby="config-section-title">
          <div className="backend-config-page__section-head">
            <h2 id="config-section-title" className="backend-config-page__section-title">
              {activeSection.label}
            </h2>
            {activeSection.description ? (
              <p className="backend-config-page__section-desc">{activeSection.description}</p>
            ) : null}
          </div>

          {activeCategory === "integrations" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              Esta seção controla se a API chama sistemas reais. Com «Modo mock» em Sim, o worker{" "}
              <strong>graph-directory-sync</strong> sincroniza usuários fictícios do Graph dev
              (incluindo o perfil de Leonardo em Sistemas).
              Defina Não (false), salve e <strong>reinicie a API</strong> antes de rodar o worker novamente.
            </div>
          ) : null}

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              <strong>Mapeamento dos tokens (infra):</strong>
              <ul className="backend-config-page__token-map">
                <li>
                  <strong>App token (Lioconecta)</strong> → header <code>App-Token</code> — token rotulado
                  «Lioconecta» pela infra
                </li>
                <li>
                  <strong>User token (glpi_system_service)</strong> → header{" "}
                  <code>Authorization: user_token …</code> — token do usuário de serviço
                </li>
              </ul>
              Não inverta os dois campos. Salve e teste a conexão antes de desativar o modo mock em Integrações.
            </div>
          ) : null}

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Para abrir chamados pelo portal, cada colaborador precisa existir como usuário no GLPI com o{" "}
              <strong>mesmo e-mail corporativo</strong> cadastrado no LioConecta. Sem esse cadastro, a API retorna
              erro 422 ao criar ticket.
            </div>
          ) : null}

          {activeCategory === "glpi" && usesDevAdapters ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Modo mock ativo — credenciais GLPI abaixo são ignoradas até desativar o mock em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("integrations")}
              >
                Integrações
              </button>
              , reiniciar a API e testar novamente.
            </div>
          ) : null}

          {activeCategory === "graph" && usesDevAdapters ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Modo mock ativo — credenciais Graph abaixo são ignoradas pelo worker até desativar o mock em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("integrations")}
              >
                Integrações
              </button>
              , reiniciar a API e executar o sync novamente.
            </div>
          ) : null}

          {glpiTestFeedback && activeCategory === "glpi" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${glpiTestFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{glpiTestFeedback.title}</strong>
              {glpiTestFeedback.detail ? (
                <p className="backend-config-page__alert-detail">{glpiTestFeedback.detail}</p>
              ) : null}
            </div>
          ) : null}

          {activeCategory === "ldap" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              Configure o Active Directory corporativo. A conta de serviço (<code>ldap.bind_dn</code>) precisa de
              permissão de leitura na base de busca. Usuários normais autenticam com credencial LDAP; o super-admin
              local permanece disponível para bootstrap.
            </div>
          ) : null}

          {ldapTestFeedback && activeCategory === "ldap" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${ldapTestFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{ldapTestFeedback.title}</strong>
              {ldapTestFeedback.detail ? (
                <p className="backend-config-page__alert-detail">{ldapTestFeedback.detail}</p>
              ) : null}
            </div>
          ) : null}

          {activeCategory === "auth" ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Em produção use <code>auth.provider=ldap</code>. A chave <code>auth.jwt_signing_key</code> e as chaves{" "}
              <code>ldap.*</code> exigem reinício da API após alteração. E-mails em{" "}
              <code>auth.super_admin_emails</code> recebem role Admin no primeiro login LDAP.
            </div>
          ) : null}

          {activeCategory === "planner" && usesDevAdapters ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Modo mock ativo — Minhas Atividades usa tarefas fictícias. Desative o mock em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("integrations")}
              >
                Integrações
              </button>
              , reinicie a API e habilite o Planner abaixo.
            </div>
          ) : null}

          {activeCategory === "planner" && (draft[PLANNER_ENABLED_KEY] ?? "false") !== "true" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              Integração Planner desabilitada — a página Minhas Atividades ficará vazia até ativar «Planner —
              integração habilitada».
            </div>
          ) : null}

          {activeCategory === "planner" &&
          (!(draft[GRAPH_TENANT_KEY]?.trim()) ||
            !(draft[GRAPH_CLIENT_KEY]?.trim()) ||
            !(draft[GRAPH_SECRET_KEY]?.trim() && draft[GRAPH_SECRET_KEY] !== SECRET_MASK)) ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Credenciais Microsoft Graph não configuradas — o Planner reutiliza a mesma app registration. Configure
              em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("graph")}
              >
                Microsoft Graph
              </button>
              .
            </div>
          ) : null}

          {plannerTestFeedback && activeCategory === "planner" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${plannerTestFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{plannerTestFeedback.title}</strong>
              {plannerTestFeedback.detail ? (
                <p className="backend-config-page__alert-detail">{plannerTestFeedback.detail}</p>
              ) : null}
            </div>
          ) : null}

          {testFeedback && activeCategory === "graph" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${testFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{testFeedback.title}</strong>
              {testFeedback.detail ? <p className="backend-config-page__alert-detail">{testFeedback.detail}</p> : null}
            </div>
          ) : null}

          <div className="backend-config-page__fields">
            {activeSection.settings
              .filter(
                (setting) =>
                  setting.key !== "graph.directory_last_sync_utc" &&
                  setting.key !== "planner.last_sync_utc" &&
                  setting.key !== "planner.plan_title",
              )
              .map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={draft[setting.key] ?? setting.value}
                onChange={(next) => setDraft((current) => ({ ...current, [setting.key]: next }))}
              />
            ))}
          </div>

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestGlpiConnection()}
                disabled={testGlpiConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testGlpiConnection.isPending ? "Testando…" : "Testar conexão GLPI"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida <code>initSession</code> na API GLPI. Salve antes se alterou credenciais — o teste usa o
                formulário ou valores já persistidos no banco.
              </p>
            </div>
          ) : null}

          {activeCategory === "ldap" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestLdapConnection()}
                disabled={testLdapConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testLdapConnection.isPending ? "Testando…" : "Testar conexão LDAP"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida bind da conta de serviço em <code>{draft[LDAP_HOST_KEY] || "ldap.host"}</code>. Salve antes se
                alterou credenciais — o teste usa o formulário ou valores já persistidos no banco.
              </p>
            </div>
          ) : null}

          {activeCategory === "planner" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestPlannerConnection()}
                disabled={testPlannerConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testPlannerConnection.isPending ? "Testando…" : "Testar conexão Planner"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida acesso ao plano <code>{draft[PLANNER_PLAN_ID_KEY] || "…"}</code> via Graph. Requer permissão{" "}
                <code>Tasks.ReadWrite.All</code> (application). Salve antes se alterou o plan_id ou bucket padrão (
                <code>{PLANNER_DEFAULT_BUCKET_KEY}</code>).
              </p>
            </div>
          ) : null}

          {activeCategory === "graph" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestGraphConnection()}
                disabled={testGraphConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testGraphConnection.isPending ? "Testando…" : "Testar conexão Graph"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida OAuth e conta usuários <code>@liotecnica.com.br</code> no tenant. Salve antes se alterou
                credenciais — o teste usa o formulário ou valores já persistidos.
              </p>
            </div>
          ) : null}
        </section>
      ) : !isLoading && !isError ? (
        <div className="backend-config-page__empty">
          <i className="fa-solid fa-database" aria-hidden="true" />
          <p>Nenhuma configuração encontrada no banco.</p>
        </div>
      ) : null}

      <p className="page-empty-note">
        Fonte: tabela <code>app_settings</code> · bootstrap via variável{" "}
        <code>LIOSNECTA_BOOTSTRAP_DB</code>
      </p>
    </main>
  );
}
