import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isAdminUser } from "../../api/auth";
import { useAppSettings, useUpdateAppSettings } from "../../api/hooks/useAppSettings";
import { useMe } from "../../api/hooks/useMe";
import type { AppSettingCategoryDto, AppSettingDto } from "../../api/types";
import "../../styles/backend-config-page.css";

const SECRET_MASK = "********";

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
          type={setting.isSecret ? "password" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          placeholder={setting.isSecret && !setting.hasValue ? "Informe o valor secreto" : undefined}
        />
      )}
    </div>
  );
}

export function BackendConfigPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: categories = [], isLoading, isError } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const [activeCategory, setActiveCategory] = useState<string>("database");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "warn" | "info"; text: string } | null>(
    null,
  );

  const isAdmin = isAdminUser(me);

  useEffect(() => {
    if (categories.length > 0) {
      setDraft(buildDraft(categories));
      if (!categories.some((c) => c.id === activeCategory)) {
        setActiveCategory(categories[0]?.id ?? "database");
      }
    }
  }, [categories, activeCategory]);

  const activeSection = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? categories[0],
    [categories, activeCategory],
  );

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
          <div className="backend-config-page__fields">
            {activeSection.settings.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={draft[setting.key] ?? setting.value}
                onChange={(next) => setDraft((current) => ({ ...current, [setting.key]: next }))}
              />
            ))}
          </div>
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
