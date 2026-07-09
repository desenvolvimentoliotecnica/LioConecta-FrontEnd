import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { ApiError } from "../../api/client";
import { useAppSettings, useUpdateAppSettings } from "../../api/hooks/useAppSettings";
import { useTestGraphConnection } from "../../api/hooks/useGraphConfig";
import { useTestPlannerConnection } from "../../api/hooks/usePlannerConfig";
import { useTestGlpiConnection } from "../../api/hooks/useGlpiConfig";
import { useTestLdapConnection } from "../../api/hooks/useLdapConfig";
import { useTestChatConnection } from "../../api/hooks/useChat";
import { useTestCalendarConnection } from "../../api/hooks/useCalendar";
import { OrganogramDepartmentsConfigSection } from "../admin/OrganogramDepartmentsConfigSection";
import { BackendConfigHelpModal, ConfigSectionHead } from "../admin/backendConfigHelp";
import { LoopProjetosSettingsSection } from "../admin/LoopProjetosSettingsSection";
import { CompassSettingsSection } from "../admin/CompassSettingsSection";
import { UniLioSettingsSection } from "../admin/UniLioSettingsSection";
import { MenuEditorSettingsSection } from "../admin/MenuEditorSettingsSection";
import { PortalUiSettingsSection } from "../admin/PortalUiSettingsSection";
import { RamaisSettingsSection } from "../admin/RamaisSettingsSection";
import { BeneficiosSettingsSection } from "../admin/BeneficiosSettingsSection";
import { SystemsSettingsSection } from "../admin/SystemsSettingsSection";
import type { AppSettingCategoryDto, AppSettingDto } from "../../api/types";
import { DEPRECATED_ACCESS_SETTING_KEYS } from "../../config/rbac/permissions";
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
const PLANNER_ENABLED_KEY = "planner.enabled";
const PLANNER_PLAN_ID_KEY = "planner.plan_id";
const PLANNER_DEFAULT_BUCKET_KEY = "planner.default_bucket_id";
const CALENDAR_ENABLED_KEY = "calendar.enabled";
const CALENDAR_TOKEN_ENCRYPTION_KEY = "calendar.token_encryption_key";
const AZURE_AD_CLIENT_KEY = "azure_ad.client_id";
const AZURE_AD_TENANT_KEY = "azure_ad.tenant_id";
const ORGANOGRAM_MODULE_ID = "organogram";
const LOOP_MODULE_ID = "loop";
const COMPASS_MODULE_ID = "compass";
const UNILIO_MODULE_ID = "unilio";
const CARDAPIO_MODULE_ID = "cardapio";
const PORTAL_UI_MODULE_ID = "portal-ui";
const RAMAIS_MODULE_ID = "ramais";
const BENEFICIOS_MODULE_ID = "beneficios-rh";
const SYSTEMS_MODULE_ID = "systems";

const DOMAIN_MODULE_TABS = [
  { id: ORGANOGRAM_MODULE_ID, label: "Organograma" },
  { id: LOOP_MODULE_ID, label: "Loop de Projetos" },
  { id: COMPASS_MODULE_ID, label: "Compass IBP" },
  { id: UNILIO_MODULE_ID, label: "UniLio" },
  { id: CARDAPIO_MODULE_ID, label: "Cardápio" },
  { id: RAMAIS_MODULE_ID, label: "Ramais" },
  { id: BENEFICIOS_MODULE_ID, label: "Benefícios RH" },
  { id: SYSTEMS_MODULE_ID, label: "Sistemas" },
  { id: PORTAL_UI_MODULE_ID, label: "Portal UI" },
] as const;

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
  const { hasPermission, isLoading: meLoading } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.admin.settingsManage);
  const { data: categories = [], isLoading, isError } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const testGraphConnection = useTestGraphConnection();
  const testPlannerConnection = useTestPlannerConnection();
  const testGlpiConnection = useTestGlpiConnection();
  const testLdapConnection = useTestLdapConnection();
  const testChatConnection = useTestChatConnection();
  const testCalendarConnection = useTestCalendarConnection();
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

  const [chatTestFeedback, setChatTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);

  const [calendarTestFeedback, setCalendarTestFeedback] = useState<{
    type: "success" | "error";
    title: string;
    detail?: string | null;
  } | null>(null);

  const [helpCategory, setHelpCategory] = useState<string | null>(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && DOMAIN_MODULE_TABS.some((tab) => tab.id === categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    }

    if (categories.length > 0) {
      setDraft(buildDraft(categories));
      if (
        categoryFromUrl &&
        categories.some((category) => category.id === categoryFromUrl)
      ) {
        setActiveCategory(categoryFromUrl);
      } else if (
        !categories.some((c) => c.id === activeCategory) &&
        !DOMAIN_MODULE_TABS.some((tab) => tab.id === activeCategory)
      ) {
        setActiveCategory(categories[0]?.id ?? "database");
      }
    }
  }, [categories, activeCategory, searchParams]);

  const isDomainModule = DOMAIN_MODULE_TABS.some((tab) => tab.id === activeCategory);

  const activeSection = useMemo(
    () =>
      isDomainModule
        ? undefined
        : categories.find((category) => category.id === activeCategory) ?? categories[0],
    [categories, activeCategory, isDomainModule],
  );

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

  async function handleTestChatConnection() {
    setChatTestFeedback(null);
    try {
      const clientSecret = draft[GRAPH_SECRET_KEY]?.trim();
      const result = await testChatConnection.mutateAsync({
        tenantId: draft[GRAPH_TENANT_KEY]?.trim() || null,
        clientId: draft[GRAPH_CLIENT_KEY]?.trim() || null,
        clientSecret:
          clientSecret && clientSecret !== SECRET_MASK ? clientSecret : null,
      });
      setChatTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch (error) {
      setChatTestFeedback({
        type: "error",
        title: "Falha ao testar integração do chat Teams.",
        detail: apiErrorDetail(error),
      });
    }
  }

  async function handleTestCalendarConnection() {
    setCalendarTestFeedback(null);
    try {
      const tokenEncryptionKey = draft[CALENDAR_TOKEN_ENCRYPTION_KEY]?.trim();
      const result = await testCalendarConnection.mutateAsync({
        tokenEncryptionKey:
          tokenEncryptionKey && tokenEncryptionKey !== SECRET_MASK ? tokenEncryptionKey : null,
      });
      setCalendarTestFeedback({
        type: result.success ? "success" : "error",
        title: result.message,
        detail: result.detail,
      });
    } catch (error) {
      setCalendarTestFeedback({
        type: "error",
        title: "Falha ao testar integração do calendário Outlook.",
        detail: apiErrorDetail(error),
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
              {DOMAIN_MODULE_TABS.map((moduleTab) => (
                <button
                  key={moduleTab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === moduleTab.id}
                  className={`filter-chip${activeCategory === moduleTab.id ? " is-active" : ""}`}
                  onClick={() => setActiveCategory(moduleTab.id)}
                >
                  {moduleTab.label}
                </button>
              ))}
            </div>
            {!isDomainModule ? (
              <button
                type="button"
                className="backend-config-page__save"
                onClick={() => void handleSave()}
                disabled={updateSettings.isPending || !activeSection}
              >
                <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
                {updateSettings.isPending ? "Salvando..." : "Salvar seção"}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="backend-config-page__modules" aria-label="Configurações por módulo">
          <p className="backend-config-page__modules-title">Configurações por módulo</p>
          <Link
            to="/admin/governanca/organograma"
            className={`backend-config-page__module-card${activeCategory === ORGANOGRAM_MODULE_ID ? " is-active" : ""}`}
            onClick={() => setActiveCategory(ORGANOGRAM_MODULE_ID)}
          >
            <span className="backend-config-page__module-card-icon" aria-hidden="true">
              <i className="fa-solid fa-sitemap" />
            </span>
            <span className="backend-config-page__module-card-title">Governança do organograma</span>
            <span className="backend-config-page__module-card-text">
              Posições, departamentos, importação do Graph e permissões de edição — persistidos no domínio do
              organograma (fora de app_settings).
            </span>
          </Link>
          <Link to="/admin/email/config" className="backend-config-page__module-card">
            <span className="backend-config-page__module-card-icon" aria-hidden="true">
              <i className="fa-solid fa-envelope" />
            </span>
            <span className="backend-config-page__module-card-title">E-mail — SMTP</span>
            <span className="backend-config-page__module-card-text">
              Host, credenciais e parâmetros de retry da fila transacional.
            </span>
          </Link>
          <Link to="/admin/totvs-rm" className="backend-config-page__module-card">
            <span className="backend-config-page__module-card-icon" aria-hidden="true">
              <i className="fa-solid fa-database" />
            </span>
            <span className="backend-config-page__module-card-title">TOTVS RM — Ponto</span>
            <span className="backend-config-page__module-card-text">
              Conexão SQL Server read-only para espelho de ponto e holerite.
            </span>
          </Link>
        </div>
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

      {activeCategory === ORGANOGRAM_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="organogram-module-title">
          <ConfigSectionHead
            titleId="organogram-module-title"
            title="Organograma — governança manual"
            description={
              <>
                O organograma exibido no portal pode divergir do Microsoft Graph/AD. As regras de edição, importação e
                posições são configuradas no painel dedicado abaixo — não nesta tabela <code>app_settings</code>.
              </>
            }
            helpCategoryId={ORGANOGRAM_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
            Após importar do Graph, alterações manuais são preservadas nas reimportações. Ative a governança e defina
            quem pode editar antes de liberar o modo edição no organograma.
          </div>

          <div className="backend-config-page__module-actions">
            <Link
              className="backend-config-page__module-link backend-config-page__module-link--primary"
              to="/admin/governanca/organograma"
            >
              <i className="fa-solid fa-table-list" aria-hidden="true" />
              Abrir gestão
            </Link>
            <Link
              className="backend-config-page__module-link"
              to="/admin/governanca/organograma?tab=configuracoes"
            >
              <i className="fa-solid fa-sliders" aria-hidden="true" />
              Permissões e comportamento
            </Link>
            <Link className="backend-config-page__module-link" to="/pessoas/organograma?view=full">
              <i className="fa-solid fa-diagram-project" aria-hidden="true" />
              Ver organograma
            </Link>
          </div>

          <OrganogramDepartmentsConfigSection />
        </section>
      ) : null}

      {activeCategory === LOOP_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="loop-module-title">
          <ConfigSectionHead
            titleId="loop-module-title"
            title="Loop de Projetos — módulo"
            description="Habilita ou desabilita o módulo Loop no portal. Permissões de acesso são gerenciadas em Controle de acesso (RBAC)."
            helpCategoryId={LOOP_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/loop">
              <i className="fa-solid fa-infinity" aria-hidden="true" />
              Abrir Loop de Projetos
            </Link>
          </div>

          <LoopProjetosSettingsSection />
        </section>
      ) : null}

      {activeCategory === COMPASS_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="compass-module-title">
          <ConfigSectionHead
            titleId="compass-module-title"
            title="Compass IBP — módulo"
            description="Habilita ou desabilita o módulo Compass no portal. Permissões de acesso são gerenciadas em Controle de acesso (RBAC)."
            helpCategoryId={COMPASS_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/compass">
              <i className="fa-solid fa-compass" aria-hidden="true" />
              Abrir Compass IBP
            </Link>
          </div>

          <CompassSettingsSection />
        </section>
      ) : null}

      {activeCategory === UNILIO_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="unilio-module-title">
          <ConfigSectionHead
            titleId="unilio-module-title"
            title="UniLio — módulo"
            description="Habilita ou desabilita o portal UniLio. Permissões de acesso são gerenciadas em Controle de acesso (RBAC)."
            helpCategoryId={UNILIO_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/unilio">
              <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
              Abrir UniLio
            </Link>
          </div>

          <UniLioSettingsSection />
        </section>
      ) : null}

      {activeCategory === CARDAPIO_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="cardapio-module-title">
          <ConfigSectionHead
            titleId="cardapio-module-title"
            title="Cardápio — envio semanal"
            description="Destinatários padrão do e-mail semanal. Quem edita o cardápio é definido em Controle de acesso (RBAC)."
            helpCategoryId={CARDAPIO_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/servicos/cardapio">
              <i className="fa-solid fa-utensils" aria-hidden="true" />
              Abrir Gestão de cardápio
            </Link>
          </div>

          <MenuEditorSettingsSection />
        </section>
      ) : null}

      {activeCategory === RAMAIS_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="ramais-module-title">
          <ConfigSectionHead
            titleId="ramais-module-title"
            title="Ramais — gestão da lista"
            description="Permissões de gestão da lista de ramais foram migradas para Controle de acesso (RBAC)."
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/pessoas/ramais">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              Abrir Lista de Ramais
            </Link>
          </div>

          <RamaisSettingsSection />
        </section>
      ) : null}

      {activeCategory === BENEFICIOS_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="beneficios-module-title">
          <ConfigSectionHead
            titleId="beneficios-module-title"
            title="Benefícios — permissões de gestão"
            description="Permissões de gestão de benefícios foram migradas para Controle de acesso (RBAC)."
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link className="backend-config-page__module-link backend-config-page__module-link--primary" to="/servicos/beneficios/gestao">
              <i className="fa-solid fa-gift" aria-hidden="true" />
              Abrir Gestão de benefícios
            </Link>
          </div>

          <BeneficiosSettingsSection />
        </section>
      ) : null}

      {activeCategory === SYSTEMS_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="systems-module-title">
          <ConfigSectionHead
            titleId="systems-module-title"
            title="Sistemas — permissões de gestão"
            description="Permissões de gestão do hub de sistemas foram migradas para Controle de acesso (RBAC)."
            helpCategoryId={SYSTEMS_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <div className="backend-config-page__module-actions">
            <Link
              className="backend-config-page__module-link backend-config-page__module-link--primary"
              to="/servicos/acesso-sistemas"
            >
              <i className="fa-solid fa-table-cells" aria-hidden="true" />
              Abrir Hub de Sistemas
            </Link>
          </div>

          <SystemsSettingsSection />
        </section>
      ) : null}

      {activeCategory === PORTAL_UI_MODULE_ID ? (
        <section className="backend-config-page__section" aria-labelledby="portal-ui-module-title">
          <ConfigSectionHead
            titleId="portal-ui-module-title"
            title="Portal UI — maturidade e roadmap"
            description="Controle os badges de maturidade na topbar e o roadmap do que já foi implementado versus pendências."
            helpCategoryId={PORTAL_UI_MODULE_ID}
            onOpenHelp={setHelpCategory}
          />

          <PortalUiSettingsSection />
        </section>
      ) : null}

      {activeSection ? (
        <section className="backend-config-page__section" aria-labelledby="config-section-title">
          <ConfigSectionHead
            titleId="config-section-title"
            title={activeSection.label}
            description={activeSection.description}
            helpCategoryId={activeCategory}
            onOpenHelp={setHelpCategory}
          />

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              <strong>Mapeamento dos tokens (infra):</strong>
              <ul className="backend-config-page__token-map">
                <li>
                  <strong>Token API / App token (Lioconecta)</strong> → campo <strong>App token</strong> — header{" "}
                  <code>App-Token</code>
                </li>
                <li>
                  <strong>Token serviço / User token (glpi_system_service)</strong> → campo <strong>User token</strong>{" "}
                  — header <code>Authorization: user_token …</code>
                </li>
              </ul>
              Não inverta os dois campos (o rótulo «API» da infra vai no App token, «serviço» no User token). Salve e
              teste a conexão.
            </div>
          ) : null}

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              <strong>Perfil GLPI (profiles_id):</strong> use <code>0</code> para não trocar perfil, ou o ID que o
              usuário de serviço realmente possui (ex.: Gestor = <code>7</code>). Super-Admin (<code>4</code>) só
              funciona se esse perfil estiver atribuído ao usuário do token — caso contrário o teste de conexão falhava
              com «Item não encontrado».
            </div>
          ) : null}

          {activeCategory === "glpi" ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Para abrir chamados pelo portal, cada colaborador precisa existir como usuário no GLPI com o{" "}
              <strong>mesmo e-mail corporativo</strong> cadastrado no LioConecta. Sem esse cadastro, a API retorna
              erro 422 ao criar ticket.
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
              <code>auth.super_admin_emails</code> recebem a regra Admin no primeiro login LDAP.
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

          {activeCategory === "chat" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              O chat interno usa Microsoft Graph com permissões delegadas. Configure o app registration em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("graph")}
              >
                Microsoft Graph
              </button>{" "}
              e o provedor de login em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("azure_ad")}
              >
                Azure AD
              </button>
              . Cada colaborador vincula a própria conta do Teams na primeira utilização.
            </div>
          ) : null}

          {chatTestFeedback && activeCategory === "chat" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${chatTestFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{chatTestFeedback.title}</strong>
              {chatTestFeedback.detail ? (
                <p className="backend-config-page__alert-detail">{chatTestFeedback.detail}</p>
              ) : null}
            </div>
          ) : null}

          {activeCategory === "azure_ad" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              <p>
                Credenciais MSAL do portal (chat Teams e calendário Outlook) vêm desta seção — não use variáveis{" "}
                <code>VITE_AZURE_*</code> no frontend. Preencha tenant e client ID da app registration SPA.
              </p>
            </div>
          ) : null}

          {activeCategory === "calendar" && (draft[CALENDAR_ENABLED_KEY] ?? "false") !== "true" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              Integração de calendário desabilitada — a página <code>/calendario</code> exibirá aviso até ativar
              «Calendário Outlook — habilitado».
            </div>
          ) : null}

          {activeCategory === "calendar" ? (
            <div className="backend-config-page__alert backend-config-page__alert--info" role="note">
              A chave <code>calendar.token_encryption_key</code> é obrigatória para armazenar tokens Outlook dos
              usuários — independente da configuração do Teams Chat.
            </div>
          ) : null}

          {activeCategory === "calendar" &&
          (!(draft[AZURE_AD_TENANT_KEY]?.trim()) || !(draft[AZURE_AD_CLIENT_KEY]?.trim())) ? (
            <div className="backend-config-page__alert backend-config-page__alert--warn" role="note">
              Azure AD não configurado — configure tenant e client ID em{" "}
              <button
                type="button"
                className="backend-config-page__inline-link"
                onClick={() => setActiveCategory("azure_ad")}
              >
                Azure AD
              </button>
              . O calendário usa permissões delegadas <code>Calendars.ReadWrite</code>.
            </div>
          ) : null}

          {calendarTestFeedback && activeCategory === "calendar" ? (
            <div
              className={`backend-config-page__alert backend-config-page__alert--${calendarTestFeedback.type === "success" ? "success" : "error"}`}
              role="status"
            >
              <strong>{calendarTestFeedback.title}</strong>
              {calendarTestFeedback.detail ? (
                <p className="backend-config-page__alert-detail">{calendarTestFeedback.detail}</p>
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
                  setting.key !== "planner.plan_title" &&
                  !setting.key.startsWith("chat.teams.last_test") &&
                  !setting.key.startsWith("calendar.last_test") &&
                  !DEPRECATED_ACCESS_SETTING_KEYS.includes(
                    setting.key as (typeof DEPRECATED_ACCESS_SETTING_KEYS)[number],
                  ),
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

          {activeCategory === "chat" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestChatConnection()}
                disabled={testChatConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testChatConnection.isPending ? "Testando…" : "Testar integração Chat Teams"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida bootstrap, escopos delegados e conectividade com o Graph para o chat interno. Requer Graph e
                Azure AD configurados.
              </p>
            </div>
          ) : null}

          {activeCategory === "calendar" ? (
            <div className="backend-config-page__actions">
              <button
                type="button"
                className="backend-config-page__test"
                onClick={() => void handleTestCalendarConnection()}
                disabled={testCalendarConnection.isPending}
              >
                <i className="fa-solid fa-plug-circle-check" aria-hidden="true" />
                {testCalendarConnection.isPending ? "Testando…" : "Testar conexão Calendário"}
              </button>
              <p className="backend-config-page__actions-hint">
                Valida Azure AD, scopes delegados e <code>calendar.token_encryption_key</code>. O teste usa o formulário
                ou valores já persistidos — salve após validar. Usuários vinculam a conta Microsoft em{" "}
                <code>/calendario</code>.
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

      <BackendConfigHelpModal
        categoryId={helpCategory}
        open={helpCategory !== null}
        onClose={() => setHelpCategory(null)}
      />
    </main>
  );
}
